#!/bin/bash
set -e

# ============================================================
# start.sh — 启动 方太Agent智能中台 服务
# 用法: ./start.sh [port]
# 默认端口: ${PORT:-9002}
#
# 流程: 检查环境 → 检查端口 → 杀旧进程 → 构建 → 启动
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${1:-${PORT:-9002}}"
PID_FILE=".pid"
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/app.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---- 打印横幅 ----
echo ""
echo "=============================================="
echo "  方太Agent智能中台 — 启动服务"
echo "=============================================="
echo ""

# ============================================================
# Step 1: 检查环境依赖
# ============================================================
log_info ">>> Step 1/5: 检查环境依赖"

# Node.js
if ! command -v node &>/dev/null; then
  log_error "未找到 Node.js，请先安装 Node.js >= 18"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
log_info "Node.js 版本: $(node -v)"
if [ "$NODE_VERSION" -lt 18 ]; then
  log_error "Node.js 版本过低（当前 $(node -v)），需要 >= 18"
  exit 1
fi

# npm
if ! command -v npm &>/dev/null; then
  log_error "未找到 npm，请先安装 npm"
  exit 1
fi
log_info "npm 版本: $(npm -v)"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
  log_warn "node_modules 不存在，正在安装依赖..."
  npm install
fi

log_info "环境依赖检查通过"

# ============================================================
# Step 2: 检查并处理端口占用
# ============================================================
log_info ">>> Step 2/5: 检查端口 $PORT"

kill_by_port() {
  local port="$1"
  local pids

  pids=$(lsof -ti:"$port" 2>/dev/null) ||
  pids=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K\d+') ||
  pids=$(fuser "$port/tcp" 2>/dev/null) ||
  true

  if [ -z "$pids" ]; then
    return 0
  fi

  log_warn "端口 $port 已被占用，正在清理..."

  for pid in $pids; do
    log_warn "终止进程 $pid ..."
    kill -15 "$pid" 2>/dev/null || true
    sleep 1

    if kill -0 "$pid" 2>/dev/null; then
      log_warn "强制终止进程 $pid ..."
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
    fi

    if kill -0 "$pid" 2>/dev/null; then
      log_error "无法终止进程 $pid，请手动处理"
      exit 1
    fi
    log_info "进程 $pid 已终止"
  done
}

kill_by_port "$PORT"
log_info "端口 $PORT 可用"

# ============================================================
# Step 3: 杀掉旧进程（PID 文件兜底）
# ============================================================
log_info ">>> Step 3/5: 清理旧进程"

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    log_warn "发现旧进程 $OLD_PID，正在终止..."
    kill -15 "$OLD_PID" 2>/dev/null || true
    sleep 2
    kill -9 "$OLD_PID" 2>/dev/null || true
    log_info "旧进程 $OLD_PID 已终止"
  fi
  rm -f "$PID_FILE"
fi

log_info "旧进程清理完成"

# ============================================================
# Step 4: 环境配置
# ============================================================
log_info ">>> Step 4/5: 检查环境配置"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    log_warn ".env 文件不存在，已从 .env.example 复制"
    log_warn "请编辑 .env 填入真实配置后重新启动"
    cp .env.example .env
  else
    log_warn ".env 文件不存在，创建空配置"
    cat > .env <<'ENVEOF'
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:PORT_PLACEHOLDER"
ENVEOF
    sed -i "s/PORT_PLACEHOLDER/$PORT/g" .env
  fi
fi

if grep -q "YOUR_GEMINI_API_KEY" .env 2>/dev/null; then
  log_warn "GEMINI_API_KEY 尚未配置，AI 归因功能将使用确定性模板兜底"
fi

# 将端口写入 .env（覆盖已有的 PORT 配置）
if grep -q "^PORT=" .env 2>/dev/null; then
  sed -i "s/^PORT=.*/PORT=$PORT/" .env
else
  echo "PORT=$PORT" >> .env
fi

log_info "环境配置就绪"

# ============================================================
# Step 5: 构建并启动
# ============================================================
log_info ">>> Step 5/5: 构建并启动服务"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 构建
log_info "正在构建项目..."
npm run build 2>&1 | tee "$LOG_DIR/build.log" || {
  log_error "构建失败，请查看 $LOG_DIR/build.log"
  exit 1
}
log_info "构建完成"

# 启动服务
log_info "正在启动服务（端口 $PORT）..."
export NODE_ENV=production
nohup node dist/server.cjs > "$LOG_FILE" 2>&1 &
APP_PID=$!
echo "$APP_PID" > "$PID_FILE"

# 等待服务就绪
sleep 3

if kill -0 "$APP_PID" 2>/dev/null; then
  log_info "服务启动成功 (PID: $APP_PID)"
else
  log_error "服务启动失败，请查看日志: $LOG_FILE"
  cat "$LOG_FILE"
  rm -f "$PID_FILE"
  exit 1
fi

echo ""
echo "=============================================="
echo "  方太Agent智能中台 已启动"
echo "=============================================="
echo "  端口:     $PORT"
echo "  PID:      $APP_PID"
echo "  日志:     $LOG_FILE"
echo "  访问:     http://localhost:$PORT"
echo "  停止:     ./stop.sh $PORT"
echo "  查看日志: tail -f $LOG_FILE"
echo "=============================================="

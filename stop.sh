#!/bin/bash
set -e

# ============================================================
# stop.sh — 停止 Agent智能中台 服务
# 用法: ./stop.sh [port]
# 默认端口: ${PORT:-9002}
# ============================================================

PORT="${1:-${PORT:-9002}}"
PID_FILE=".pid"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

kill_by_port() {
  local port="$1"
  local pids

  # 尝试多种方式查找占用端口的进程
  pids=$(lsof -ti:"$port" 2>/dev/null) ||
  pids=$(ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K\d+') ||
  pids=$(fuser "$port/tcp" 2>/dev/null) ||
  true

  if [ -z "$pids" ]; then
    return 1
  fi

  for pid in $pids; do
    log_warn "发现端口 $port 被进程 $pid 占用，正在终止..."
    kill -15 "$pid" 2>/dev/null || true
    sleep 1

    if kill -0 "$pid" 2>/dev/null; then
      log_warn "进程 $pid 未响应 SIGTERM，强制终止..."
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
    fi

    if kill -0 "$pid" 2>/dev/null; then
      log_error "无法终止进程 $pid"
    else
      log_info "进程 $pid 已终止"
    fi
  done

  return 0
}

echo "=============================================="
echo "  Agent智能中台 — 停止服务"
echo "=============================================="
echo ""

STOPPED_ANY=false

# 停止主服务端口
if kill_by_port "$PORT"; then
  STOPPED_ANY=true
else
  log_info "端口 $PORT 未被占用"
fi

# 同时检查开发端口
if kill_by_port "9001"; then
  STOPPED_ANY=true
else
  log_info "端口 9001 未被占用（开发模式前端端口）"
fi

# 清理 PID 文件
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
    log_info "已清理 PID 文件记录的进程 $PID"
  fi
  rm -f "$PID_FILE"
fi

if [ "$STOPPED_ANY" = true ]; then
  log_info "服务已停止"
else
  log_info "没有正在运行的服务"
fi

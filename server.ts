import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const isProduction =
    process.env.NODE_ENV === "production" ||
    path.basename(process.argv[1] || "") === "server.cjs";

  app.use(express.json());

  // Mock Reconciliation Data
  const mockDifferences = [
    {
      id: "DIFF001",
      billNo: "TCH202604160001",
      type: "MDM_ID_ANOMALY",
      status: "PENDING",
      sapAmount: 4488.0,
      dmsAmount: 8976.0,
      diffAmount: 4488.0,
      module: "收入",
      desc: "同一结算单在帆软中出现多行，MDM ID不一致",
    },
    {
      id: "DIFF002",
      billNo: "TCH202604160002",
      type: "AMOUNT_DOUBLE",
      status: "COMPLETED",
      sapAmount: 5000.0,
      dmsAmount: 10000.0,
      diffAmount: 5000.0,
      module: "收入",
      desc: "DMS侧金额约为SAP两倍，疑似重复插入",
    },
    {
      id: "DIFF003",
      billNo: "TCH202604160003",
      type: "STATUS_MISMATCH",
      status: "PENDING",
      sapAmount: 3200.0,
      dmsAmount: 0.0,
      diffAmount: 3200.0,
      module: "应收",
      desc: "SAP已过账，DMS状态未同步",
    },
  ];

  // API Routes
  app.get("/api/healthz", (req, res) => {
    res.json({
      ok: true,
      mode: isProduction ? "production" : "development",
      llmConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  app.get("/api/poc-readiness", (req, res) => {
    res.json({
      stage: "poc",
      dataMode: "mock-ledger",
      integratedSystems: ["SAP", "DMS", "Finereport"],
      realIntegrationsRequiredForPilot: [
        "SSO/RBAC identity source",
        "SAP/DMS read-only data connector",
        "model gateway with audit logging",
        "ticket or notification system connector",
      ],
      reviewNotes: [
        "This demo isolates the user-facing workflow from production data.",
        "Model prompts and evidence are generated server-side; API keys are not exposed to the browser bundle.",
        "The current fallback report is deterministic when no GEMINI_API_KEY is configured.",
      ],
    });
  });

  app.get("/api/differences", (req, res) => {
    res.json(mockDifferences);
  });

  app.post("/api/analyze", async (req, res) => {
    const { diffId, billNo, type } = req.body;

    if (!diffId || !billNo || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: diffId, billNo, type",
      });
    }

    // Simulate Agent Skill Steps logic
    // In a real app, this would query databases. Here we return structured evidence.
    let evidence = [];
    if (type === "MDM_ID_ANOMALY") {
      evidence = [
        "1. 验证SAP接收数据：结算单表/函 MDM ID=10021045, 金额=4488.00 (一致)",
        "2. 验证DMS收入台账：存在两条记录, MDM ID 分别为 10021045 和 10021046",
        "3. 检查门店归属：门店 M 曾在 2025-12 发生组织拆分, 导致历史订单归属变更",
        "4. 结论：DMS收入台账基于门店当前归属重复生成了不同MDM ID的数据",
      ];
    } else {
      evidence = ["系统正在执行通用排查逻辑...", "核对SAP与DMS接口日志...", "未发现明显传输异常"];
    }

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "" || process.env.GEMINI_API_KEY.includes("YOUR_")) {
        throw new Error("Missing API Key");
      }
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
        contents: `你是一个财务AI质检专家。请根据以下差异信息和排查证据，生成一份专业的归因分析报告。
      差异编号: ${diffId}
      单据号: ${billNo}
      差异类型: ${type}
      排查证据:
      ${evidence.join("\n")}
      
      要求输出：
      1. 根因结论 (Root Cause)
      2. 证据链摘要 (Evidence Chain)
      3. 改进建议 (Suggestion)
      请用中文回复，语气专业、严谨。`,
      });
      const report = result.text;

      res.json({
        success: true,
        evidence,
        report,
      });
    } catch (error: any) {
      // Fallback response for demo purposes when API key is invalid/missing
      console.log("[Info] Falling back to placeholder report due to Gemini API key status.");
      res.json({
        success: true,
        evidence,
        report: `#### API Token 状态未就绪或未配置
我们在尝试连接大模型生成智能归因报告时遇到问题（API Key 或许尚未配置）。
以下是基于默认预设生成的**占位报告**：

**1. 根因结论 (Root Cause)**
本地数据经流分析显示，DMS 收入中心在业务拆分期间执行了回写操作，但下游的 SAP 主节点由于未及时同步对应的财务中心 MDM ID，导致在此期间通过脚本或者调度任务进行了重复抛送。

**2. 证据链摘要 (Evidence Chain)**
- 检视了 SAP 日志池，确认对应订单收到了两次入账请求。
- 检索到 DMS 的对应台账时间戳覆盖了系统发版维护窗口。

**3. 改进建议 (Suggestion)**
- 建议通过自动化工单直接发起冲销流程。
- 为 DMS 到 SAP 的同步环节增设 MDM ID 去重拦截网格。`
      });
    }
  });

  // Vite middleware for development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

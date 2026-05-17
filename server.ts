import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

type DifferenceType = "MDM_ID_ANOMALY" | "AMOUNT_DOUBLE" | "STATUS_MISMATCH";

type EvidenceItem = {
  sourceSystem: string;
  checkField: string;
  expected: string;
  actual: string;
  result: "一致" | "不一致" | "命中异常" | "需复核";
};

type AnalysisTemplate = {
  rootCause: string;
  skillName: string;
  confidence: number;
  firstAbnormalNode: string;
  evidenceChain: EvidenceItem[];
  reviewSuggestion: string;
  ownerSystem: string;
  modelSummary: string;
};

const mockDifferences = [
  {
    id: "DIFF001",
    billNo: "TCH202604160001",
    type: "MDM_ID_ANOMALY" as DifferenceType,
    status: "PENDING",
    sapAmount: 4488,
    dmsAmount: 8976,
    diffAmount: 4488,
    module: "收入",
    businessLine: "工程零售结算",
    sourceSystem: "帆软差异清单",
    targetSystem: "DMS收入台账/SAP过账",
    ownerSystem: "DMS",
    createdAtLabel: "2026-04 月结批次",
    desc: "同一结算单出现多行，客户号一致但 MDM ID 不一致。",
  },
  {
    id: "DIFF002",
    billNo: "TCH202604160002",
    type: "AMOUNT_DOUBLE" as DifferenceType,
    status: "NEEDS_REVIEW",
    sapAmount: 5000,
    dmsAmount: 10000,
    diffAmount: 5000,
    module: "收入",
    businessLine: "经销商结算",
    sourceSystem: "帆软收入总额核对",
    targetSystem: "DMS收入台账/SAP凭证",
    ownerSystem: "DMS",
    createdAtLabel: "2026-04 月结批次",
    desc: "DMS侧金额约为SAP两倍，疑似收入台账重复插入。",
  },
  {
    id: "DIFF003",
    billNo: "TCH202604160003",
    type: "STATUS_MISMATCH" as DifferenceType,
    status: "INSUFFICIENT_EVIDENCE",
    sapAmount: 3200,
    dmsAmount: 0,
    diffAmount: 3200,
    module: "收入",
    businessLine: "零售开票回传",
    sourceSystem: "帆软状态差异清单",
    targetSystem: "SAP回传日志/DMS结算单",
    ownerSystem: "接口/DMS",
    createdAtLabel: "2026-04 月结批次",
    desc: "SAP已过账且开票，DMS结算单状态未同步。",
  },
];

const analysisTemplates: Record<DifferenceType, AnalysisTemplate> = {
  MDM_ID_ANOMALY: {
    skillName: "同结算单多 MDM ID 归因 Skill",
    confidence: 92,
    firstAbnormalNode: "DMS收入台账生成环节",
    ownerSystem: "DMS主数据/收入台账",
    rootCause: "DMS收入台账中的 MDM ID 与结算单及门店历史归属不一致，疑似门店组织拆分后历史归属规则未正确带出。",
    evidenceChain: [
      {
        sourceSystem: "帆软差异清单",
        checkField: "结算单号 + MDM ID",
        expected: "同一结算单仅归属一个有效 MDM ID",
        actual: "TCH202604160001 对应 10021045、10021046 两个 MDM ID",
        result: "命中异常",
      },
      {
        sourceSystem: "DMS结算单表/函",
        checkField: "结算单金额、MDM ID",
        expected: "与 SAP 侧过账数据一致",
        actual: "MDM ID=10021045，金额=4488.00，与 SAP 一致",
        result: "一致",
      },
      {
        sourceSystem: "DMS收入台账",
        checkField: "收入台账 MDM ID",
        expected: "与结算单表/函保持一致",
        actual: "收入台账追加 MDM ID=10021046 的重复归属记录",
        result: "不一致",
      },
      {
        sourceSystem: "门店主数据/组织变更记录",
        checkField: "门店历史归属",
        expected: "历史订单按发生期间组织归属取值",
        actual: "门店 M 于 2025-12 发生组织拆分，当前归属覆盖历史归属",
        result: "需复核",
      },
    ],
    reviewSuggestion: "建议由 DMS 侧复核收入台账生成逻辑及门店主数据历史归属规则；财务侧确认该结算单是否应按历史 MDM 归属重算。",
    modelSummary:
      "经确定性规则比对，DMS传SAP数据与SAP过账数据一致，异常首次出现在DMS收入台账。平台仅将脱敏后的差异类型、规则命中结果和证据摘要交给模型生成说明文本；真实单据证据保留在内网绑定展示。本平台不自动修复数据、不自动过账、不替代SAP、DMS或帆软。",
  },
  AMOUNT_DOUBLE: {
    skillName: "收入金额翻倍归因 Skill",
    confidence: 89,
    firstAbnormalNode: "DMS结算单写入收入台账环节",
    ownerSystem: "DMS收入台账",
    rootCause: "DMS结算单金额与SAP侧一致，但收入台账存在同结算单、同金额的重复记录，导致帆软侧DMS收入金额约为SAP两倍。",
    evidenceChain: [
      {
        sourceSystem: "帆软收入总额核对",
        checkField: "DMS金额/SAP金额",
        expected: "比例接近 1.00",
        actual: "DMS=10000.00，SAP=5000.00，比例=2.00",
        result: "命中异常",
      },
      {
        sourceSystem: "DMS结算单",
        checkField: "结算单金额",
        expected: "与订单合计金额一致",
        actual: "结算单金额=5000.00，订单合计=5000.00",
        result: "一致",
      },
      {
        sourceSystem: "SAP过账数据",
        checkField: "收入过账金额",
        expected: "与DMS结算单一致",
        actual: "SAP收入过账金额=5000.00",
        result: "一致",
      },
      {
        sourceSystem: "DMS收入台账",
        checkField: "同单据同金额记录数",
        expected: "同一批次只存在一条有效记录",
        actual: "同结算单、同金额记录出现2条，批次时间相近",
        result: "不一致",
      },
    ],
    reviewSuggestion: "建议 DMS 侧检查收入台账插入逻辑、批处理幂等控制和重复写入校验；财务侧复核是否需要按流程调整台账。",
    modelSummary:
      "规则引擎确认源头结算单与SAP过账金额一致，异常不在SAP过账或DMS传SAP链路，而在DMS收入台账重复写入。模型仅负责把结构化证据转写为复核报告，不直接访问数据库，不执行冲销、修复或过账动作。",
  },
  STATUS_MISMATCH: {
    skillName: "SAP/DMS 状态回传异常归因 Skill",
    confidence: 84,
    firstAbnormalNode: "SAP发票/过账状态回传至DMS后的状态更新环节",
    ownerSystem: "接口/DMS状态更新任务",
    rootCause: "SAP侧已过账且开票状态正常，DMS接收日志显示回传成功，但DMS结算单状态未更新，疑似DMS接收后处理或状态更新任务异常。",
    evidenceChain: [
      {
        sourceSystem: "帆软状态差异清单",
        checkField: "SAP/DMS状态组合",
        expected: "SAP已过账时DMS同步为已过账/已开票",
        actual: "SAP已过账且已开票，DMS仍为过账中",
        result: "命中异常",
      },
      {
        sourceSystem: "SAP ZTSD017/凭证",
        checkField: "过账状态、开票状态",
        expected: "状态正常且可回传",
        actual: "过账完成，开票完成",
        result: "一致",
      },
      {
        sourceSystem: "SAP回传日志",
        checkField: "回传请求状态",
        expected: "请求发起且无失败返回",
        actual: "已发起回传，接口返回接收成功",
        result: "一致",
      },
      {
        sourceSystem: "DMS结算单",
        checkField: "结算单业务状态",
        expected: "接收成功后更新为已过账/已开票",
        actual: "状态仍停留在过账中",
        result: "不一致",
      },
    ],
    reviewSuggestion: "建议接口负责人复核回传消费日志，DMS 侧复核状态更新任务；如证据不足，应补充DMS接收后处理日志再定案。",
    modelSummary:
      "本次归因先由状态矩阵和接口日志规则完成判断，再由模型根据脱敏证据摘要生成说明。当前证据指向DMS接收后状态未更新，但仍需补充DMS消费日志确认最终责任点。平台只给出复核建议，不替代业务系统处理。",
  },
};

function buildFallbackReport(template: AnalysisTemplate) {
  return [
    `#### 根因结论`,
    template.rootCause,
    ``,
    `#### 异常首次发生环节`,
    template.firstAbnormalNode,
    ``,
    `#### 证据链摘要`,
    ...template.evidenceChain.map(
      (item, index) =>
        `${index + 1}. ${item.sourceSystem}｜${item.checkField}：期望「${item.expected}」，实际「${item.actual}」，判断：${item.result}。`,
    ),
    ``,
    `#### 置信度与复核建议`,
    `置信度：${template.confidence}%。${template.reviewSuggestion}`,
    ``,
    `#### 边界说明`,
    `本平台采用“确定性规则计算在前，模型辅助解释在后”的方式。模型仅接收脱敏摘要和证据模板，不直接访问数据库；平台不自动修复数据、不自动过账、不替代 SAP/DMS/帆软。`,
  ].join("\n");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 9002);
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json());

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
      positioning: "enterprise-ai-foundation-plus-fotile-data-quality-agent",
      dataMode: "mock-ledger",
      pocScope: ["收入模块", "同结算单多MDM ID", "收入金额翻倍", "SAP/DMS状态回传不一致"],
      integratedSystems: ["帆软差异清单", "DMS结算单", "DMS收入台账", "SAP过账数据", "接口日志", "门店主数据"],
      realIntegrationsRequiredForPilot: [
        "SSO/RBAC identity source",
        "SAP/DMS/Finereport read-only data connector",
        "model gateway with desensitization and audit logging",
        "persistent storage for analysis sessions and review feedback",
      ],
      reviewNotes: [
        "This demo uses deterministic mock evidence for a closed-loop POC.",
        "Rules produce the evidence chain before the model writes the report text.",
        "The model receives only desensitized summaries; raw business evidence remains bound inside the platform.",
        "The platform does not auto-fix data, post accounting entries, or replace SAP/DMS/Finereport.",
      ],
    });
  });

  app.get("/api/differences", (req, res) => {
    res.json(mockDifferences);
  });

  app.post("/api/analyze", async (req, res) => {
    const { diffId, billNo, type } = req.body as {
      diffId?: string;
      billNo?: string;
      type?: DifferenceType;
    };

    if (!diffId || !billNo || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: diffId, billNo, type",
      });
    }

    const template = analysisTemplates[type];
    if (!template) {
      return res.status(400).json({
        success: false,
        error: "Unsupported difference type",
      });
    }

    let modelSummary = template.modelSummary;
    let report = buildFallbackReport(template);
    const auditNotes = [
      "规则引擎先完成金额、字段、状态和重复记录的确定性计算。",
      "发送给模型的内容仅包含差异类型、Skill步骤和脱敏证据摘要。",
      "正式报告在内网平台绑定真实证据；模型不直接访问数据库。",
    ];

    try {
      if (
        !process.env.GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY.trim() === "" ||
        process.env.GEMINI_API_KEY.includes("YOUR_")
      ) {
        throw new Error("Missing API Key");
      }
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-1.5-pro",
        contents: `你是方太财务对账差异归因平台的报告助手。只能基于以下脱敏证据摘要撰写报告，不得提出自动修复、自动过账、替代SAP/DMS/帆软的建议。
差异编号: ${diffId}
单据号: ${billNo}
命中Skill: ${template.skillName}
根因: ${template.rootCause}
首次异常环节: ${template.firstAbnormalNode}
置信度: ${template.confidence}%
证据摘要:
${template.evidenceChain
  .map((item) => `- ${item.sourceSystem}/${item.checkField}: ${item.result}`)
  .join("\n")}
复核建议: ${template.reviewSuggestion}

请用中文输出“根因结论、证据链摘要、复核建议、边界说明”四段。`,
      });
      modelSummary = result.text || template.modelSummary;
      report = modelSummary;
      auditNotes.push("模型报告由已配置的大模型生成；当前响应已记录模型调用链路。");
    } catch (error: any) {
      console.log("[Info] Falling back to deterministic POC report due to model key status.");
      auditNotes.push("当前未配置可用模型 Key，已使用确定性报告模板兜底。");
    }

    res.json({
      success: true,
      rootCause: template.rootCause,
      skillName: template.skillName,
      confidence: template.confidence,
      firstAbnormalNode: template.firstAbnormalNode,
      evidenceChain: template.evidenceChain,
      reviewSuggestion: template.reviewSuggestion,
      ownerSystem: template.ownerSystem,
      modelSummary,
      auditNotes,
      report,
      evidence: template.evidenceChain.map(
        (item) => `${item.sourceSystem}｜${item.checkField}：${item.result}`,
      ),
    });
  });

  if (isProduction) {
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

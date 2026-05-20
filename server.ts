// 方太 Agent 中台 + 数据质检 Agent POC
// server.ts 仅承担路由层：编排请求 → Agent Runtime → 返回 Run/Trace
// 真实业务逻辑全部下沉到 agent/* 子模块。

import express from "express";
import path from "path";
import dotenv from "dotenv";

import { dataQualityAgent } from "./agent/agents/data-quality-agent.js";
import { runAgent } from "./agent/runtime/runtime.js";
import { traceStore } from "./agent/runtime/trace.js";
import { seedTraceStore } from "./agent/runtime/seed.js";
import { connectors } from "./agent/connectors/index.js";
import {
  acknowledgeInterfaceAlert,
  getInterfaceLog,
  getInterfaceMonitorSummary,
  listBusinessSystems,
  listInterfaceAlerts,
  listInterfaceDefinitions,
  listInterfaceLogs,
  listRelatedInterfaceLogs,
} from "./agent/connectors/interface-monitor.js";
import { listSkills } from "./agent/skills/registry.js";
import { listTools } from "./agent/tools/registry.js";
import { resolveProvider } from "./agent/model/gateway.js";
import type { DiffRecord } from "./agent/runtime/types.js";
import { registerWorkflowRoutes } from "./agent/workflows/routes.js";
import { workflowRepository } from "./agent/workflows/jsonRepository.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 9002);
  const isProduction = process.env.NODE_ENV === "production";

  app.use(express.json());

  // ============== 平台基础 ==============

  app.get("/api/healthz", (_req, res) => {
    const resolved = resolveProvider();
    res.json({
      ok: true,
      mode: isProduction ? "production" : "development",
      llmConfigured: resolved.provider !== "fallback_template",
      gateway: {
        provider: resolved.provider,
        model: resolved.model,
        forced: (process.env.MODEL_PROVIDER || "auto").toLowerCase(),
      },
      runtime: {
        agents: 1,
        skills: listSkills().length,
        tools: listTools().length,
        runs: traceStore.list(200).length,
      },
    });
  });

  app.get("/api/poc-readiness", (_req, res) => {
    res.json({
      stage: "poc",
      positioning: "fotile-agent-hub-with-data-quality-agent-v3",
      dataMode: "fixture-connector",
      pocScope: ["收入模块", "同结算单多MDM ID", "收入金额翻倍", "SAP/DMS状态回传不一致"],
      hubComponents: [
        "Agent Runtime",
        "Skill Hub",
        "Tool Registry",
        "Model Gateway",
        "Memory (session+case minimal)",
        "Trace & Eval",
        "Connector Hub (excel_import only in POC)",
        "Governance (RBAC scaffold)",
      ],
      realIntegrationsRequiredForPilot: [
        "SSO/RBAC identity source",
        "SAP/DMS/Finereport read-only data connector",
        "model gateway with desensitization and audit logging",
        "persistent storage for analysis sessions and review feedback",
      ],
      reviewNotes: [
        "POC 用 fixture connector 模拟外部系统，不连真实 SAP/DMS/帆软。",
        "Runtime 真实跑 Plan → Tool → Rule → Model → Review 步骤。",
        "模型仅接收脱敏摘要；未配置 Key 时使用确定性兜底模板。",
        "平台不自动修复、不自动过账、不替代 SAP/DMS/帆软。",
      ],
    });
  });

  // ============== Agent 中台元数据接口（演示「中台」概念）==============

  app.get("/api/agents", (_req, res) => {
    const runs = traceStore.list(200).filter((r) => r.agentCode === dataQualityAgent.code);
    const successCount = runs.filter((r) => r.status === "SUCCESS").length;
    const reviewCount = runs.filter((r) => r.status === "NEEDS_REVIEW").length;
    const avgConf =
      runs.length === 0
        ? 0
        : Math.round(
            runs.reduce((s, r) => s + (r.confidence ?? 0), 0) / runs.length,
          );
    const avgDuration =
      runs.length === 0
        ? 0
        : Math.round(
            runs.reduce((s, r) => s + (r.durationMs ?? 0), 0) / runs.length,
          );
    res.json([
      {
        code: dataQualityAgent.code,
        displayName: dataQualityAgent.displayName,
        domain: dataQualityAgent.domain,
        executionMode: dataQualityAgent.executionMode,
        defaultSkills: dataQualityAgent.defaultSkills,
        planner: dataQualityAgent.planner,
        status: "online",
        version: "v1.0.0",
        owner: "财务对账组 / 数据治理组",
        description:
          "聚焦收入模块差异归因，按业务 Skill 执行规则计算、证据链生成和人工复核闭环。",
        metrics: {
          totalRuns: runs.length,
          successCount,
          reviewCount,
          avgConfidence: avgConf,
          avgDurationMs: avgDuration,
        },
      },
      {
        code: "ar_quality_agent",
        displayName: "应收质检 Agent",
        domain: "应收账款异常归因",
        executionMode: "workflow",
        defaultSkills: ["receivable_aging_anomaly", "credit_limit_breach"],
        planner: { type: "rule_then_model", rules: [] },
        status: "planning",
        version: "v0.1.0",
        owner: "应收账款组",
        description: "二期规划：覆盖账龄、信用额度、坏账准备的差异归因。",
        metrics: null,
      },
      {
        code: "contract_quality_agent",
        displayName: "合同资产质检 Agent",
        domain: "合同与资产配比",
        executionMode: "workflow",
        defaultSkills: ["contract_revenue_match", "asset_lifecycle_check"],
        planner: { type: "rule_then_model", rules: [] },
        status: "planning",
        version: "v0.1.0",
        owner: "财务核算组",
        description: "二期规划：合同收入与资产折旧的多周期一致性核查。",
        metrics: null,
      },
      {
        code: "inventory_quality_agent",
        displayName: "外库存质检 Agent",
        domain: "外仓与渠道库存",
        executionMode: "workflow",
        defaultSkills: ["dms_wms_inventory_diff", "channel_inventory_aging"],
        planner: { type: "rule_then_model", rules: [] },
        status: "planning",
        version: "v0.1.0",
        owner: "供应链 IT",
        description: "三期规划：WMS / DMS / 渠道库存的多源比对与积压预警。",
        metrics: null,
      },
    ]);
  });

  app.get("/api/skills", (_req, res) => {
    res.json(
      listSkills().map((s) => ({
        code: s.code,
        displayName: s.displayName,
        version: s.version,
        owner: s.owner,
        applicableWhen: s.applicableWhen,
        inputsDesc: s.inputsDesc,
        stepCount: s.steps.length,
        reportTemplateId: s.reportTemplateId,
        evalSetId: s.evalSetId,
        steps: s.steps.map((step) => ({
          id: step.id,
          desc: step.desc,
          tool: step.tool,
          ruleCode: step.ruleCode,
        })),
      })),
    );
  });

  app.get("/api/tools", (_req, res) => {
    res.json(
      listTools().map((t) => ({
        name: t.name,
        version: t.version,
        category: t.category,
        description: t.description,
        connector: t.connector,
        dataSensitivity: t.dataSensitivity,
        sideEffect: t.sideEffect,
        owner: t.owner,
        inputSchema: t.inputSchema,
        outputSchema: t.outputSchema,
      })),
    );
  });

  // ============== 业务接口：差异清单（兼容旧前端）==============

  app.get("/api/differences", (_req, res) => {
    const diffs = connectors.finereport.queryDiffList();
    res.json(diffs);
  });

  // ============== 接口日志监控：业务系统接入、日志查看与告警 ==============

  app.get("/api/interface-systems", (_req, res) => {
    res.json(listBusinessSystems());
  });

  app.get("/api/interface-definitions", (_req, res) => {
    res.json(listInterfaceDefinitions());
  });

  app.get("/api/interface-monitor/summary", (_req, res) => {
    res.json(getInterfaceMonitorSummary());
  });

  app.get("/api/interface-logs", (req, res) => {
    const { system, interfaceCode, status, businessKey, from, to } = req.query;
    res.json(
      listInterfaceLogs({
        system: typeof system === "string" ? system : undefined,
        interfaceCode: typeof interfaceCode === "string" ? interfaceCode : undefined,
        status: typeof status === "string" ? status : undefined,
        businessKey: typeof businessKey === "string" ? businessKey : undefined,
        from: typeof from === "string" ? from : undefined,
        to: typeof to === "string" ? to : undefined,
      }),
    );
  });

  app.get("/api/interface-logs/related", (req, res) => {
    const businessKey = typeof req.query.businessKey === "string" ? req.query.businessKey : "";
    if (!businessKey) return res.status(400).json({ error: "Missing required query: businessKey" });
    res.json(listRelatedInterfaceLogs(businessKey));
  });

  app.get("/api/interface-logs/:id", (req, res) => {
    const log = getInterfaceLog(req.params.id);
    if (!log) return res.status(404).json({ error: "Interface log not found" });
    res.json(log);
  });

  app.get("/api/interface-alerts", (_req, res) => {
    res.json(listInterfaceAlerts());
  });

  app.post("/api/interface-alerts/:id/ack", (req, res) => {
    const alert = acknowledgeInterfaceAlert(req.params.id);
    if (!alert) return res.status(404).json({ error: "Interface alert not found" });
    res.json(alert);
  });

  // ============== 业务接口：触发 Agent 归因 ==============

  app.post("/api/analyze", async (req, res) => {
    const { diffId, billNo, type } = (req.body ?? {}) as {
      diffId?: string;
      billNo?: string;
      type?: string;
    };

    if (!diffId || !billNo || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: diffId, billNo, type",
      });
    }

    const allDiffs = connectors.finereport.queryDiffList();
    let diff = allDiffs.find((d) => d.id === diffId) as unknown as DiffRecord | undefined;
    if (!diff) {
      // 兼容前端导入流程：临时构造一条 DiffRecord
      diff = {
        id: String(diffId),
        billNo: String(billNo),
        type: type as DiffRecord["type"],
        module: "导入质检池",
        sapAmount: Number(req.body.sapAmount ?? 0),
        dmsAmount: Number(req.body.dmsAmount ?? 0),
        diffAmount: Number(req.body.diffAmount ?? 0),
        businessLine: "财务导入",
        sourceSystem: "USER_IMPORT",
        targetSystem: "SAP_S4",
        ownerSystem: "导入",
      };
    }

    try {
      const { run } = await runAgent({
        agent: dataQualityAgent,
        diff,
        triggeredBy: "finance_reviewer",
      });

      // 同时保留旧前端所需的字段名兼容
      res.json({
        success: true,
        runId: run.id,
        skillName: run.skillCode,
        rootCause: run.rootCause,
        firstAbnormalNode: run.firstAbnormalNode,
        confidence: run.confidence,
        reviewSuggestion: `复核路由：${(run.reviewRoutes ?? []).join("、")}`,
        ownerSystem: diff.ownerSystem,
        modelSummary: run.reportText,
        report: run.reportText,
        evidenceChain: run.steps
          .filter((s) => s.stepType === "tool_call" || s.stepType === "rule")
          .flatMap((s) => {
            const out = s.output as Record<string, unknown> | undefined;
            return Array.isArray(out) ? out : [out];
          })
          .filter(Boolean) as unknown as Array<unknown>,
        evidence: deriveEvidenceLines(run.id),
        auditNotes: deriveAuditNotes(run),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // ============== Trace 接口（V3.0 新增核心能力）==============

  app.get("/api/runs", (_req, res) => {
    const runs = traceStore.list(50).map((r) => ({
      id: r.id,
      agentCode: r.agentCode,
      skillCode: r.skillCode,
      billNo: r.billNo,
      diffId: r.diffId,
      status: r.status,
      confidence: r.confidence,
      rootCause: r.rootCause,
      firstAbnormalNode: r.firstAbnormalNode,
      reviewRoutes: r.reviewRoutes,
      durationMs: r.durationMs,
      createdAt: r.createdAt,
      finishedAt: r.finishedAt,
      stepCount: r.steps.length,
    }));
    res.json(runs);
  });

  app.get("/api/runs/:id", (req, res) => {
    const run = traceStore.get(req.params.id);
    if (!run) return res.status(404).json({ error: "Run not found" });
    res.json(run);
  });

  // ============== Workflow 模板 DAG ==============
  registerWorkflowRoutes(app);

  // ============== 静态资源（生产模式）==============

  if (isProduction) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fotile Agent Hub server running on http://localhost:${PORT}`);
    void workflowRepository.seedIfEmpty().catch((err) => console.warn("[workflows] seed failed:", err));
    // 启动后异步种入演示 Run，让 Trace 页面默认就有数据，
    // 失败不影响服务正常启动。
    void seedTraceStore()
      .then((r) => {
        if (!r.skipped) {
          console.log(`[seed] 已为 Trace 页面预先生成 ${r.seeded} 条历史 Run`);
        }
      })
      .catch((err) => console.warn("[seed] 失败：", err));
  });
}

function deriveEvidenceLines(runId: string): string[] {
  const run = traceStore.get(runId);
  if (!run) return [];
  const lines: string[] = [];
  for (const step of run.steps) {
    if (step.stepType === "plan") {
      lines.push(`[Plan] ${step.desc}`);
    } else if (step.stepType === "tool_call" || step.stepType === "rule") {
      lines.push(`[${step.toolName ?? step.stepType}] ${step.desc}${step.ruleHit ? ` ✓ 命中规则 ${step.ruleHit}` : ""}`);
    } else if (step.stepType === "model") {
      lines.push(`[Model] ${step.desc}`);
    } else if (step.stepType === "review_route") {
      const out = step.output as { reviewRoutes?: string[] };
      lines.push(`[Review] 复核路由：${(out?.reviewRoutes ?? []).join("、")}`);
    }
  }
  return lines;
}

function deriveAuditNotes(run: { steps: { stepType: string; output?: unknown }[] }): string[] {
  const notes: string[] = [
    "规则引擎先完成金额、字段、状态和重复记录的确定性计算。",
    "发送给模型的内容仅包含差异类型、Skill 步骤和脱敏证据摘要。",
    "正式报告在内网平台绑定真实证据；模型不直接访问数据库。",
  ];
  const modelStep = run.steps.find((s) => s.stepType === "model");
  if (modelStep) {
    const out = modelStep.output as { mode?: string };
    if (out?.mode === "fallback") {
      notes.push("当前未配置可用模型 Key 或调用失败，已使用确定性报告模板兜底。");
    } else if (out?.mode === "model") {
      notes.push("模型报告由 Model Gateway 路由到已配置大模型生成，调用链路已记录。");
    }
  }
  return notes;
}

startServer();

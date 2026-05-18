// AgentsView 与 wizard 共享类型定义

export type AgentStatus = "online" | "planning" | "paused";

export interface AgentMetrics {
  totalRuns: number;
  successCount: number;
  reviewCount: number;
  avgConfidence: number;
  avgDurationMs: number;
}

export interface AgentMeta {
  code: string;
  displayName: string;
  domain: string;
  executionMode: string;
  defaultSkills: string[];
  planner: {
    type: string;
    rules?: Array<{ whenDiffType?: string; useSkill?: string }>;
  };
  status: AgentStatus;
  version: string;
  owner: string;
  description: string;
  metrics: AgentMetrics | null;
}

export interface ToolApi {
  name: string;
  version: string;
  category: string;
  description: string;
  connector: string;
  dataSensitivity: string;
  sideEffect: string;
  owner: string;
}

export interface SkillStepApi {
  id: string;
  desc: string;
  tool?: string;
  ruleCode?: string;
}

export interface SkillApi {
  code: string;
  displayName: string;
  version: string;
  owner: string;
  applicableWhen: { diffType: string; businessModule: string };
  inputsDesc: string[];
  stepCount: number;
  reportTemplateId: string;
  evalSetId: string;
  steps: SkillStepApi[];
}

export interface RunSummaryApi {
  id: string;
  agentCode: string;
  skillCode?: string;
  billNo: string;
  diffId: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | "NEEDS_REVIEW";
  confidence?: number;
  durationMs?: number;
  createdAt: string;
  finishedAt?: string;
  stepCount: number;
}

export interface GatewayInfo {
  provider: "deepseek" | "qwen" | "fallback_template";
  model: string;
  forced: string;
}

export interface HealthzInfo {
  ok: boolean;
  mode: string;
  llmConfigured: boolean;
  gateway: GatewayInfo;
  runtime: { agents: number; skills: number; tools: number; runs: number };
}

export interface WizardFormState {
  name: string;
  identity: string;
  systemPrompt: string;
  model: "deepseek" | "qwen";
  memoryStrategy: "window" | "summary" | "case_bank";
  selectedSkillCodes: string[];
  selectedToolNames: string[];
  sandboxMode: "strict" | "global_read_only";
  desensitize: boolean;
}

export const DEFAULT_DATA_QUALITY_FORM: WizardFormState = {
  name: "数据质检智能归因 Agent",
  identity:
    "负责对帆软已发现的收入差异执行类型识别、Skill 调度、确定性规则计算和证据链生成，模型仅在最后输出脱敏报告。",
  systemPrompt: `你是方太财务对账差异归因平台的报告助手。
请严格遵守以下规则：
1. 仅基于平台给出的脱敏证据撰写中文报告，禁止编造数据；
2. 禁止提出自动修复 / 自动过账 / 替代 SAP/DMS/帆软 的建议；
3. 报告固定输出五个标题：根因结论 / 异常首次发生环节 / 证据链摘要 / 复核建议 / 边界说明。`,
  model: "deepseek",
  memoryStrategy: "window",
  selectedSkillCodes: [
    "same_settlement_multiple_mdmid",
    "revenue_amount_doubled",
    "sap_dms_status_mismatch",
  ],
  selectedToolNames: [
    "finereport.query_diff_list",
    "dms.query_settlement",
    "dms.query_revenue_ledger",
    "sap.query_posting",
    "sap.query_interface_log",
    "master.query_store_history",
    "rule.eval_amount_compare",
    "rule.detect_duplicate",
    "rule.eval_status_matrix",
    "template.render_attribution_report",
    "notify.send_review_request",
  ],
  sandboxMode: "strict",
  desensitize: true,
};

export const EMPTY_FORM: WizardFormState = {
  name: "",
  identity: "",
  systemPrompt: "",
  model: "deepseek",
  memoryStrategy: "window",
  selectedSkillCodes: [],
  selectedToolNames: [],
  sandboxMode: "strict",
  desensitize: true,
};

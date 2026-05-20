export interface ReconciliationDifference {
  id: string;
  billNo: string;
  type: "MDM_ID_ANOMALY" | "AMOUNT_DOUBLE" | "STATUS_MISMATCH";
  status: "PENDING" | "COMPLETED" | "NEEDS_REVIEW" | "INSUFFICIENT_EVIDENCE";
  sapAmount: number;
  dmsAmount?: number;
  diffAmount: number;
  module: string;
  desc?: string;
  createdAt?: string;
  businessLine?: string;
  sourceSystem?: string;
  targetSystem?: string;
  ownerSystem?: string;
  createdAtLabel?: string;
}

export interface EvidenceItem {
  sourceSystem: string;
  checkField: string;
  expected: string;
  actual: string;
  result: "一致" | "不一致" | "命中异常" | "需复核";
}

export interface AnalysisResult {
  runId?: string;
  rootCause?: string;
  skillName?: string;
  confidence?: number;
  firstAbnormalNode?: string;
  evidenceChain?: EvidenceItem[];
  reviewSuggestion?: string;
  modelSummary?: string;
  auditNotes?: string[];
  evidence?: string[];
  report?: string;
  error?: string;
}

export type RunStepType = "plan" | "tool_call" | "rule" | "model" | "human" | "review_route";

export interface RunStep {
  seq: number;
  stepId: string;
  stepType: RunStepType;
  desc: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  ruleHit?: string;
  passed?: boolean;
  durationMs: number;
  createdAt: string;
}

export interface AgentRunSummary {
  id: string;
  agentCode: string;
  skillCode?: string;
  billNo: string;
  diffId: string;
  status: "RUNNING" | "SUCCESS" | "FAILED" | "NEEDS_REVIEW";
  confidence?: number;
  rootCause?: string;
  firstAbnormalNode?: string;
  reviewRoutes?: string[];
  durationMs?: number;
  createdAt: string;
  finishedAt?: string;
  stepCount: number;
}

export interface AgentRunDetail extends AgentRunSummary {
  reportText?: string;
  steps: RunStep[];
}

export interface ToolMeta {
  name: string;
  version: string;
  category: string;
  description: string;
  connector: string;
  dataSensitivity: string;
  sideEffect: string;
  owner: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export type InterfaceHealthStatus = "healthy" | "warning" | "critical";
export type InterfaceLogStatus = "SUCCESS" | "FAIL" | "TIMEOUT" | "RETRYING";
export type InterfaceAlertStatus = "open" | "acknowledged" | "resolved";
export type InterfaceAlertSeverity = "low" | "medium" | "high" | "critical";

export interface BusinessSystem {
  code: string;
  name: string;
  ownerDept: string;
  ownerRole: string;
  status: InterfaceHealthStatus;
  interfaceCount: number;
  lastHeartbeatAt: string;
}

export interface InterfaceDefinition {
  code: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  businessObject: string;
  frequency: "realtime" | "daily_batch" | "manual";
  ingestionMode: "API" | "ETL" | "API_ETL";
  dataScope: string;
  latestBatchNo: string;
  latestExtractAt: string;
  slaMinutes: number;
  owner: string;
  description: string;
}

export interface InterfaceLogRecord {
  id: string;
  interfaceCode: string;
  interfaceName: string;
  sourceSystem: string;
  targetSystem: string;
  businessKey: string;
  requestAt: string;
  responseAt?: string;
  durationMs: number;
  status: InterfaceLogStatus;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  payloadDigest: string;
  ingestionMode: "API" | "ETL" | "API_ETL";
  batchNo: string;
  extractedAt: string;
  originalBizDate: string;
  relatedDiffId?: string;
  relatedRunId?: string;
}

export interface InterfaceAlert {
  id: string;
  severity: InterfaceAlertSeverity;
  interfaceCode: string;
  interfaceName: string;
  businessKey?: string;
  title: string;
  reason: string;
  status: InterfaceAlertStatus;
  ownerRole: string;
  notifyChannels: Array<"in_app" | "dingtalk" | "email">;
  createdAt: string;
}

export interface InterfaceMonitorSummary {
  totalInterfaces: number;
  yesterdayLogCount: number;
  successRate: number;
  failureCount: number;
  timeoutCount: number;
  retryingCount: number;
  avgDurationMs: number;
  openAlerts: number;
  latestBatchNo: string;
  latestExtractAt: string;
  etlInterfaceCount: number;
  systemHealth: Array<{
    systemCode: string;
    status: InterfaceHealthStatus;
    successRate: number;
    failureCount: number;
  }>;
  interfaceHealth: Array<{
    interfaceCode: string;
    interfaceName: string;
    sourceSystem: string;
    targetSystem: string;
    status: InterfaceHealthStatus;
    successRate: number;
    failureCount: number;
    avgDurationMs: number;
  }>;
}

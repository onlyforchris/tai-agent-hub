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

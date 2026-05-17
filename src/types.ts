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

export interface ReconciliationDifference {
  id: string;
  billNo: string;
  type: string;
  status: "PENDING" | "COMPLETED";
  sapAmount: number;
  dmsAmount?: number;
  diffAmount: number;
  module: string;
  desc?: string;
  createdAt?: string;
  businessLine?: string;
  sourceSystem?: string;
  targetSystem?: string;
}

export interface AnalysisResult {
  evidence: string[];
  report: string;
  error?: string;
}

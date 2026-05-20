import type { ReconciliationDifference } from "@/src/types";

export const typeLabels: Record<ReconciliationDifference["type"], string> = {
  MDM_ID_ANOMALY: "同结算单多 MDM ID",
  AMOUNT_DOUBLE: "收入金额翻倍",
  STATUS_MISMATCH: "SAP/DMS 状态回传不一致",
};

export const statusLabels: Record<ReconciliationDifference["status"], string> = {
  PENDING: "待归因",
  COMPLETED: "已确认",
  NEEDS_REVIEW: "需复核",
  INSUFFICIENT_EVIDENCE: "证据不足",
};

export const statusStyles: Record<ReconciliationDifference["status"], string> = {
  PENDING: "bg-blue-50 text-blue-700 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  NEEDS_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  INSUFFICIENT_EVIDENCE: "bg-rose-50 text-rose-700 border-rose-100",
};

/** 业务化闭环步骤（演示与日常界面） */
export const closedLoopSteps = [
  "差异接入",
  "识别差异类型",
  "自动排查",
  "证据核对",
  "生成证据链",
  "生成说明报告",
  "人工复核",
];

/** 归因执行过程步骤（动画用） */
export const analysisProgressSteps = [
  { id: "identify", label: "识别差异类型", detail: "匹配排查方案与规则集" },
  { id: "dms", label: "核对 DMS 结算单", detail: "查询结算单与收入台账" },
  { id: "sap", label: "核对 SAP 过账", detail: "比对凭证金额与过账状态" },
  { id: "mdm", label: "核对主数据", detail: "检查 MDM ID 与组织变更" },
  { id: "log", label: "核对接口日志", detail: "追溯回传与同步记录" },
  { id: "evidence", label: "生成证据链", detail: "串联跨系统核对结果" },
  { id: "report", label: "生成说明报告", detail: "基于脱敏摘要组织归因说明" },
];

export const similarCaseHints: Partial<Record<ReconciliationDifference["type"], string>> = {
  MDM_ID_ANOMALY: "历史上 3 次同类差异，2 次为门店 MDM 变更导致",
  AMOUNT_DOUBLE: "历史上 5 次同类差异，4 次为收入台账重复插入",
  STATUS_MISMATCH: "历史上 4 次同类差异，3 次为回传接口超时重试",
};

export type WorkbenchTab = "todo" | "confirm" | "list" | "progress" | "cases" | "compare";

export type TodoFilter = "all" | "PENDING" | "NEEDS_REVIEW" | "INSUFFICIENT_EVIDENCE";

/** 日常主 Tab（不含价值对比） */
export const mainWorkbenchTabs: WorkbenchTab[] = ["todo", "confirm", "list", "progress", "cases"];

export const workbenchTabLabels: Record<WorkbenchTab, string> = {
  todo: "我的待办",
  confirm: "待我确认",
  list: "差异清单",
  progress: "月结进度",
  cases: "案例库",
  compare: "价值对比",
};

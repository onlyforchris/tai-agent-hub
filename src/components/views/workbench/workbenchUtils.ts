import type { ReconciliationDifference } from "@/src/types";

/** 等待时长（小时）；无接入时间时不展示（返回 null） */
export function getWaitHours(diff: ReconciliationDifference): number | null {
  if (!diff.createdAt) return null;
  const ms = Date.now() - new Date(diff.createdAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60)));
}

/** 按金额降序，同金额按等待时长降序 */
export function sortWorkbenchDiffs(a: ReconciliationDifference, b: ReconciliationDifference): number {
  const amountDiff = b.diffAmount - a.diffAmount;
  if (amountDiff !== 0) return amountDiff;
  const wa = getWaitHours(a) ?? 0;
  const wb = getWaitHours(b) ?? 0;
  return wb - wa;
}

export function batchProgressStats(
  differences: ReconciliationDifference[],
  pushRecordIds: Set<string>,
) {
  const total = differences.length;
  const completed = differences.filter((d) => d.status === "COMPLETED").length;
  const inProgress =
    differences.filter((d) => d.status === "NEEDS_REVIEW" || d.status === "INSUFFICIENT_EVIDENCE")
      .length +
    [...pushRecordIds].filter((id) => {
      const d = differences.find((x) => x.id === id);
      return d && d.status !== "COMPLETED";
    }).length;

  const numerator = completed + inProgress;
  const percent = total ? Math.round((numerator / total) * 100) : 0;
  return { total, completed, inProgress, numerator, percent };
}

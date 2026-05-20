import React from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Database,
  FileText,
  GitBranch,
  History,
  MessageSquare,
  RefreshCcw,
  Send,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { AnalysisResult, ReconciliationDifference } from "@/src/types";
import { AttributionProgressPanel } from "./AttributionProgressPanel";
import {
  similarCaseHints,
  statusLabels,
  typeLabels,
} from "./constants";

export interface PushRecord {
  assignee: string;
  pushedAt: string;
}

export type DetailViewMode = "pending" | "needs_review" | "insufficient" | "completed" | "awaiting_confirm";

export function resolveDetailView(diff: ReconciliationDifference, pushRecord?: PushRecord): DetailViewMode {
  if (pushRecord) return "awaiting_confirm";
  if (diff.status === "PENDING") return "pending";
  if (diff.status === "NEEDS_REVIEW") return "needs_review";
  if (diff.status === "INSUFFICIENT_EVIDENCE") return "insufficient";
  return "completed";
}

const viewMeta: Record<
  DetailViewMode,
  { title: string; subtitle: string; accent: string }
> = {
  pending: {
    title: "待归因",
    subtitle: "确认差异信息后，启动自动排查流程",
    accent: "border-blue-200 bg-blue-50 text-blue-800",
  },
  needs_review: {
    title: "需复核",
    subtitle: "查看归因报告，确认结论或推送责任方",
    accent: "border-amber-200 bg-amber-50 text-amber-800",
  },
  insufficient: {
    title: "证据不足",
    subtitle: "需补充跨系统证据后重新归因",
    accent: "border-rose-200 bg-rose-50 text-rose-800",
  },
  completed: {
    title: "已确认",
    subtitle: "差异已闭环，案例已沉淀",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  awaiting_confirm: {
    title: "待责任方确认",
    subtitle: "已推送钉钉通知，等待 DMS / SAP 负责人确认",
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  },
};

interface DiffDetailDrawerProps {
  open: boolean;
  diff: ReconciliationDifference;
  pushRecord?: PushRecord;
  isAnalyzing: boolean;
  progressStepIndex: number;
  analysisResult: AnalysisResult | null;
  onClose: () => void;
  onAnalyze: () => void;
  onConfirm: () => void;
  onReject: () => void;
  onPush: () => void;
  onRemind?: () => void;
}

function DiffSummary({ diff }: { diff: ReconciliationDifference }) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      <div>
        <div className="text-xs text-slate-400">单据号</div>
        <div className="mt-1 font-bold text-slate-900">{diff.billNo}</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">差异类型</div>
        <div className="mt-1 font-bold text-slate-900">{typeLabels[diff.type]}</div>
      </div>
      <div>
        <div className="text-xs text-slate-400">SAP / DMS</div>
        <div className="mt-1 font-mono text-xs font-bold text-slate-900">
          {diff.sapAmount.toLocaleString()} / {diff.dmsAmount?.toLocaleString() ?? "-"}
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-400">差异金额</div>
        <div className="mt-1 font-mono font-bold text-rose-700">¥{diff.diffAmount.toLocaleString()}</div>
      </div>
    </div>
  );
}

function AnalysisReportBody({
  diff,
  analysisResult,
  onConfirm,
  onReject,
  onPush,
  readOnly = false,
}: {
  diff: ReconciliationDifference;
  analysisResult: AnalysisResult;
  onConfirm: () => void;
  onReject: () => void;
  onPush: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/40 p-5">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-600">归因结论</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-lg font-bold leading-relaxed text-slate-900">{analysisResult.rootCause}</p>
            {!readOnly && (
              <p className="mt-2 text-xs font-bold text-amber-700">辅助归因，待人工确认 · 不自动修复数据</p>
            )}
          </div>
          <div className="rounded-lg border border-blue-200 bg-white px-4 py-3 text-center">
            <div className="text-xs font-bold text-slate-500">置信度</div>
            <div className="text-3xl font-bold text-blue-700">{analysisResult.confidence}%</div>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800">
          首个异常环节：{analysisResult.firstAbnormalNode}
        </div>
        {similarCaseHints[diff.type] && (
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {similarCaseHints[diff.type]}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-500">
          <Database className="h-4 w-4 text-blue-600" />
          结构化证据链
        </div>
        <div className="divide-y divide-slate-100">
          {analysisResult.evidenceChain?.map((item, index) => (
            <div key={`${item.sourceSystem}-${index}`} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[120px_1fr_1fr_80px]">
              <div className="font-bold text-slate-900">{item.sourceSystem}</div>
              <div className="text-slate-600">
                <span className="text-xs text-slate-400">{item.checkField}</span>
                <div>期望：{item.expected}</div>
              </div>
              <div className="text-slate-600">实际：{item.actual}</div>
              <div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold",
                    item.result === "一致" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                  )}
                >
                  {item.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-white">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-300">
          <MessageSquare className="h-4 w-4 text-blue-300" />
          说明报告（脱敏摘要）
        </div>
        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
          {analysisResult.report || analysisResult.modelSummary}
        </div>
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="h-4 w-4 text-blue-600" />
              人工复核
            </div>
            <p className="mt-1 text-sm text-slate-600">{analysisResult.reviewSuggestion}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReject}
              className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              退回复核
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              确认归因
            </button>
            <button
              type="button"
              onClick={onPush}
              className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              确认并推送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiffDetailDrawer({
  open,
  diff,
  pushRecord,
  isAnalyzing,
  progressStepIndex,
  analysisResult,
  onClose,
  onAnalyze,
  onConfirm,
  onReject,
  onPush,
  onRemind,
}: DiffDetailDrawerProps) {
  if (!open) return null;

  const viewMode = resolveDetailView(diff, pushRecord);
  const meta = viewMeta[viewMode];
  const hasReport = analysisResult && !analysisResult.error;

  return (
    <>
      <motion.button
        type="button"
        aria-label="关闭详情"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed bottom-0 right-0 top-16 z-[61] flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{meta.title}</h3>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", meta.accent)}>
                {pushRecord ? "待责任方确认" : statusLabels[diff.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">{diff.billNo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
          {viewMode === "pending" && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Brain className="h-4 w-4" />
              启动归因
            </button>
          )}
          {(viewMode === "needs_review" || viewMode === "insufficient") && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" />
              {hasReport ? "重新归因" : "加载归因报告"}
            </button>
          )}
          {viewMode === "awaiting_confirm" && (
            <button
              type="button"
              onClick={onRemind}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
            >
              <Send className="h-4 w-4" />
              催办确认
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <DiffSummary diff={diff} />

          {pushRecord && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                已推送 <span className="font-bold">{pushRecord.assignee}</span>，等待确认中
                <div className="mt-0.5 text-xs text-violet-700">{pushRecord.pushedAt}</div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-4">
              <AttributionProgressPanel activeStepIndex={progressStepIndex} isComplete={false} />
            </div>
          )}

          {!isAnalyzing && analysisResult?.error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-5 w-5" />
                分析失败
              </div>
              <p className="mt-2 text-sm">{analysisResult.error}</p>
            </div>
          )}

          {!isAnalyzing && viewMode === "pending" && !analysisResult && (
            <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
              <GitBranch className="mx-auto h-12 w-12 text-blue-600" />
              <h4 className="mt-4 font-bold text-slate-900">等待启动归因</h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                平台将按差异类型自动排查 DMS、SAP、主数据与接口日志，并生成证据链报告。
              </p>
            </div>
          )}

          {!isAnalyzing && viewMode === "needs_review" && !hasReport && (
            <div className="mt-6 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-8 text-center">
              <ClipboardCheck className="mx-auto h-12 w-12 text-amber-600" />
              <h4 className="mt-4 font-bold text-slate-900">归因已完成，待您复核</h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                该差异已完成自动排查。点击「加载归因报告」查看证据链与归因结论。
              </p>
              <button
                type="button"
                onClick={onAnalyze}
                className="mt-5 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
              >
                加载归因报告
              </button>
            </div>
          )}

          {!isAnalyzing && viewMode === "insufficient" && !hasReport && (
            <div className="mt-6 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-rose-600" />
              <h4 className="mt-4 font-bold text-slate-900">证据不足，需补充后重查</h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                上次复核认为现有证据无法支撑结论。请联系 {diff.ownerSystem} 负责人补充材料后重新归因。
              </p>
            </div>
          )}

          {!isAnalyzing && viewMode === "awaiting_confirm" && !hasReport && (
            <div className="mt-6 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
              <Send className="mx-auto h-12 w-12 text-violet-600" />
              <h4 className="mt-4 font-bold text-slate-900">等待责任方确认</h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                归因结论已推送，责任方可从钉钉链接查看证据。您可催办或查看历史报告。
              </p>
              {!hasReport && (
                <button
                  type="button"
                  onClick={onAnalyze}
                  className="mt-5 text-sm font-bold text-violet-700 hover:underline"
                >
                  查看归因报告
                </button>
              )}
            </div>
          )}

          {!isAnalyzing && viewMode === "completed" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
                <BookOpenCheck className="mx-auto h-12 w-12 text-emerald-600" />
                <h4 className="mt-4 font-bold text-slate-900">差异已确认并沉淀</h4>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                  该差异已闭环，同类问题可在案例库中快速匹配历史处理方式。
                </p>
              </div>
              {hasReport && (
                <AnalysisReportBody
                  diff={diff}
                  analysisResult={analysisResult}
                  onConfirm={onConfirm}
                  onReject={onReject}
                  onPush={onPush}
                  readOnly
                />
              )}
            </div>
          )}

          {!isAnalyzing && hasReport && viewMode !== "completed" && (
            <div className="mt-4">
              <AnalysisReportBody
                diff={diff}
                analysisResult={analysisResult}
                onConfirm={onConfirm}
                onReject={onReject}
                onPush={onPush}
                readOnly={viewMode === "awaiting_confirm"}
              />
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

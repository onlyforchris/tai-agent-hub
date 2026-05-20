import React from "react";
import { CalendarClock } from "lucide-react";
import type { TodoFilter } from "./constants";

export interface WorkbenchMetrics {
  pending: number;
  completed: number;
  review: number;
  insufficient: number;
  awaitingConfirm: number;
}

interface WorkbenchStatusPanelProps {
  todoCount: number;
  metrics: WorkbenchMetrics;
  batchLabel: string;
  batchNumerator: number;
  batchTotal: number;
  batchPercent: number;
  batchCompleted: number;
  batchInProgress: number;
  closingDaysLeft?: number | null;
  onOpenTodo?: () => void;
  onFilterTodo?: (filter: TodoFilter) => void;
}

export function WorkbenchStatusPanel({
  todoCount,
  metrics,
  batchLabel,
  batchNumerator,
  batchTotal,
  batchPercent,
  batchCompleted,
  batchInProgress,
  closingDaysLeft = null,
  onOpenTodo,
  onFilterTodo,
}: WorkbenchStatusPanelProps) {
  const chip = (filter: TodoFilter, label: string, count: number) => (
    <button
      type="button"
      onClick={() => {
        onOpenTodo?.();
        onFilterTodo?.(filter);
      }}
      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    >
      {label} {count}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
      <div className="flex min-w-[240px] flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <CalendarClock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{batchLabel}</span>
            {closingDaysLeft != null && closingDaysLeft > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
                关账倒计时 {closingDaysLeft} 天
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="relative h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                style={{ width: `${batchPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold tabular-nums text-slate-600">
              {batchNumerator}/{batchTotal} · {batchPercent}%
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            已确认 {batchCompleted} · 进行中 {batchInProgress}
          </p>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-slate-200 sm:block" />

      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenTodo}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onOpenTodo) {
              e.preventDefault();
              onOpenTodo();
            }
          }}
          className="group cursor-pointer rounded text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500/30"
        >
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">待处理</div>
          <div className="text-2xl font-bold tabular-nums text-blue-700">{todoCount}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {chip("PENDING", "待归因", metrics.pending)}
            {chip("NEEDS_REVIEW", "需复核", metrics.review)}
            {metrics.insufficient > 0 && chip("INSUFFICIENT_EVIDENCE", "证据不足", metrics.insufficient)}
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">已确认</div>
          <div className="text-2xl font-bold tabular-nums text-emerald-700">{metrics.completed}</div>
        </div>
      </div>
    </div>
  );
}

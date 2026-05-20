import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  Clock,
  ListTodo,
  Square,
  CheckSquare,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { AnalysisResult, ReconciliationDifference } from "@/src/types";
import { BatchAnalyzeModal, type BatchAnalyzeProgress } from "./workbench/BatchAnalyzeModal";
import { BeforeAfterCompare } from "./workbench/BeforeAfterCompare";
import { DiffDetailDrawer, type PushRecord } from "./workbench/DiffDetailDrawer";
import { DingTalkPushModal } from "./workbench/DingTalkPushModal";
import { WorkbenchStatusPanel } from "./workbench/WorkbenchStatusPanel";
import { CollapsibleProcessGuide } from "./workbench/CollapsibleProcessGuide";
import { syncAppUrlParams } from "@/src/lib/urlParams";
import {
  analysisProgressSteps,
  closedLoopSteps,
  mainWorkbenchTabs,
  statusLabels,
  statusStyles,
  typeLabels,
  type TodoFilter,
  type WorkbenchTab,
  workbenchTabLabels,
} from "./workbench/constants";
import { batchProgressStats, getWaitHours, sortWorkbenchDiffs } from "./workbench/workbenchUtils";

interface TaskWorkbenchProps {
  initialTab?: WorkbenchTab;
  initialBillNo?: string | null;
}

function MetricCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-xs font-bold text-slate-500">{label}</div>
      <div className={cn("text-3xl font-bold", accent ?? "text-slate-900")}>{value}</div>
    </div>
  );
}

function DiffListItem({
  diff,
  selected,
  pushRecord,
  waitHours,
  selectable,
  checked,
  onToggleCheck,
  onSelect,
  primaryLabel,
  onPrimaryAction,
}: {
  diff: ReconciliationDifference;
  selected: boolean;
  pushRecord?: PushRecord;
  waitHours: number | null;
  selectable?: boolean;
  checked?: boolean;
  onToggleCheck?: () => void;
  onSelect: () => void;
  primaryLabel: string;
  onPrimaryAction: () => void;
}) {
  return (
    <div
      className={cn(
        "flex w-full border-l-4 transition-colors hover:bg-slate-50 group",
        selected ? "border-blue-600 bg-blue-50/40" : "border-transparent",
      )}
    >
      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          aria-label={checked ? "取消选择" : "选择"}
          className="flex shrink-0 items-start px-3 pt-5 text-slate-400 hover:text-blue-600"
        >
          {checked ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4" />}
        </button>
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="block min-w-0 flex-1 cursor-pointer px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-slate-900">{diff.billNo}</div>
          <div className="mt-1 text-xs text-slate-500">{diff.desc}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={cn("rounded-full border px-2 py-1 text-[10px] font-bold", statusStyles[diff.status])}>
            {pushRecord ? "待责任方确认" : statusLabels[diff.status]}
          </span>
          {pushRecord && (
            <span className="text-[10px] text-slate-400">已推送 {pushRecord.assignee}</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrimaryAction();
            }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <div className="text-slate-400">差异类型</div>
          <div className="mt-1 font-bold text-slate-700">{typeLabels[diff.type]}</div>
        </div>
        <div>
          <div className="text-slate-400">差异金额</div>
          <div className="mt-1 font-mono font-bold text-slate-700">¥{diff.diffAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-400">责任系统</div>
          <div className="mt-1 font-bold text-slate-700">{diff.ownerSystem ?? "—"}</div>
        </div>
        <div>
          <div className="text-slate-400">等待时长</div>
          <div className="mt-1 flex items-center gap-1 font-bold text-slate-700">
            {waitHours != null ? (
              <>
                <Clock className="h-3 w-3 text-slate-400" />
                {waitHours}h
              </>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export function TaskWorkbench({ initialTab, initialBillNo }: TaskWorkbenchProps) {
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>(initialTab ?? "todo");
  const [todoFilter, setTodoFilter] = useState<TodoFilter>("all");
  const [differences, setDifferences] = useState<ReconciliationDifference[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<ReconciliationDifference | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, AnalysisResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStepIndex, setProgressStepIndex] = useState(0);
  const [pushRecords, setPushRecords] = useState<Record<string, PushRecord>>({});
  const [pushModal, setPushModal] = useState<{ diff: ReconciliationDifference; assignee: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchAnalyzeProgress>({
    current: 0,
    total: 0,
    billNo: "",
    done: [],
    failed: [],
  });
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialTab) setWorkbenchTab(initialTab);
  }, [initialTab]);

  const changeWorkbenchTab = useCallback((tab: WorkbenchTab) => {
    setWorkbenchTab(tab);
    syncAppUrlParams({ workbenchTab: tab });
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: WorkbenchTab }>).detail;
      if (detail?.tab) changeWorkbenchTab(detail.tab);
    };
    window.addEventListener("workbench-tab-switch", handler);
    return () => window.removeEventListener("workbench-tab-switch", handler);
  }, [changeWorkbenchTab]);

  useEffect(() => {
    fetch("/api/differences")
      .then((res) => res.json())
      .then((data: ReconciliationDifference[]) => {
        setDifferences(data);
      });
  }, []);

  const metrics = useMemo(
    () => ({
      pending: differences.filter((d) => d.status === "PENDING").length,
      completed: differences.filter((d) => d.status === "COMPLETED").length,
      review: differences.filter((d) => d.status === "NEEDS_REVIEW").length,
      insufficient: differences.filter((d) => d.status === "INSUFFICIENT_EVIDENCE").length,
      awaitingConfirm: Object.keys(pushRecords).length,
    }),
    [differences, pushRecords],
  );

  const batchLabel = differences[0]?.createdAtLabel ?? "2026-04 月结批次";
  const batchTotal = differences.length;
  const pushIdSet = useMemo(() => new Set(Object.keys(pushRecords)), [pushRecords]);
  const batchStats = useMemo(
    () => batchProgressStats(differences, pushIdSet),
    [differences, pushIdSet],
  );
  const todoCount = metrics.pending + metrics.review + metrics.insufficient + metrics.awaitingConfirm;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const clearProgressTimer = () => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => () => clearProgressTimer(), []);

  const startProgressAnimation = () => {
    clearProgressTimer();
    setProgressStepIndex(0);
    progressTimerRef.current = window.setInterval(() => {
      setProgressStepIndex((prev) => {
        if (prev >= analysisProgressSteps.length - 1) {
          clearProgressTimer();
          return prev;
        }
        return prev + 1;
      });
    }, 550);
  };

  const analyze = async (diff: ReconciliationDifference, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setSelectedDiff(diff);
      setAnalysisResult(null);
      setIsAnalyzing(true);
      startProgressAnimation();
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diffId: diff.id, billNo: diff.billNo, type: diff.type }),
      });
      const data = await response.json();

      if (!options?.silent) {
        clearProgressTimer();
        setProgressStepIndex(analysisProgressSteps.length - 1);
      }

      if (!response.ok || data.error) {
        if (!options?.silent) {
          setAnalysisResult({ error: data.error || "分析失败，请检查服务状态。" });
        }
        return { ok: false as const, error: data.error as string | undefined };
      }

      setAnalysisCache((prev) => ({ ...prev, [diff.id]: data }));
      setDifferences((prev) =>
        prev.map((item) =>
          item.id === diff.id && item.status === "PENDING" ? { ...item, status: "NEEDS_REVIEW" } : item,
        ),
      );
      if (!options?.silent) {
        setAnalysisResult(data);
        setSelectedDiff((prev) =>
          prev?.id === diff.id && prev.status === "PENDING" ? { ...prev, status: "NEEDS_REVIEW" } : prev,
        );
      } else if (selectedDiff?.id === diff.id) {
        setSelectedDiff((prev) =>
          prev?.id === diff.id && prev.status === "PENDING" ? { ...prev, status: "NEEDS_REVIEW" } : prev,
        );
      }
      return { ok: true as const, data };
    } catch (error) {
      console.error(error);
      if (!options?.silent) {
        clearProgressTimer();
        setAnalysisResult({ error: "网络错误，分析请求未成功抵达服务器。" });
      }
      return { ok: false as const, error: "网络错误" };
    } finally {
      if (!options?.silent) {
        setIsAnalyzing(false);
      }
    }
  };

  const pendingForBatch = useMemo(
    () => differences.filter((d) => d.status === "PENDING"),
    [differences],
  );

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    setCheckedIds(new Set(pendingForBatch.map((d) => d.id)));
  };

  const clearChecks = () => setCheckedIds(new Set());

  const runBatchAnalyze = async (targets: ReconciliationDifference[]) => {
    if (targets.length === 0) return;

    setBatchModalOpen(true);
    setBatchRunning(true);
    setBatchProgress({ current: 0, total: targets.length, billNo: "", done: [], failed: [] });

    const done: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < targets.length; i++) {
      const diff = targets[i];
      setBatchProgress((prev) => ({ ...prev, current: i, billNo: diff.billNo }));
      const result = await analyze(diff, { silent: true });
      if (result.ok) done.push(diff.billNo);
      else failed.push(diff.billNo);
      setBatchProgress((prev) => ({
        ...prev,
        current: i + 1,
        billNo: diff.billNo,
        done: [...done],
        failed: [...failed],
      }));
      await new Promise((r) => window.setTimeout(r, 400));
    }

    setBatchRunning(false);
    clearChecks();
    showToast(`批量归因完成：成功 ${done.length} 笔${failed.length ? `，失败 ${failed.length} 笔` : ""}`);
  };

  const batchAnalyze = () => {
    const targets = differences.filter((d) => checkedIds.has(d.id) && d.status === "PENDING");
    if (targets.length === 0) {
      showToast("请先勾选待归因的差异。");
      return;
    }
    void runBatchAnalyze(targets);
  };

  const batchAnalyzeAllPending = () => {
    void runBatchAnalyze(pendingForBatch);
  };

  const updateReviewStatus = (status: ReconciliationDifference["status"]) => {
    if (!selectedDiff) return;
    setDifferences((prev) => prev.map((item) => (item.id === selectedDiff.id ? { ...item, status } : item)));
    setSelectedDiff((prev) => (prev ? { ...prev, status } : prev));
    showToast(
      status === "COMPLETED"
        ? "归因已确认，已沉淀为历史案例。"
        : "已退回复核，等待责任系统补充证据。",
    );
  };

  const pushForReview = () => {
    if (!selectedDiff) return;
    const assignee =
      selectedDiff.ownerSystem === "DMS"
        ? "DMS 负责人 · 李工"
        : selectedDiff.ownerSystem?.includes("接口")
          ? "接口负责人 · 王工"
          : `${selectedDiff.ownerSystem ?? "系统"}负责人`;

    setPushRecords((prev) => ({
      ...prev,
      [selectedDiff.id]: { assignee, pushedAt: new Date().toLocaleString("zh-CN") },
    }));
    setPushModal({ diff: selectedDiff, assignee });
    showToast(`已推送钉钉通知至 ${assignee}`);
  };

  const filteredTodos = useMemo(() => {
    if (todoFilter === "all") {
      return differences.filter((d) => d.status !== "COMPLETED").sort(sortWorkbenchDiffs);
    }
    return differences.filter((d) => d.status === todoFilter).sort(sortWorkbenchDiffs);
  }, [differences, todoFilter]);

  const confirmList = useMemo(
    () =>
      differences
        .filter((d) => pushRecords[d.id] && d.status !== "COMPLETED")
        .sort(sortWorkbenchDiffs),
    [differences, pushRecords],
  );

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    differences.forEach((d) => {
      const label = typeLabels[d.type];
      map.set(label, (map.get(label) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [differences]);

  const ownerDistribution = useMemo(() => {
    const map = new Map<string, number>();
    differences.filter((d) => d.status !== "COMPLETED").forEach((d) => {
      const key = d.ownerSystem ?? "未分配";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [differences]);

  const completedCases = useMemo(
    () => differences.filter((d) => d.status === "COMPLETED"),
    [differences],
  );

  const openDetail = (diff: ReconciliationDifference) => {
    setSelectedDiff(diff);
    const cached = analysisCache[diff.id] ?? null;
    setAnalysisResult(cached);
    setDetailOpen(true);
    if (diff.status === "NEEDS_REVIEW" && !cached) {
      void analyze(diff);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
  };

  const getPrimaryAction = (diff: ReconciliationDifference): { label: string; run: () => void } => {
    if (pushRecords[diff.id]) {
      return {
        label: "催办确认",
        run: () => {
          openDetail(diff);
          showToast(`已催办 ${pushRecords[diff.id]?.assignee ?? "责任方"}`);
        },
      };
    }
    switch (diff.status) {
      case "PENDING":
        return {
          label: "启动归因",
          run: () => {
            setDetailOpen(true);
            void analyze(diff);
          },
        };
      case "NEEDS_REVIEW":
        return {
          label: "查看报告",
          run: () => openDetail(diff),
        };
      case "INSUFFICIENT_EVIDENCE":
        return {
          label: "重新归因",
          run: () => {
            setDetailOpen(true);
            void analyze(diff);
          },
        };
      default:
        return { label: "查看详情", run: () => openDetail(diff) };
    }
  };

  useEffect(() => {
    if (!initialBillNo || differences.length === 0) return;
    const diff = differences.find((d) => d.billNo === initialBillNo);
    if (diff) openDetail(diff);
  }, [initialBillNo, differences]);

  const listSource =
    workbenchTab === "list"
      ? [...differences].sort(sortWorkbenchDiffs)
      : workbenchTab === "confirm"
        ? confirmList
        : filteredTodos;

  return (
    <div className="h-full overflow-auto bg-slate-50/60 p-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            className="fixed left-1/2 top-6 z-[70] rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {pushModal && (
        <DingTalkPushModal diff={pushModal.diff} assignee={pushModal.assignee} onClose={() => setPushModal(null)} />
      )}

      {batchModalOpen && (
        <BatchAnalyzeModal
          progress={batchProgress}
          running={batchRunning}
          onClose={() => setBatchModalOpen(false)}
        />
      )}

      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* 标题区 */}
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-900">数据质检 Agent 工作台</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              帆软输出差异后，在此完成自动排查、证据核对与复核协同
            </p>
          </div>

          {/* 批次 + 统计 — 全宽信息条 */}
          <div className="px-5 py-3">
            <WorkbenchStatusPanel
              todoCount={todoCount}
              metrics={metrics}
              batchLabel={batchLabel}
              batchNumerator={batchStats.numerator}
              batchTotal={batchStats.total}
              batchPercent={batchStats.percent}
              batchCompleted={batchStats.completed}
              batchInProgress={batchStats.inProgress}
              closingDaysLeft={null}
              onOpenTodo={() => changeWorkbenchTab("todo")}
              onFilterTodo={(filter) => {
                changeWorkbenchTab("todo");
                setTodoFilter(filter);
              }}
            />
          </div>

          {/* Tab 导航 */}
          <div className="flex flex-wrap gap-0 border-t border-b border-slate-100 px-5">
            {mainWorkbenchTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => changeWorkbenchTab(tab)}
                className={cn(
                  "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors",
                  workbenchTab === tab
                    ? "text-blue-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-600"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {tab === "todo" && <ListTodo className="h-4 w-4" />}
                {tab === "confirm" && <UserCheck className="h-4 w-4" />}
                {tab === "list" && <ClipboardCheck className="h-4 w-4" />}
                {tab === "progress" && <TrendingUp className="h-4 w-4" />}
                {tab === "cases" && <BookOpen className="h-4 w-4" />}
                {workbenchTabLabels[tab]}
                {tab === "todo" && todoCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                    {todoCount}
                  </span>
                )}
                {tab === "confirm" && metrics.awaitingConfirm > 0 && (
                  <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                    {metrics.awaitingConfirm}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 流程条 — 仅在处理类 Tab 展示 */}
          {(workbenchTab === "todo" || workbenchTab === "list" || workbenchTab === "confirm") && (
            <CollapsibleProcessGuide steps={closedLoopSteps} />
          )}
        </section>

        {workbenchTab === "compare" && (
          <BeforeAfterCompare batchTotal={batchTotal} pendingCount={metrics.pending} />
        )}

        {workbenchTab === "progress" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">批次处理进度</h3>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <MetricCard label="待归因" value={metrics.pending} />
                <MetricCard label="需复核" value={metrics.review} />
                <MetricCard label="证据不足" value={metrics.insufficient} accent="text-rose-700" />
                <MetricCard label="已确认" value={metrics.completed} accent="text-emerald-700" />
              </div>
              <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                本批次预计节省人工排查 <span className="font-bold text-blue-700">12+ 人时</span>（按每笔 40 分钟、自动化后 8 分钟估算）
              </div>
              <button
                type="button"
                onClick={() => changeWorkbenchTab("compare")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                查看效率价值对比 →
              </button>
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900">差异类型分布</h3>
                <div className="mt-4 space-y-3">
                  {typeDistribution.map(([label, count]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-bold text-slate-900">{count} 笔</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${(count / batchTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900">待闭环责任系统</h3>
                <div className="mt-4 space-y-2">
                  {ownerDistribution.map(([owner, count]) => (
                    <div key={owner} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{owner}</span>
                      <span className="font-bold text-slate-900">{count} 笔待处理</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {workbenchTab === "cases" && (
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-bold text-slate-900">已确认案例库</h3>
              <p className="mt-1 text-xs text-slate-500">复核确认后的差异将沉淀为案例，支撑同类问题快速匹配。</p>
            </div>
            {completedCases.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400">
                暂无已确认案例，请在归因详情中点击「确认归因」。
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedCases.map((diff) => (
                  <div key={diff.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="font-bold text-slate-900">{diff.billNo}</div>
                      <div className="mt-1 text-xs text-slate-500">{typeLabels[diff.type]} · ¥{diff.diffAmount.toLocaleString()}</div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">已沉淀</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {(workbenchTab === "todo" || workbenchTab === "list" || workbenchTab === "confirm") && (
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {workbenchTab === "todo"
                      ? "我的待办"
                      : workbenchTab === "confirm"
                        ? "待我确认"
                        : "收入对账差异清单"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {workbenchTab === "todo"
                      ? "按金额与等待时长排序；可直接在列表启动归因或查看报告。"
                      : workbenchTab === "confirm"
                        ? "已推送钉钉的差异，等待责任方确认或补充说明。"
                        : "含已闭环记录；日常处理请优先使用「我的待办」。"}
                  </p>
                </div>
                {(workbenchTab === "list" || workbenchTab === "todo") && pendingForBatch.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={selectAllPending}
                      className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      全选待归因 ({pendingForBatch.length})
                    </button>
                    {checkedIds.size > 0 && (
                      <button
                        type="button"
                        onClick={clearChecks}
                        className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50"
                      >
                        清空
                      </button>
                    )}
                    {checkedIds.size > 0 ? (
                      <button
                        type="button"
                        onClick={batchAnalyze}
                        disabled={batchRunning}
                        className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        批量归因 ({checkedIds.size})
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={batchAnalyzeAllPending}
                        disabled={batchRunning}
                        className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        归因全部待归因 ({pendingForBatch.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
              {workbenchTab === "todo" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ["all", "全部", todoCount],
                      ["PENDING", "待归因", metrics.pending],
                      ["NEEDS_REVIEW", "需复核", metrics.review],
                      ["INSUFFICIENT_EVIDENCE", "证据不足", metrics.insufficient],
                    ] as const
                  ).map(([key, label, count]) => (
                    <button
                      key={key}
                      onClick={() => setTodoFilter(key)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                        todoFilter === key
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      {label} {count}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="max-h-[720px] divide-y divide-slate-100 overflow-y-auto">
              {listSource.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400">
                  当前筛选下暂无差异
                </div>
              ) : (
                listSource.map((diff) => {
                  const primary = getPrimaryAction(diff);
                  return (
                    <div key={diff.id}>
                      <DiffListItem
                        diff={diff}
                        selected={detailOpen && selectedDiff?.id === diff.id}
                        pushRecord={pushRecords[diff.id]}
                        waitHours={getWaitHours(diff)}
                        selectable={workbenchTab !== "confirm" && diff.status === "PENDING"}
                        checked={checkedIds.has(diff.id)}
                        onToggleCheck={() => toggleCheck(diff.id)}
                        onSelect={() => openDetail(diff)}
                        primaryLabel={primary.label}
                        onPrimaryAction={primary.run}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {detailOpen && selectedDiff && (
          <DiffDetailDrawer
            open={detailOpen}
            diff={selectedDiff}
            pushRecord={pushRecords[selectedDiff.id]}
            isAnalyzing={isAnalyzing}
            progressStepIndex={progressStepIndex}
            analysisResult={analysisResult}
            onClose={closeDetail}
            onAnalyze={() => analyze(selectedDiff)}
            onConfirm={() => updateReviewStatus("COMPLETED")}
            onReject={() => updateReviewStatus("INSUFFICIENT_EVIDENCE")}
            onPush={pushForReview}
            onRemind={() => showToast(`已再次催办 ${pushRecords[selectedDiff.id]?.assignee ?? "责任方"}`)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

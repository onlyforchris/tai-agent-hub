import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  GitBranch,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { AnalysisResult, ReconciliationDifference } from "@/src/types";

const typeLabels: Record<ReconciliationDifference["type"], string> = {
  MDM_ID_ANOMALY: "同结算单多 MDM ID",
  AMOUNT_DOUBLE: "收入金额翻倍",
  STATUS_MISMATCH: "SAP/DMS 状态回传不一致",
};

const statusLabels: Record<ReconciliationDifference["status"], string> = {
  PENDING: "待归因",
  COMPLETED: "已确认",
  NEEDS_REVIEW: "需复核",
  INSUFFICIENT_EVIDENCE: "证据不足",
};

const statusStyles: Record<ReconciliationDifference["status"], string> = {
  PENDING: "bg-blue-50 text-blue-700 border-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  NEEDS_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  INSUFFICIENT_EVIDENCE: "bg-rose-50 text-rose-700 border-rose-100",
};

const closedLoopSteps = [
  "差异接入",
  "类型识别",
  "Skill执行",
  "规则计算",
  "证据链",
  "模型报告",
  "人工复核",
];

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "emerald" | "amber" | "rose";
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="text-xs font-bold text-slate-500 mb-2">{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export function TaskWorkbench() {
  const [differences, setDifferences] = useState<ReconciliationDifference[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<ReconciliationDifference | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/differences")
      .then((res) => res.json())
      .then((data) => {
        setDifferences(data);
        setSelectedDiff(data[0] ?? null);
      });
  }, []);

  const metrics = useMemo(
    () => ({
      pending: differences.filter((d) => d.status === "PENDING").length,
      completed: differences.filter((d) => d.status === "COMPLETED").length,
      review: differences.filter((d) => d.status === "NEEDS_REVIEW").length,
      insufficient: differences.filter((d) => d.status === "INSUFFICIENT_EVIDENCE").length,
    }),
    [differences],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const analyze = async (diff: ReconciliationDifference) => {
    setSelectedDiff(diff);
    setAnalysisResult(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diffId: diff.id, billNo: diff.billNo, type: diff.type }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setAnalysisResult({ error: data.error || "分析失败，请检查服务状态。" });
      } else {
        setAnalysisResult(data);
      }
    } catch (error) {
      console.error(error);
      setAnalysisResult({ error: "网络错误，分析请求未成功抵达服务器。" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateReviewStatus = (status: ReconciliationDifference["status"]) => {
    if (!selectedDiff) return;
    setDifferences((prev) =>
      prev.map((item) => (item.id === selectedDiff.id ? { ...item, status } : item)),
    );
    setSelectedDiff((prev) => (prev ? { ...prev, status } : prev));
    showToast(status === "COMPLETED" ? "归因已确认，已沉淀为历史案例。" : "已退回复核，等待责任系统补充证据。");
  };

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

      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">数据质检 Agent 工作台</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                在帆软已发现差异之后，由平台执行类型识别、业务 Skill 调度、确定性规则计算和证据链报告。模型只负责基于脱敏摘要生成说明文本，不自动修复数据、不自动过账、不替代 SAP/DMS/帆软。
              </p>
            </div>
            <div className="grid min-w-[420px] grid-cols-2 gap-3">
              <MetricCard label="待归因" value={metrics.pending} tone="blue" />
              <MetricCard label="已确认" value={metrics.completed} tone="emerald" />
              <MetricCard label="需复核" value={metrics.review} tone="amber" />
              <MetricCard label="证据不足" value={metrics.insufficient} tone="rose" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {closedLoopSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex min-h-[52px] flex-1 items-center justify-center rounded border border-slate-200 bg-slate-50 px-2 text-center text-xs font-bold text-slate-700">
                  {step}
                </div>
                {index < closedLoopSteps.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 xl:block" />}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(480px,0.9fr)_minmax(620px,1.1fr)]">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">收入对账差异清单</h3>
                <p className="mt-1 text-xs text-slate-500">按收入模块差异类型自动匹配业务 Skill 并生成证据链。</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {differences.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    setSelectedDiff(diff);
                    setAnalysisResult(null);
                  }}
                  className={cn(
                    "block w-full border-l-4 px-5 py-4 text-left transition-colors hover:bg-slate-50",
                    selectedDiff?.id === diff.id ? "border-blue-600 bg-blue-50/40" : "border-transparent",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{diff.billNo}</div>
                      <div className="mt-1 text-xs text-slate-500">{diff.desc}</div>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold", statusStyles[diff.status])}>
                      {statusLabels[diff.status]}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
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
                      <div className="mt-1 font-bold text-slate-700">{diff.ownerSystem}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">归因详情</h3>
                <p className="mt-1 text-xs text-slate-500">自动匹配 Skill，按人工排查步骤生成证据链。</p>
              </div>
              {selectedDiff && (
                <button
                  onClick={() => analyze(selectedDiff)}
                  className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  {analysisResult ? <RefreshCcw className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  {analysisResult ? "重新归因" : "启动归因"}
                </button>
              )}
            </div>

            {!selectedDiff ? (
              <div className="flex min-h-[520px] items-center justify-center text-sm text-slate-400">请选择一条差异。</div>
            ) : (
              <div className="p-5">
                <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                  <div>
                    <div className="text-xs text-slate-400">单据号</div>
                    <div className="mt-1 font-bold text-slate-900">{selectedDiff.billNo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">业务模块</div>
                    <div className="mt-1 font-bold text-slate-900">{selectedDiff.module}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">SAP / DMS</div>
                    <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                      {selectedDiff.sapAmount.toLocaleString()} / {selectedDiff.dmsAmount?.toLocaleString() ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">批次</div>
                    <div className="mt-1 font-bold text-slate-900">{selectedDiff.createdAtLabel}</div>
                  </div>
                </div>

                {isAnalyzing && (
                  <div className="mt-5 flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-blue-200 bg-blue-50/30">
                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <div className="text-center">
                      <div className="font-bold text-slate-900">正在执行确定性规则计算</div>
                      <div className="mt-1 text-sm text-slate-500">查询脱敏数据、匹配 Skill、生成结构化证据链。</div>
                    </div>
                  </div>
                )}

                {!isAnalyzing && !analysisResult && (
                  <div className="mt-5 min-h-[420px] rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8">
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <GitBranch className="h-12 w-12 text-blue-600" />
                      <h4 className="mt-4 font-bold text-slate-900">等待启动归因闭环</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        平台将根据差异类型选择对应业务 Skill，再执行金额、MDM、状态、日志等确定性规则。
                      </p>
                      <button
                        onClick={() => analyze(selectedDiff)}
                        className="mt-6 rounded bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        启动归因
                      </button>
                    </div>
                  </div>
                )}

                {!isAnalyzing && analysisResult?.error && (
                  <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="h-5 w-5" />
                      分析失败
                    </div>
                    <p className="mt-2 text-sm">{analysisResult.error}</p>
                  </div>
                )}

                {!isAnalyzing && analysisResult && !analysisResult.error && (
                  <div className="mt-5 grid gap-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                      <div className="rounded-lg border border-slate-200 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                          <ClipboardCheck className="h-4 w-4 text-blue-600" />
                          命中业务 Skill
                        </div>
                        <div className="text-lg font-bold text-slate-900">{analysisResult.skillName}</div>
                        <div className="mt-2 text-sm leading-6 text-slate-600">{analysisResult.rootCause}</div>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4">
                        <div className="text-xs font-bold text-slate-500">置信度</div>
                        <div className="mt-2 text-4xl font-bold text-blue-700">{analysisResult.confidence}%</div>
                        <div className="mt-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                          首次异常：{analysisResult.firstAbnormalNode}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-500">
                        <Database className="h-4 w-4 text-blue-600" />
                        结构化证据链
                      </div>
                      <div className="divide-y divide-slate-100">
                        {analysisResult.evidenceChain?.map((item, index) => (
                          <div key={`${item.sourceSystem}-${index}`} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[150px_1fr_1fr_90px]">
                            <div className="font-bold text-slate-900">{item.sourceSystem}</div>
                            <div>
                              <div className="text-xs text-slate-400">{item.checkField}</div>
                              <div className="mt-1 text-slate-600">期望：{item.expected}</div>
                            </div>
                            <div className="text-slate-600">实际：{item.actual}</div>
                            <div>
                              <span className={cn(
                                "rounded-full px-2 py-1 text-[10px] font-bold",
                                item.result === "一致" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                              )}>
                                {item.result}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-white">
                      <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-300">
                        <MessageSquare className="h-4 w-4 text-blue-300" />
                        脱敏模型报告
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{analysisResult.report || analysisResult.modelSummary}</div>
                      <div className="mt-5 border-t border-slate-700 pt-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
                          <ShieldCheck className="h-4 w-4 text-emerald-300" />
                          审计与安全留痕
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          {analysisResult.auditNotes?.map((note) => (
                            <div key={note} className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <FileText className="h-4 w-4 text-blue-600" />
                          人工复核建议
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{analysisResult.reviewSuggestion}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateReviewStatus("INSUFFICIENT_EVIDENCE")}
                          className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          <X className="h-4 w-4" />
                          退回复核
                        </button>
                        <button
                          onClick={() => updateReviewStatus("COMPLETED")}
                          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          确认归因
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

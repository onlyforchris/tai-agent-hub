import React, { useEffect, useMemo, useState } from "react";
import {
  Braces,
  ChevronRight,
  Database,
  Filter,
  RefreshCcw,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { ToolMeta } from "@/src/types";

const categoryStyles: Record<string, string> = {
  data_query: "bg-blue-50 text-blue-700 border-blue-200",
  rule: "bg-emerald-50 text-emerald-700 border-emerald-200",
  template: "bg-violet-50 text-violet-700 border-violet-200",
  notify: "bg-amber-50 text-amber-700 border-amber-200",
  compute: "bg-slate-50 text-slate-700 border-slate-200",
};

const sideEffectStyles: Record<string, string> = {
  none: "bg-emerald-50 text-emerald-700",
  notify: "bg-amber-50 text-amber-700",
  write: "bg-rose-50 text-rose-700",
};

const sensitivityStyles: Record<string, string> = {
  public: "bg-slate-50 text-slate-600",
  internal: "bg-blue-50 text-blue-700",
  internal_finance: "bg-violet-50 text-violet-700",
  restricted: "bg-rose-50 text-rose-700",
};

export function ToolsView() {
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [selected, setSelected] = useState<ToolMeta | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [keyword, setKeyword] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/tools");
    setTools(await res.json());
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (keyword && !`${t.name} ${t.description}`.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [tools, category, keyword]);

  const categories = useMemo(() => {
    const set = new Set(tools.map((t) => t.category));
    return ["all", ...Array.from(set)];
  }, [tools]);

  const metrics = useMemo(() => {
    return {
      total: tools.length,
      dataQuery: tools.filter((t) => t.category === "data_query").length,
      rule: tools.filter((t) => t.category === "rule").length,
      noSideEffect: tools.filter((t) => t.sideEffect === "none").length,
    };
  }, [tools]);

  return (
    <div className="h-full overflow-auto bg-slate-50/60 p-6">
      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tool 注册中心</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                所有 Agent 与外部系统的交互均收敛到 Tool。每个 Tool 在注册时声明 Schema、数据敏感度、副作用与权限边界。一期 POC 所有 Tool 的副作用均为 none / notify，不允许写业务系统。
              </p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 self-start rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              刷新
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold text-slate-500">已注册 Tool</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.total}</div>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs font-bold text-blue-700">data_query</div>
              <div className="mt-1 text-2xl font-bold text-blue-700">{metrics.dataQuery}</div>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-bold text-emerald-700">rule</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{metrics.rule}</div>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-bold text-emerald-700">无副作用 (none)</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{metrics.noSideEffect}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded border px-2.5 py-1 text-[11px] font-bold transition-colors",
                    category === c
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="按名称 / 描述搜索…"
              className="rounded border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelected(t)}
                className="rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <code className="font-mono text-xs font-bold text-slate-900">{t.name}</code>
                  </div>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-bold", categoryStyles[t.category] ?? "")}>
                    {t.category}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{t.description}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  <span className={cn("rounded px-1.5 py-0.5 font-bold", sideEffectStyles[t.sideEffect] ?? "")}>
                    side_effect: {t.sideEffect}
                  </span>
                  <span className={cn("rounded px-1.5 py-0.5 font-bold", sensitivityStyles[t.dataSensitivity] ?? "")}>
                    {t.dataSensitivity}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>v{t.version} · {t.connector}</span>
                  <span className="inline-flex items-center gap-1 text-blue-600">
                    Schema <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <code className="font-mono text-sm font-bold text-slate-900">{selected.name}</code>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-xs text-slate-400">版本</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.version}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">类别</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">连接器</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.connector}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Owner</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.owner}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">数据敏感度</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.dataSensitivity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">副作用</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.sideEffect}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Braces className="h-4 w-4 text-blue-600" />
                    Input Schema
                  </div>
                  <pre className="overflow-auto rounded border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-100">
{JSON.stringify(selected.inputSchema, null, 2)}
                  </pre>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Database className="h-4 w-4 text-blue-600" />
                    Output Schema
                  </div>
                  <pre className="overflow-auto rounded border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-100">
{JSON.stringify(selected.outputSchema, null, 2)}
                  </pre>
                </div>

                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs leading-6 text-emerald-700">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    安全边界
                  </div>
                  <p className="mt-1">
                    一期 POC 所有 Tool 的副作用均为 <code className="font-bold">none</code> 或 <code className="font-bold">notify</code>，禁止写入业务系统。新增 write 类 Tool 必须经过 Governance 审批流。
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

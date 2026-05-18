import React from "react";
import { Brain, CheckCircle2, Cpu, Database, Layers, Lightbulb } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { GatewayInfo, WizardFormState } from "@/src/components/views/agents/types";

interface Props {
  form: WizardFormState;
  patch: (p: Partial<WizardFormState>) => void;
  disabled: boolean;
  gateway: GatewayInfo | null;
}

const MODELS: Array<{
  id: WizardFormState["model"];
  name: string;
  desc: string;
  badge: string;
  recommended?: boolean;
  available: (g: GatewayInfo | null) => boolean;
}> = [
  {
    id: "deepseek",
    name: "DeepSeek V4 Flash",
    desc: "极速推理、低延迟，POC 默认模型（deepseek-chat）",
    badge: "POC 默认",
    recommended: true,
    available: (g) => g?.provider === "deepseek",
  },
  {
    id: "qwen",
    name: "Qwen Max",
    desc: "阿里云通义千问，DashScope 兼容 OpenAI 模式",
    badge: "可选",
    available: (g) => g?.provider === "qwen",
  },
];

const MEMORY_OPTIONS: Array<{
  id: WizardFormState["memoryStrategy"];
  name: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: "window",
    name: "Window Memory (会话窗口)",
    desc: "保留最近 N 步推理与工具结果，适合单次归因",
    icon: Layers,
  },
  {
    id: "summary",
    name: "Summary Memory (摘要记忆)",
    desc: "对长会话/多步证据链做滚动摘要，控制 Token",
    icon: Lightbulb,
  },
  {
    id: "case_bank",
    name: "Case Bank (案例库记忆)",
    desc: "沉淀历史归因结论，命中相似差异时复用",
    icon: Database,
  },
];

export function Step2Knowledge({ form, patch, disabled, gateway }: Props) {
  return (
    <div className="w-full animate-in slide-in-from-bottom-4 p-4 duration-500 sm:p-5 xl:p-6">
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <Cpu className="h-5 w-5 text-blue-600" />
          模型与上下文记忆
        </h4>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">
            底层大模型 (Foundation Model)
          </label>
          {gateway && (
            <div
              className={cn(
                "mb-3 inline-flex items-center gap-2 rounded border px-2.5 py-1 text-[11px] font-bold",
                gateway.provider === "fallback_template"
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              当前 Model Gateway：{gateway.provider}（{gateway.model}）
              {gateway.forced !== "auto" && (
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                  forced={gateway.forced}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {MODELS.map((m) => {
              const available = m.available(gateway);
              const selected = form.model === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={disabled || !available}
                  onClick={() => patch({ model: m.id })}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left shadow-sm transition-all",
                    selected
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-blue-300",
                    !available && "cursor-not-allowed opacity-50 hover:border-slate-200",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    {selected && available && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{m.name}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{m.desc}</div>
                  </div>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                      m.recommended
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                    )}
                  >
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
          {gateway?.provider === "fallback_template" && (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700">
              当前未检测到任何模型 Key，归因报告会使用本地确定性兜底模板。在
              <code className="mx-1 rounded bg-white px-1 font-mono">.env</code> 中填入
              <code className="mx-1 rounded bg-white px-1 font-mono">DEEPSEEK_API_KEY</code>
              或
              <code className="mx-1 rounded bg-white px-1 font-mono">QWEN_API_KEY</code>
              任意一个即可启用对应模型；同时配置时按
              <code className="mx-1 rounded bg-white px-1 font-mono">MODEL_PROVIDER</code>
              决定（默认优先 DeepSeek）。
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-700">
            记忆策略 (Memory)
          </label>
          <div className="grid gap-2 xl:grid-cols-3">
            {MEMORY_OPTIONS.map((m) => {
              const Icon = m.icon;
              const selected = form.memoryStrategy === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => patch({ memoryStrategy: m.id })}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
                    selected
                      ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      selected ? "text-blue-600" : "text-slate-400",
                    )}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">{m.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{m.desc}</div>
                  </div>
                  {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

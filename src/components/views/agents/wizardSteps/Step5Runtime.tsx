import React from "react";
import {
  Activity,
  ArrowDown,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Wrench,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { GatewayInfo, WizardFormState } from "@/src/components/views/agents/types";

interface Props {
  form: WizardFormState;
  gateway: GatewayInfo | null;
}

// 与 trace store 的 RunStep.stepType 完全一致
const PIPELINE: Array<{
  type: "plan" | "tool_call" | "rule" | "model" | "review_route";
  label: string;
  desc: string;
  icon: React.ElementType;
  module: string;
  cls: string;
}> = [
  {
    type: "plan",
    label: "plan",
    desc: "Planner 按差异类型路由到对应业务 Skill",
    icon: Bot,
    module: "Agent Runtime · Planner",
    cls: "border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  {
    type: "tool_call",
    label: "tool_call",
    desc: "执行 Skill 中声明的取数 Tool（DMS / SAP / Master）",
    icon: Wrench,
    module: "Tool Registry · Connectors",
    cls: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    type: "rule",
    label: "rule",
    desc: "确定性规则计算（金额、MDM、状态、重复）",
    icon: ShieldCheck,
    module: "Rule Engine · Skill Hub",
    cls: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  {
    type: "model",
    label: "model",
    desc: "Model Gateway 用脱敏摘要生成归因报告",
    icon: Sparkles,
    module: "Model Gateway",
    cls: "border-amber-300 bg-amber-50 text-amber-700",
  },
  {
    type: "review_route",
    label: "review_route",
    desc: "按 Skill review 配置路由到对应角色",
    icon: GitBranch,
    module: "Review Router",
    cls: "border-rose-300 bg-rose-50 text-rose-700",
  },
];

export function Step5Runtime({ form, gateway }: Props) {
  return (
    <div className="w-full animate-in slide-in-from-bottom-4 space-y-5 p-4 duration-500 sm:p-5 xl:p-6">
      {/* 架构拓扑 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <div className="mb-5">
          <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Network className="h-5 w-5 text-blue-600" />
            Runtime 架构拓扑
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            以方案 V3.0 第 4 章中台模块为单位组织调用关系
          </p>
        </div>

        {/* 顶部：用户/业务系统 */}
        <div className="flex flex-col items-stretch gap-3">
          <ArchBox
            tone="slate"
            icon={Activity}
            title="差异触发源"
            subtitle="帆软差异清单 / 月结批次 / API 调用"
          />
          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* 中心：Agent Runtime + Model Gateway */}
          <div className="flex w-full flex-col items-center gap-3 lg:flex-row lg:items-stretch">
            <div className="flex-1">
              <ArchBox
                tone="blue"
                icon={Bot}
                title={form.name || "新建领域 Agent"}
                subtitle="Agent Runtime · Planner + Executor"
                accent="ORCHESTRATOR"
                large
              />
            </div>
            <div className="flex items-center text-slate-400">→</div>
            <div className="flex-1">
              <ArchBox
                tone="amber"
                icon={Sparkles}
                title={gateway?.model ?? "未配置模型"}
                subtitle={
                  gateway
                    ? `Model Gateway · provider=${gateway.provider}`
                    : "Model Gateway · 未配置 Key"
                }
                accent="MODEL GATEWAY"
              />
            </div>
          </div>

          <ArrowDown className="h-4 w-4 text-slate-400" />

          {/* 中台四件套 */}
          <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4">
            <ArchBox
              tone="amber"
              icon={Layers}
              title="Skill Hub"
              subtitle={`${form.selectedSkillCodes.length} 个挂载 Skill`}
              compact
            />
            <ArchBox
              tone="cyan"
              icon={Wrench}
              title="Tool Registry"
              subtitle={`${form.selectedToolNames.length} 个装载 Tool`}
              compact
            />
            <ArchBox
              tone="emerald"
              icon={Database}
              title="Connector Hub"
              subtitle="excel_import · rule_engine · template_engine"
              compact
            />
            <ArchBox
              tone="indigo"
              icon={Waypoints}
              title="Trace & Eval"
              subtitle="Run / Step 全链路落库"
              compact
            />
          </div>
        </div>
      </div>

      {/* 执行链路 timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <GitBranch className="h-5 w-5 text-blue-600" />
              执行链路 (Run Pipeline)
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              下面 5 类 StepType 与 Trace 页面记录的步骤一一对应；点击「Agent 执行追踪」即可回放每条 Run。
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">
            Step Types：<code className="font-mono">plan</code> ·{" "}
            <code className="font-mono">tool_call</code> ·{" "}
            <code className="font-mono">rule</code> · <code className="font-mono">model</code> ·{" "}
            <code className="font-mono">review_route</code>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-2 h-[calc(100%-1rem)] w-0.5 bg-slate-200" />
          <ol className="space-y-3">
            {PIPELINE.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li key={step.type} className="relative pl-14">
                  <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-sm font-bold text-slate-600 shadow ring-2 ring-slate-200">
                    {idx + 1}
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border-2 bg-white p-4 shadow-sm",
                      step.cls.replace("bg-", "border-").split(" ")[0],
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
                            step.cls,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {step.label}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{step.module}</span>
                      </div>
                      <BranchTag type={step.type} />
                    </div>
                    <p className="mt-2 text-xs leading-6 text-slate-600">{step.desc}</p>
                    {step.type === "model" && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <CheckCircle2 className="h-3 w-3" />
                        当前 Provider: {gateway?.provider ?? "fallback_template"} · {gateway?.model ?? "—"}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-[11px] leading-5 text-indigo-700">
          <BrainCircuit className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            该 Pipeline 是 <b>workflow</b> 执行模式：Planner 按差异类型选 Skill，Executor 顺序执行 Skill 中声明的 Tool/Rule；
            后续二期支持 <code className="rounded bg-white px-1 font-mono">plan_execute</code> 与
            <code className="ml-1 rounded bg-white px-1 font-mono">react</code> 模式。
          </span>
        </div>
      </div>
    </div>
  );
}

function ArchBox({
  icon: Icon,
  title,
  subtitle,
  tone,
  accent,
  large,
  compact,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone: "slate" | "blue" | "amber" | "emerald" | "cyan" | "indigo";
  accent?: string;
  large?: boolean;
  compact?: boolean;
}) {
  const toneMap: Record<string, { border: string; bg: string; text: string; chip: string }> = {
    slate: {
      border: "border-slate-300",
      bg: "bg-white",
      text: "text-slate-700",
      chip: "bg-slate-100 text-slate-600",
    },
    blue: {
      border: "border-blue-600",
      bg: "bg-blue-600",
      text: "text-white",
      chip: "bg-blue-800/50 text-blue-100",
    },
    amber: {
      border: "border-amber-300",
      bg: "bg-amber-50",
      text: "text-amber-900",
      chip: "bg-amber-100 text-amber-700",
    },
    emerald: {
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      text: "text-emerald-900",
      chip: "bg-emerald-100 text-emerald-700",
    },
    cyan: {
      border: "border-cyan-300",
      bg: "bg-cyan-50",
      text: "text-cyan-900",
      chip: "bg-cyan-100 text-cyan-700",
    },
    indigo: {
      border: "border-indigo-300",
      bg: "bg-indigo-50",
      text: "text-indigo-900",
      chip: "bg-indigo-100 text-indigo-700",
    },
  };
  const cls = toneMap[tone];
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-1 rounded-2xl border-2 shadow-sm",
        cls.border,
        cls.bg,
        cls.text,
        large ? "px-8 py-5" : compact ? "px-3 py-3" : "px-6 py-4",
      )}
    >
      <Icon className={cn(large ? "h-7 w-7" : "h-5 w-5")} />
      <div className={cn("text-center font-bold", large ? "text-lg" : compact ? "text-sm" : "text-base")}>
        {title}
      </div>
      <div className={cn("text-center text-[10px] opacity-80", large && "text-xs")}>
        {subtitle}
      </div>
      {accent && (
        <span
          className={cn(
            "mt-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
            cls.chip,
          )}
        >
          {accent}
        </span>
      )}
    </div>
  );
}

function BranchTag({ type }: { type: string }) {
  if (type !== "review_route") return null;
  return (
    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
      触发 NEEDS_REVIEW 状态
    </span>
  );
}

import React, { useMemo, useState } from "react";
import { Filter, Lightbulb, ShieldCheck, ToggleLeft, ToggleRight, Wrench } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { SkillApi, ToolApi, WizardFormState } from "@/src/components/views/agents/types";

interface Props {
  form: WizardFormState;
  patch: (p: Partial<WizardFormState>) => void;
  disabled: boolean;
  tools: ToolApi[];
  skills: SkillApi[];
}

const sideEffectStyles: Record<string, string> = {
  none: "bg-emerald-50 text-emerald-700 border-emerald-200",
  notify: "bg-amber-50 text-amber-700 border-amber-200",
  write: "bg-rose-50 text-rose-700 border-rose-200",
};

const sensitivityStyles: Record<string, string> = {
  public: "bg-slate-50 text-slate-600 border-slate-200",
  internal: "bg-blue-50 text-blue-700 border-blue-200",
  internal_finance: "bg-violet-50 text-violet-700 border-violet-200",
  restricted: "bg-rose-50 text-rose-700 border-rose-200",
};

const categoryLabels: Record<string, string> = {
  data_query: "数据查询",
  rule: "规则计算",
  compute: "计算辅助",
  template: "报告模板",
  notify: "通知",
};

export function Step3Capabilities({ form, patch, disabled, tools, skills }: Props) {
  const [toolCategory, setToolCategory] = useState<string>("all");
  const [toolKeyword, setToolKeyword] = useState("");

  const categories = useMemo(() => {
    const s = new Set(tools.map((t) => t.category));
    return ["all", ...Array.from(s)];
  }, [tools]);

  const filteredTools = useMemo(
    () =>
      tools.filter((t) => {
        if (toolCategory !== "all" && t.category !== toolCategory) return false;
        if (
          toolKeyword &&
          !`${t.name} ${t.description}`.toLowerCase().includes(toolKeyword.toLowerCase())
        )
          return false;
        return true;
      }),
    [tools, toolCategory, toolKeyword],
  );

  // 反查：每个 Tool 被哪些 Skill 引用
  const toolToSkills = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const s of skills) {
      for (const step of s.steps) {
        if (!step.tool) continue;
        map[step.tool] = map[step.tool] ?? [];
        if (!map[step.tool].includes(s.code)) map[step.tool].push(s.code);
      }
    }
    return map;
  }, [skills]);

  const toggleTool = (name: string) => {
    if (disabled) return;
    const set = new Set(form.selectedToolNames);
    set.has(name) ? set.delete(name) : set.add(name);
    patch({ selectedToolNames: Array.from(set) });
  };

  const toggleSkill = (code: string) => {
    if (disabled) return;
    const set = new Set(form.selectedSkillCodes);
    set.has(code) ? set.delete(code) : set.add(code);
    patch({ selectedSkillCodes: Array.from(set) });
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 space-y-5 p-4 duration-500 sm:p-5 xl:p-6">
      {/* Skills */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            已挂载 Skill ({form.selectedSkillCodes.length} / {skills.length})
          </h4>
          <div className="text-[11px] text-slate-500">
            真实数据来源：<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">/api/skills</code>
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            未加载到 Skill。请确认服务端 Skill Hub 已注册。
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {skills.map((s) => {
              const selected = form.selectedSkillCodes.includes(s.code);
              return (
                <div
                  key={s.code}
                  className={cn(
                    "rounded-lg border p-4 transition-all",
                    selected ? "border-blue-300 bg-blue-50/30" : "border-slate-200 bg-slate-50/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-bold text-slate-800">{s.displayName}</div>
                        <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                          {s.code}
                        </code>
                        <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {s.version}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500">
                        适用：{s.applicableWhen.diffType} · {s.applicableWhen.businessModule}　·　
                        Owner：{s.owner}　·　{s.stepCount} 步骤
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.steps.map((st) => (
                          <span
                            key={st.id}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
                            title={st.desc}
                          >
                            {st.tool ?? st.ruleCode ?? st.id}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleSkill(s.code)}
                      className="shrink-0"
                    >
                      {selected ? (
                        <ToggleRight className="h-8 w-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h4 className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Wrench className="h-5 w-5 text-cyan-600" />
            可装载 Tool ({form.selectedToolNames.length} / {tools.length})
          </h4>
          <div className="text-[11px] text-slate-500">
            真实数据来源：<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">/api/tools</code>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setToolCategory(c)}
                className={cn(
                  "rounded border px-2 py-0.5 text-[11px] font-bold transition-colors",
                  toolCategory === c
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {c === "all" ? "全部" : categoryLabels[c] ?? c}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={toolKeyword}
            onChange={(e) => setToolKeyword(e.target.value)}
            placeholder="按名称 / 描述搜索…"
            className="rounded border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-blue-400"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredTools.map((t) => {
            const selected = form.selectedToolNames.includes(t.name);
            const usedBy = toolToSkills[t.name] ?? [];
            return (
              <button
                key={t.name}
                type="button"
                disabled={disabled}
                onClick={() => toggleTool(t.name)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  selected
                    ? "border-blue-400 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <code className="font-mono text-xs font-bold text-slate-900">{t.name}</code>
                  </div>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    v{t.version}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{t.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                      sideEffectStyles[t.sideEffect] ?? "",
                    )}
                  >
                    {t.sideEffect}
                  </span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-bold",
                      sensitivityStyles[t.dataSensitivity] ?? "",
                    )}
                  >
                    {t.dataSensitivity}
                  </span>
                  {usedBy.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      <Lightbulb className="h-3 w-3" />
                      被 {usedBy.length} 个 Skill 使用
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>{t.connector} · {t.owner}</span>
                  {selected ? (
                    <span className="font-bold text-blue-600">已装载 ✓</span>
                  ) : (
                    <span>点击装载</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-700">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            POC 阶段所有 Tool 的副作用仅允许 <b>none / notify</b>，禁止写入 SAP/DMS/帆软等业务系统。
            写操作需走 Governance 审批流并由平台管理员审核。
          </span>
        </div>
      </div>
    </div>
  );
}

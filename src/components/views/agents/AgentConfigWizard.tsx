import React, { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Cpu,
  GitBranch,
  Info,
  Pencil,
  ShieldAlert,
  TerminalSquare,
  Wrench,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import {
  DEFAULT_DATA_QUALITY_FORM,
  EMPTY_FORM,
  type GatewayInfo,
  type HealthzInfo,
  type SkillApi,
  type ToolApi,
  type WizardFormState,
} from "@/src/components/views/agents/types";
import { Step1Basic } from "./wizardSteps/Step1Basic";
import { Step2Knowledge } from "./wizardSteps/Step2Knowledge";
import { Step3Capabilities } from "./wizardSteps/Step3Capabilities";
import { Step4Security } from "./wizardSteps/Step4Security";
import { Step5Runtime } from "./wizardSteps/Step5Runtime";
import { Step6Sandbox } from "./wizardSteps/Step6Sandbox";

const STEPS: Array<{
  id: number;
  title: string;
  desc: string;
  icon: React.ElementType;
}> = [
  { id: 1, title: "基础设定", desc: "身份与系统提示词", icon: Info },
  { id: 2, title: "知识与记忆", desc: "模型底座 + 记忆策略", icon: Cpu },
  { id: 3, title: "能力挂载", desc: "Skill / Tool 真实清单", icon: Wrench },
  { id: 4, title: "资源授权", desc: "谁能用 / 能读写什么", icon: ShieldAlert },
  { id: 5, title: "Runtime 架构", desc: "闭环 Workflow 画布", icon: GitBranch },
  { id: 6, title: "真沙盒测试", desc: "调 /api/analyze 验证", icon: TerminalSquare },
];

export function AgentConfigWizard({ agentId, onBack }: { agentId: string; onBack: () => void }) {
  const isNew = agentId === "new";
  const [isEditing, setIsEditing] = useState(isNew);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<WizardFormState>(
    isNew ? EMPTY_FORM : DEFAULT_DATA_QUALITY_FORM,
  );
  const [toast, setToast] = useState(false);

  // 拉真实元数据
  const [tools, setTools] = useState<ToolApi[]>([]);
  const [skills, setSkills] = useState<SkillApi[]>([]);
  const [health, setHealth] = useState<HealthzInfo | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tools").then((r) => r.json()),
      fetch("/api/skills").then((r) => r.json()),
      fetch("/api/healthz").then((r) => r.json()),
    ]).then(([t, s, h]) => {
      setTools(t);
      setSkills(s);
      setHealth(h);
    });
  }, []);

  const gateway: GatewayInfo | null = health?.gateway ?? null;

  const patch = (p: Partial<WizardFormState>) => setForm((prev) => ({ ...prev, ...p }));

  const handleSave = () => {
    setToast(true);
    setIsEditing(false);
    setTimeout(() => setToast(false), 2600);
  };

  const isLast = currentStep === STEPS.length;

  const stepContent = useMemo(() => {
    const disabled = !isEditing;
    switch (currentStep) {
      case 1:
        return <Step1Basic form={form} patch={patch} disabled={disabled} />;
      case 2:
        return <Step2Knowledge form={form} patch={patch} disabled={disabled} gateway={gateway} />;
      case 3:
        return (
          <Step3Capabilities
            form={form}
            patch={patch}
            disabled={disabled}
            tools={tools}
            skills={skills}
          />
        );
      case 4:
        return <Step4Security form={form} patch={patch} disabled={disabled} tools={tools} />;
      case 5:
        return <Step5Runtime form={form} patch={patch} disabled={disabled} gateway={gateway} />;
      case 6:
        return <Step6Sandbox form={form} gateway={gateway} />;
      default:
        return null;
    }
  }, [currentStep, isEditing, form, tools, skills, gateway]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute left-1/2 top-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold">Agent 配置已保存（POC 阶段仅在内存中生效）</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <button
              onClick={onBack}
              className="mr-1 rounded p-1 text-slate-500 hover:bg-slate-200"
              title="返回列表"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <Bot className="h-4 w-4 text-blue-600" />
            {isNew ? "新建 Agent (配置向导)" : `${form.name} (配置向导)`}
          </h3>
          <p className="mt-1 pl-8 text-xs text-slate-500">
            按 6 步向导配置该领域 Agent；步骤 3-6 接的全部是后端真实数据，可端到端验证闭环。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100"
            >
              <Pencil className="h-4 w-4" /> 修改配置
            </button>
          )}
          {isEditing && !isNew && (
            <button
              onClick={() => {
                setIsEditing(false);
                setForm(DEFAULT_DATA_QUALITY_FORM);
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X className="h-4 w-4" /> 取消修改
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden max-lg:flex-col">
        {/* 左侧 stepper */}
        <div className="flex w-[clamp(13rem,16vw,16.5rem)] shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-100 bg-slate-50 p-5 max-lg:w-full max-lg:flex-row max-lg:gap-3 max-lg:overflow-x-auto max-lg:border-b max-lg:border-r-0 max-lg:p-3">
          {STEPS.map((st, idx) => {
            const active = currentStep === st.id;
            const completed = currentStep > st.id;
            const Icon = st.icon;
            return (
              <div key={st.id} className="relative flex min-w-0 gap-3 max-lg:w-44 max-lg:shrink-0">
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute bottom-[-20px] left-4 top-10 w-0.5 max-lg:hidden",
                      completed ? "bg-blue-600" : "bg-slate-200",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-colors",
                    active
                      ? "border-blue-600 text-blue-600 ring-4 ring-blue-600/10"
                      : completed
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-400",
                  )}
                >
                  {completed ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Icon className="h-4 w-4" />}
                </div>
                <button
                  className="min-w-0 cursor-pointer pt-1 text-left"
                  onClick={() => setCurrentStep(st.id)}
                >
                  <h4
                    className={cn(
                      "text-sm font-bold transition-colors",
                      active ? "text-blue-700" : completed ? "text-slate-800" : "text-slate-500",
                    )}
                  >
                    {st.title}
                  </h4>
                  <p className="mt-1 truncate text-[10px] leading-relaxed text-slate-500 lg:whitespace-normal">
                    {st.desc}
                  </p>
                </button>
              </div>
            );
          })}
        </div>

        {/* 右侧 step content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/30">
          <fieldset
            className={cn(
              "m-0 flex h-full min-w-0 flex-col overflow-y-auto border-none p-0",
              !isEditing && "opacity-95",
            )}
          >
            {stepContent}
          </fieldset>

          {/* footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-6 py-3">
            <div className="text-xs text-slate-500">
              向导步骤：<span className="font-bold text-blue-600">{currentStep} / {STEPS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  上一步
                </button>
              )}
              {isLast ? (
                <button
                  onClick={handleSave}
                  disabled={!isEditing}
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  保存配置
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  下一步
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

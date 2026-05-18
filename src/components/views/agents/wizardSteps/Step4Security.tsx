import React from "react";
import {
  AlertTriangle,
  Database,
  Eye,
  FolderLock,
  ShieldBan,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ToolApi, WizardFormState } from "@/src/components/views/agents/types";

interface Props {
  form: WizardFormState;
  patch: (p: Partial<WizardFormState>) => void;
  disabled: boolean;
  tools: ToolApi[];
}

export function Step4Security({ form, patch, disabled, tools }: Props) {
  const selected = tools.filter((t) => form.selectedToolNames.includes(t.name));
  const counts = {
    none: selected.filter((t) => t.sideEffect === "none").length,
    notify: selected.filter((t) => t.sideEffect === "notify").length,
    write: selected.filter((t) => t.sideEffect === "write").length,
  };
  const hasWrite = counts.write > 0;

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 space-y-5 p-4 duration-500 sm:p-5 xl:p-6">
      {/* 边界声明 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          安全与数据隔离
        </h4>

        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <div className="font-bold text-emerald-900">POC 阶段强制安全边界</div>
              <ul className="mt-2 space-y-1 text-xs leading-6 text-emerald-800">
                <li>
                  · 所有 Tool 的 <code className="rounded bg-white px-1 font-mono">sideEffect</code>
                  仅允许 <b>none</b> 或 <b>notify</b>，禁止写入 SAP / DMS / 帆软等业务系统；
                </li>
                <li>· 模型只接收脱敏后的证据摘要，禁止把单号 / MDM ID / 金额原文发往模型；</li>
                <li>· 任何"自动修复 / 自动过账 / 替代外部系统"动作均被 Runtime 层拒绝；</li>
                <li>· 复核结论由人工在工作台确认后才能落库为案例。</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SideEffectStat tone="emerald" label="无副作用 (none)" value={counts.none} />
          <SideEffectStat tone="amber" label="可通知 (notify)" value={counts.notify} />
          <SideEffectStat
            tone={hasWrite ? "rose" : "slate"}
            label="写入 (write)"
            value={counts.write}
          />
        </div>

        {hasWrite && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              当前选中的 Tool 中存在 <b>write</b> 副作用，POC 阶段会被 Runtime 强制拦截。
              如确需写入业务系统，请在 Governance 模块提交审批工单。
            </span>
          </div>
        )}
      </div>

      {/* 数据沙箱配置 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
        <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
          <FolderLock className="h-5 w-5 text-indigo-600" />
          数据沙箱与脱敏
        </h4>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              数据权限沙箱 (Data Sandbox)
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              <SandboxOption
                checked={form.sandboxMode === "strict"}
                onClick={() => !disabled && patch({ sandboxMode: "strict" })}
                title="严格隔离"
                desc="仅允许访问该 Agent owner 所属组织/业务线的数据，跨域访问被拒绝。"
                icon={ShieldCheck}
                tone="emerald"
              />
              <SandboxOption
                checked={form.sandboxMode === "global_read_only"}
                onClick={() => !disabled && patch({ sandboxMode: "global_read_only" })}
                title="全局只读"
                desc="可访问全部业务线只读数据；写入仍被禁止。需平台管理员二次审批。"
                icon={Eye}
                tone="blue"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">敏感字段脱敏</label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={form.desensitize}
                disabled={disabled}
                onChange={(e) => patch({ desensitize: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-700">
                  把 PII / 单号 / 金额 替换为占位符后再传给模型
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Model Gateway 会把 billNo / mdmId / amount 替换为 X / Y / A 等占位符；
                  原文证据仅保存在内网 Trace 中，方便复核但不出域。
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <BoundaryCard
            tone="emerald"
            label="财务结算数据库"
            mode="只读"
            modeIcon={Eye}
            badges={["db.billing.orders", "db.billing.invoices"]}
          />
          <BoundaryCard
            tone="cyan"
            label="对账规则 / 案例库"
            mode="只读"
            modeIcon={Eye}
            badges={["rule.eval_*", "skill.report_template"]}
          />
          <BoundaryCard
            tone="rose"
            label="HR / 薪酬系统"
            mode="禁止访问"
            modeIcon={ShieldBan}
            badges={["wall_off:by_policy"]}
            denied
          />
        </div>
      </div>
    </div>
  );
}

function SideEffectStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const cls: Record<string, string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <div className={cn("rounded-lg border p-3", cls[tone])}>
      <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function SandboxOption({
  checked,
  onClick,
  title,
  desc,
  icon: Icon,
  tone,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ElementType;
  tone: "emerald" | "blue";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all",
        checked
          ? tone === "emerald"
            ? "border-emerald-500 bg-emerald-50/40"
            : "border-blue-500 bg-blue-50/40"
          : "border-slate-200 bg-white hover:border-blue-300",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          checked ? (tone === "emerald" ? "text-emerald-600" : "text-blue-600") : "text-slate-400",
        )}
      />
      <div>
        <div className="text-sm font-bold text-slate-800">{title}</div>
        <div className="mt-0.5 text-[11px] text-slate-500">{desc}</div>
      </div>
    </button>
  );
}

function BoundaryCard({
  label,
  mode,
  modeIcon: ModeIcon,
  badges,
  tone,
  denied,
}: {
  label: string;
  mode: string;
  modeIcon: React.ElementType;
  badges: string[];
  tone: "emerald" | "blue" | "cyan" | "rose";
  denied?: boolean;
}) {
  const accent: Record<string, string> = {
    emerald: "border-l-emerald-500",
    blue: "border-l-blue-500",
    cyan: "border-l-cyan-500",
    rose: "border-l-rose-500",
  };
  const tag: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-l-4 bg-white p-3 shadow-sm",
        accent[tone],
        denied && "opacity-80",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Database className="h-4 w-4 text-slate-400" />
          {label}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold",
            tag[tone],
          )}
        >
          <ModeIcon className="h-3 w-3" />
          {mode}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

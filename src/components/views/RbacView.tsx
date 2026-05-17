import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

type Decision = "允许" | "拒绝" | "需审批";

const users = [
  { id: "U01", name: "财务复核人", org: "财务共享中心", role: "财务复核人", scope: "收入模块", status: "启用" },
  { id: "U02", name: "DMS负责人", org: "业务系统部", role: "DMS负责人", scope: "DMS证据", status: "启用" },
  { id: "U03", name: "SAP负责人", org: "ERP团队", role: "SAP负责人", scope: "SAP证据", status: "启用" },
  { id: "U04", name: "平台管理员", org: "数据平台部", role: "平台管理员", scope: "平台配置", status: "启用" },
  { id: "U05", name: "审计员", org: "内控审计部", role: "审计员", scope: "全链路审计", status: "启用" },
];

const organizations = [
  { id: "ORG01", name: "财务共享中心", parent: "方太集团", users: 18, dataScope: "收入/应收" },
  { id: "ORG02", name: "业务系统部", parent: "信息中心", users: 12, dataScope: "DMS/主数据" },
  { id: "ORG03", name: "ERP团队", parent: "信息中心", users: 9, dataScope: "SAP/接口" },
  { id: "ORG04", name: "内控审计部", parent: "方太集团", users: 6, dataScope: "审计日志" },
];

const agents = [
  { id: "A01", name: "方太数据质检智能归因 Agent", owner: "财务共享中心", status: "运行中" },
  { id: "A02", name: "应收质检 Agent", owner: "财务共享中心", status: "待发布" },
  { id: "A03", name: "合同资产质检 Agent", owner: "财务共享中心", status: "待发布" },
];

const resources = [
  { id: "RES01", name: "帆软差异清单", type: "数据源", sensitivity: "内部", owner: "财务共享中心" },
  { id: "RES02", name: "DMS收入台账", type: "数据源", sensitivity: "敏感", owner: "业务系统部" },
  { id: "RES03", name: "SAP过账凭证", type: "数据源", sensitivity: "敏感", owner: "ERP团队" },
  { id: "RES04", name: "接口回传日志", type: "日志", sensitivity: "内部", owner: "ERP团队" },
  { id: "RES05", name: "模型连接配置", type: "模型", sensitivity: "高敏", owner: "数据平台部" },
  { id: "RES06", name: "业务Skill库", type: "Skill", sensitivity: "内部", owner: "数据平台部" },
];

const policies = [
  {
    id: "P01",
    subject: "财务复核人",
    agent: "方太数据质检智能归因 Agent",
    resource: "帆软差异清单",
    actions: ["调用Agent", "查看报告", "确认归因", "退回复核"],
    decision: "允许" as Decision,
    reason: "财务复核角色拥有收入模块复核权限",
  },
  {
    id: "P02",
    subject: "DMS负责人",
    agent: "方太数据质检智能归因 Agent",
    resource: "DMS收入台账",
    actions: ["查看DMS证据", "补充复核意见"],
    decision: "允许" as Decision,
    reason: "资源归属业务系统部，角色匹配DMS负责人",
  },
  {
    id: "P03",
    subject: "SAP负责人",
    agent: "方太数据质检智能归因 Agent",
    resource: "SAP过账凭证",
    actions: ["查看SAP证据", "补充复核意见"],
    decision: "允许" as Decision,
    reason: "资源归属ERP团队，角色匹配SAP负责人",
  },
  {
    id: "P04",
    subject: "审计员",
    agent: "方太数据质检智能归因 Agent",
    resource: "审计日志",
    actions: ["查看审计日志"],
    decision: "允许" as Decision,
    reason: "审计员仅授予只读追溯权限",
  },
  {
    id: "P05",
    subject: "财务复核人",
    agent: "方太数据质检智能归因 Agent",
    resource: "SAP过账凭证",
    actions: ["查看原始凭证"],
    decision: "拒绝" as Decision,
    reason: "财务复核人只能查看脱敏报告，不能查看SAP原始凭证",
  },
  {
    id: "P06",
    subject: "平台管理员",
    agent: "方太数据质检智能归因 Agent",
    resource: "业务Skill库",
    actions: ["编辑Skill", "发布Agent", "配置模型"],
    decision: "需审批" as Decision,
    reason: "生产Agent发布和模型变更需要二次审批",
  },
];

const auditLogs = [
  { time: "10:21:03", user: "财务复核人", action: "调用Agent", target: "DIFF001", result: "允许" },
  { time: "10:21:05", user: "方太数据质检Agent", action: "读取资源", target: "DMS收入台账", result: "允许/只读" },
  { time: "10:21:08", user: "财务复核人", action: "查看SAP原始凭证", target: "SAP过账凭证", result: "拒绝" },
  { time: "10:22:14", user: "平台管理员", action: "发布Agent", target: "数据质检Agent", result: "需审批" },
];

const actions = ["调用Agent", "查看报告", "查看DMS证据", "查看SAP证据", "查看原始凭证", "编辑Skill", "发布Agent", "查看审计日志"];

function decisionStyle(decision: Decision | string) {
  if (decision.includes("允许")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (decision.includes("拒绝")) return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

function decide(role: string, resource: string, action: string) {
  const hit = policies.find((policy) => policy.subject === role && policy.resource === resource && policy.actions.includes(action));
  if (hit) return hit;

  if (role === "平台管理员" && ["编辑Skill", "发布Agent"].includes(action)) {
    return {
      id: "AUTO_ADMIN_APPROVAL",
      subject: role,
      agent: "方太数据质检智能归因 Agent",
      resource,
      actions: [action],
      decision: "需审批" as Decision,
      reason: "管理员执行生产配置变更需审批",
    };
  }

  if (role === "审计员" && action !== "查看审计日志") {
    return {
      id: "AUTO_AUDIT_READONLY",
      subject: role,
      agent: "方太数据质检智能归因 Agent",
      resource,
      actions: [action],
      decision: "拒绝" as Decision,
      reason: "审计员为只读审计角色",
    };
  }

  return {
    id: "DEFAULT_DENY",
    subject: role,
    agent: "方太数据质检智能归因 Agent",
    resource,
    actions: [action],
    decision: "拒绝" as Decision,
    reason: "未命中显式授权策略",
  };
}

export function RbacView() {
  const [section, setSection] = useState<"subject" | "agent" | "resource" | "policy" | "simulate" | "audit">("simulate");
  const [selectedRole, setSelectedRole] = useState("财务复核人");
  const [selectedAgent, setSelectedAgent] = useState("方太数据质检智能归因 Agent");
  const [selectedResource, setSelectedResource] = useState("SAP过账凭证");
  const [selectedAction, setSelectedAction] = useState("查看原始凭证");

  const simulation = useMemo(() => decide(selectedRole, selectedResource, selectedAction), [selectedRole, selectedResource, selectedAction]);

  const nav = [
    { id: "subject", label: "用户与组织", icon: Users },
    { id: "agent", label: "Agent权限", icon: Bot },
    { id: "resource", label: "资源授权", icon: Database },
    { id: "policy", label: "策略矩阵", icon: ShieldCheck },
    { id: "simulate", label: "权限模拟", icon: Activity },
    { id: "audit", label: "审计日志", icon: FileText },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Shield className="h-5 w-5 text-blue-600" />
          权限与安全控制台
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          统一管理人、组织、资源、Agent 和动作之间的权限关系，支持Agent入站授权、出站资源边界、有效权限模拟和审计追溯。
        </p>
      </div>

      <div className="grid h-[calc(100%-92px)] grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-100 bg-slate-50/50 p-4">
          <div className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-colors",
                    section === item.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="overflow-auto p-6">
          {section === "subject" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-lg border border-slate-200">
                <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">用户</div>
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-[1fr_120px_100px] gap-4 px-5 py-4 text-sm">
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{user.org} / {user.role}</div>
                      </div>
                      <div className="text-slate-600">{user.scope}</div>
                      <div className="text-right">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{user.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200">
                <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">组织</div>
                <div className="divide-y divide-slate-100">
                  {organizations.map((org) => (
                    <div key={org.id} className="grid grid-cols-[1fr_80px_140px] gap-4 px-5 py-4 text-sm">
                      <div>
                        <div className="font-bold text-slate-900">{org.name}</div>
                        <div className="mt-1 text-xs text-slate-500">上级：{org.parent}</div>
                      </div>
                      <div className="text-slate-600">{org.users} 人</div>
                      <div className="text-slate-600">{org.dataScope}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {section === "agent" && (
            <div className="space-y-5">
              {agents.map((agent) => {
                const inbound = policies.filter((policy) => policy.agent === agent.name);
                const allowedResources = policies.filter((policy) => policy.agent === agent.name && policy.decision !== "拒绝");
                return (
                  <section key={agent.id} className="rounded-lg border border-slate-200 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <Bot className="h-4 w-4 text-blue-600" />
                          {agent.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">负责人组织：{agent.owner}</div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{agent.status}</span>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-xs font-bold text-slate-500">用户到Agent</div>
                        <div className="space-y-2">
                          {inbound.slice(0, 5).map((policy) => (
                            <div key={policy.id} className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
                              <span className="font-bold text-slate-700">{policy.subject}</span>
                              <span className={cn("rounded border px-2 py-1 text-xs font-bold", decisionStyle(policy.decision))}>{policy.decision}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-xs font-bold text-slate-500">Agent到资源</div>
                        <div className="space-y-2">
                          {allowedResources.slice(0, 5).map((policy) => (
                            <div key={policy.id} className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
                              <span className="font-bold text-slate-700">{policy.resource}</span>
                              <span className="text-xs text-slate-500">{policy.actions.join(" / ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {section === "resource" && (
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">资源授权</div>
              <div className="divide-y divide-slate-100">
                {resources.map((resource) => (
                  <div key={resource.id} className="grid grid-cols-[1fr_120px_120px_160px] gap-4 px-5 py-4 text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{resource.name}</div>
                      <div className="mt-1 text-xs text-slate-500">归属：{resource.owner}</div>
                    </div>
                    <div className="text-slate-600">{resource.type}</div>
                    <div>
                      <span className={cn("rounded-full px-2 py-1 text-xs font-bold", resource.sensitivity === "高敏" ? "bg-rose-50 text-rose-700" : resource.sensitivity === "敏感" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>
                        {resource.sensitivity}
                      </span>
                    </div>
                    <div className="text-slate-600">按角色/Agent授权</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "policy" && (
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">策略矩阵</div>
              <div className="divide-y divide-slate-100">
                {policies.map((policy) => (
                  <div key={policy.id} className="grid grid-cols-[130px_1fr_170px_110px] gap-4 px-5 py-4 text-sm">
                    <div className="font-bold text-slate-900">{policy.subject}</div>
                    <div>
                      <div className="font-bold text-slate-700">{policy.agent}</div>
                      <div className="mt-1 text-xs text-slate-500">{policy.resource} / {policy.actions.join("、")}</div>
                    </div>
                    <div className="text-slate-600">{policy.reason}</div>
                    <div>
                      <span className={cn("rounded border px-2 py-1 text-xs font-bold", decisionStyle(policy.decision))}>{policy.decision}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "simulate" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <section className="rounded-lg border border-slate-200 p-5">
                <h4 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
                  <Search className="h-4 w-4 text-blue-600" />
                  权限模拟器
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500">用户角色</label>
                    <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {[...new Set(users.map((user) => user.role))].map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500">Agent</label>
                    <select value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {agents.map((agent) => <option key={agent.id}>{agent.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500">资源</label>
                    <select value={selectedResource} onChange={(event) => setSelectedResource(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {[...resources.map((resource) => resource.name), "审计日志"].map((resource) => <option key={resource}>{resource}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500">动作</label>
                    <select value={selectedAction} onChange={(event) => setSelectedAction(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
                      {actions.map((action) => <option key={action}>{action}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <aside className="rounded-lg border border-slate-200 p-5">
                <h4 className="mb-4 font-bold text-slate-900">有效权限</h4>
                <div className={cn("mb-4 flex items-center gap-3 rounded-lg border px-4 py-3", decisionStyle(simulation.decision))}>
                  {simulation.decision === "允许" ? <CheckCircle2 className="h-5 w-5" /> : simulation.decision === "拒绝" ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  <span className="text-lg font-bold">{simulation.decision}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-bold text-slate-400">命中策略</div>
                    <div className="mt-1 font-mono font-bold text-slate-700">{simulation.id}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">原因</div>
                    <div className="mt-1 leading-6 text-slate-700">{simulation.reason}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">请求</div>
                    <div className="mt-1 leading-6 text-slate-700">{selectedRole} / {selectedAgent} / {selectedResource} / {selectedAction}</div>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {section === "audit" && (
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">审计日志</div>
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={`${log.time}-${log.action}`} className="grid grid-cols-[110px_150px_1fr_120px] gap-4 px-5 py-4 text-sm">
                    <div className="font-mono text-slate-500">{log.time}</div>
                    <div className="font-bold text-slate-900">{log.user}</div>
                    <div className="text-slate-600">{log.action} / {log.target}</div>
                    <div>
                      <span className={cn("rounded border px-2 py-1 text-xs font-bold", decisionStyle(log.result))}>{log.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </motion.div>
  );
}

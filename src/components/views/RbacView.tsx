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
type Section = "subject" | "menu" | "button" | "api" | "agent" | "resource" | "policy" | "simulate" | "audit";
type PermissionKind = "菜单权限" | "按钮权限" | "接口权限" | "数据/资源权限" | "Agent权限";

const users = [
  { id: "U01", name: "财务复核人", org: "财务共享中心", role: "财务复核人", scope: "收入模块", status: "启用" },
  { id: "U02", name: "DMS负责人", org: "业务系统部", role: "DMS负责人", scope: "DMS证据", status: "启用" },
  { id: "U03", name: "SAP负责人", org: "ERP团队", role: "SAP负责人", scope: "SAP证据", status: "启用" },
  { id: "U04", name: "平台管理员", org: "数据平台部", role: "平台管理员", scope: "平台配置", status: "启用" },
  { id: "U05", name: "审计员", org: "内控审计部", role: "审计员", scope: "全链路审计", status: "启用" },
];

const organizations = [
  { id: "ORG01", name: "财务共享中心", parent: "演示集团", users: 18, dataScope: "收入 / 应收" },
  { id: "ORG02", name: "业务系统部", parent: "信息中心", users: 12, dataScope: "DMS / 主数据" },
  { id: "ORG03", name: "ERP团队", parent: "信息中心", users: 9, dataScope: "SAP / 接口" },
  { id: "ORG04", name: "内控审计部", parent: "演示集团", users: 6, dataScope: "审计日志" },
];

const roles = users.map((user) => user.role);

const menus = [
  { id: "MENU_DASHBOARD", name: "运营大盘", module: "核心管控", roles: ["平台管理员", "财务复核人", "审计员"], status: "启用" },
  { id: "MENU_TASKS", name: "数据质检 Agent", module: "业务支撑", roles: ["平台管理员", "财务复核人", "DMS负责人", "SAP负责人", "审计员"], status: "启用" },
  { id: "MENU_AGENT", name: "Agent 配置", module: "核心管控", roles: ["平台管理员"], status: "启用" },
  { id: "MENU_MODEL", name: "模型管理", module: "核心管控", roles: ["平台管理员"], status: "启用" },
  { id: "MENU_SKILL", name: "技能管理", module: "核心管控", roles: ["平台管理员"], status: "启用" },
  { id: "MENU_DATA", name: "数据管理", module: "核心管控", roles: ["平台管理员", "DMS负责人", "SAP负责人"], status: "启用" },
  { id: "MENU_RBAC", name: "权限与安全", module: "系统管理", roles: ["平台管理员", "审计员"], status: "启用" },
];

const buttons = [
  { id: "BTN_ANALYZE", name: "启动归因", page: "数据质检 Agent", action: "执行", risk: "中", roles: ["平台管理员", "财务复核人"] },
  { id: "BTN_CONFIRM", name: "确认归因", page: "数据质检 Agent", action: "复核", risk: "中", roles: ["财务复核人"] },
  { id: "BTN_REJECT", name: "退回复核", page: "数据质检 Agent", action: "复核", risk: "中", roles: ["财务复核人", "DMS负责人", "SAP负责人"] },
  { id: "BTN_MODEL_CREATE", name: "新增模型", page: "模型管理", action: "新增", risk: "高", roles: ["平台管理员"] },
  { id: "BTN_MODEL_DELETE", name: "删除模型", page: "模型管理", action: "删除", risk: "高", roles: ["平台管理员"] },
  { id: "BTN_SKILL_CREATE", name: "新增技能", page: "技能管理", action: "新增", risk: "高", roles: ["平台管理员"] },
  { id: "BTN_SKILL_DISABLE", name: "停用技能", page: "技能管理", action: "变更", risk: "高", roles: ["平台管理员"] },
  { id: "BTN_AGENT_PUBLISH", name: "发布 Agent", page: "Agent 配置", action: "发布", risk: "高", roles: ["平台管理员"] },
];

const apis = [
  { id: "API_DIFFERENCES", method: "GET", path: "/api/differences", name: "差异清单查询", roles: ["平台管理员", "财务复核人", "DMS负责人", "SAP负责人", "审计员"], audit: "记录查询人" },
  { id: "API_ANALYZE", method: "POST", path: "/api/analyze", name: "执行归因分析", roles: ["平台管理员", "财务复核人"], audit: "记录请求与结果摘要" },
  { id: "API_READINESS", method: "GET", path: "/api/poc-readiness", name: "系统就绪状态", roles: ["平台管理员", "审计员"], audit: "记录访问" },
  { id: "API_MODELS", method: "POST/PUT/DELETE", path: "/api/model-config", name: "模型配置维护", roles: ["平台管理员"], audit: "记录变更前后差异" },
  { id: "API_SKILLS", method: "POST/PUT/DELETE", path: "/api/skills", name: "技能配置维护", roles: ["平台管理员"], audit: "记录版本与发布人" },
  { id: "API_RBAC", method: "POST/PUT", path: "/api/rbac/policies", name: "权限策略维护", roles: ["平台管理员"], audit: "强制审计" },
  { id: "API_AUDIT", method: "GET", path: "/api/audit/logs", name: "审计日志查询", roles: ["平台管理员", "审计员"], audit: "记录查询范围" },
];

const agents = [
  { id: "A01", name: "数据质检智能归因 Agent", owner: "财务共享中心", status: "运行中" },
  { id: "A02", name: "应收质检 Agent", owner: "财务共享中心", status: "待发布" },
  { id: "A03", name: "合同资产质检 Agent", owner: "财务共享中心", status: "待发布" },
];

const resources = [
  { id: "RES01", name: "帆软差异清单", type: "数据源", sensitivity: "内部", owner: "财务共享中心" },
  { id: "RES02", name: "DMS收入台账", type: "数据源", sensitivity: "敏感", owner: "业务系统部" },
  { id: "RES03", name: "SAP过账凭证", type: "数据源", sensitivity: "敏感", owner: "ERP团队" },
  { id: "RES04", name: "接口回传日志", type: "日志", sensitivity: "内部", owner: "ERP团队" },
  { id: "RES05", name: "模型连接配置", type: "模型", sensitivity: "高敏", owner: "数据平台部" },
  { id: "RES06", name: "业务 Skill 库", type: "Skill", sensitivity: "内部", owner: "数据平台部" },
];

const policies = [
  {
    id: "P01",
    subject: "财务复核人",
    agent: "数据质检智能归因 Agent",
    resource: "帆软差异清单",
    actions: ["调用Agent", "查看报告", "确认归因", "退回复核"],
    decision: "允许" as Decision,
    reason: "财务复核角色拥有收入模块复核权限",
  },
  {
    id: "P02",
    subject: "DMS负责人",
    agent: "数据质检智能归因 Agent",
    resource: "DMS收入台账",
    actions: ["查看DMS证据", "补充复核意见"],
    decision: "允许" as Decision,
    reason: "资源归属业务系统部，角色匹配DMS负责人",
  },
  {
    id: "P03",
    subject: "SAP负责人",
    agent: "数据质检智能归因 Agent",
    resource: "SAP过账凭证",
    actions: ["查看SAP证据", "补充复核意见"],
    decision: "允许" as Decision,
    reason: "资源归属ERP团队，角色匹配SAP负责人",
  },
  {
    id: "P04",
    subject: "审计员",
    agent: "数据质检智能归因 Agent",
    resource: "审计日志",
    actions: ["查看审计日志"],
    decision: "允许" as Decision,
    reason: "审计员仅授予只读追溯权限",
  },
  {
    id: "P05",
    subject: "财务复核人",
    agent: "数据质检智能归因 Agent",
    resource: "SAP过账凭证",
    actions: ["查看原始凭证"],
    decision: "拒绝" as Decision,
    reason: "财务复核人只能查看脱敏报告，不能查看SAP原始凭证",
  },
  {
    id: "P06",
    subject: "平台管理员",
    agent: "数据质检智能归因 Agent",
    resource: "业务 Skill 库",
    actions: ["编辑Skill", "发布Agent", "配置模型"],
    decision: "需审批" as Decision,
    reason: "生产Agent发布和模型变更需要二次审批",
  },
];

const auditLogs = [
  { time: "10:21:03", user: "财务复核人", action: "调用Agent", target: "DIFF001", result: "允许" },
  { time: "10:21:05", user: "数据质检Agent", action: "读取资源", target: "DMS收入台账", result: "允许/只读" },
  { time: "10:21:08", user: "财务复核人", action: "查看SAP原始凭证", target: "SAP过账凭证", result: "拒绝" },
  { time: "10:22:14", user: "平台管理员", action: "发布Agent", target: "数据质检Agent", result: "需审批" },
];

const resourceActions = ["调用Agent", "查看报告", "查看DMS证据", "查看SAP证据", "查看原始凭证", "编辑Skill", "发布Agent", "查看审计日志"];
const permissionKinds: PermissionKind[] = ["菜单权限", "按钮权限", "接口权限", "数据/资源权限", "Agent权限"];

function decisionStyle(decision: Decision | string) {
  if (decision.includes("允许")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (decision.includes("拒绝")) return "bg-rose-50 text-rose-700 border-rose-100";
  return "bg-amber-50 text-amber-700 border-amber-100";
}

function riskStyle(risk: string) {
  if (risk === "高") return "bg-rose-50 text-rose-700";
  if (risk === "中") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function decideResource(role: string, resource: string, action: string) {
  const hit = policies.find((policy) => policy.subject === role && policy.resource === resource && policy.actions.includes(action));
  if (hit) return hit;

  if (role === "平台管理员" && ["编辑Skill", "发布Agent"].includes(action)) {
    return {
      id: "AUTO_ADMIN_APPROVAL",
      subject: role,
      agent: "数据质检智能归因 Agent",
      resource,
      actions: [action],
      decision: "需审批" as Decision,
      reason: "管理员执行生产配置变更需要审批",
    };
  }

  if (role === "审计员" && action !== "查看审计日志") {
    return {
      id: "AUTO_AUDIT_READONLY",
      subject: role,
      agent: "数据质检智能归因 Agent",
      resource,
      actions: [action],
      decision: "拒绝" as Decision,
      reason: "审计员为只读审计角色",
    };
  }

  return {
    id: "DEFAULT_DENY",
    subject: role,
    agent: "数据质检智能归因 Agent",
    resource,
    actions: [action],
    decision: "拒绝" as Decision,
    reason: "未命中显式授权策略",
  };
}

function decideBasic(kind: PermissionKind, role: string, target: string) {
  const source =
    kind === "菜单权限" ? menus.find((item) => item.name === target) :
    kind === "按钮权限" ? buttons.find((item) => item.name === target) :
    kind === "接口权限" ? apis.find((item) => item.path === target) :
    undefined;

  if (!source) {
    return {
      id: "UNKNOWN_TARGET",
      subject: role,
      agent: "系统权限网关",
      resource: target,
      actions: [kind],
      decision: "拒绝" as Decision,
      reason: "权限对象不存在",
    };
  }

  const allowed = source.roles.includes(role);
  const requiresApproval = kind === "按钮权限" && target === "发布 Agent" && role === "平台管理员";
  return {
    id: source.id,
    subject: role,
    agent: "系统权限网关",
    resource: target,
    actions: [kind],
    decision: requiresApproval ? "需审批" as Decision : allowed ? "允许" as Decision : "拒绝" as Decision,
    reason: requiresApproval ? "高风险发布动作需二次审批" : allowed ? "角色已被授予该权限" : "角色未被授予该权限",
  };
}

export function RbacView() {
  const [section, setSection] = useState<Section>("simulate");
  const [permissionKind, setPermissionKind] = useState<PermissionKind>("Agent权限");
  const [selectedRole, setSelectedRole] = useState("财务复核人");
  const [selectedAgent, setSelectedAgent] = useState("数据质检智能归因 Agent");
  const [selectedResource, setSelectedResource] = useState("SAP过账凭证");
  const [selectedAction, setSelectedAction] = useState("查看原始凭证");
  const [selectedMenu, setSelectedMenu] = useState("模型管理");
  const [selectedButton, setSelectedButton] = useState("发布 Agent");
  const [selectedApi, setSelectedApi] = useState("/api/analyze");

  const simulation = useMemo(() => {
    if (permissionKind === "菜单权限") return decideBasic(permissionKind, selectedRole, selectedMenu);
    if (permissionKind === "按钮权限") return decideBasic(permissionKind, selectedRole, selectedButton);
    if (permissionKind === "接口权限") return decideBasic(permissionKind, selectedRole, selectedApi);
    return decideResource(selectedRole, selectedResource, selectedAction);
  }, [permissionKind, selectedAction, selectedApi, selectedButton, selectedMenu, selectedResource, selectedRole]);

  const nav = [
    { id: "subject", label: "人和组织", icon: Users },
    { id: "menu", label: "菜单权限", icon: FileText },
    { id: "button", label: "按钮权限", icon: Lock },
    { id: "api", label: "接口权限", icon: Database },
    { id: "agent", label: "Agent 权限", icon: Bot },
    { id: "resource", label: "资源授权", icon: Shield },
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
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
          统一管理人、组织、角色、菜单、按钮、接口、数据资源和 Agent 的授权关系，支持有效权限模拟、Agent 出站访问边界和审计追溯。
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

          {section === "menu" && (
            <PermissionTable
              title="菜单权限"
              description="控制用户是否能看到和进入某个功能模块。"
              rows={menus.map((item) => ({
                id: item.id,
                main: item.name,
                sub: item.module,
                meta: item.status,
                roles: item.roles,
              }))}
            />
          )}

          {section === "button" && (
            <PermissionTable
              title="按钮权限"
              description="控制页面内新增、编辑、删除、发布、确认、退回等动作入口。"
              rows={buttons.map((item) => ({
                id: item.id,
                main: item.name,
                sub: `${item.page} / ${item.action}`,
                meta: `风险：${item.risk}`,
                roles: item.roles,
                risk: item.risk,
              }))}
            />
          )}

          {section === "api" && (
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="font-bold text-slate-900">接口权限</div>
                <p className="mt-1 text-sm text-slate-500">控制后端 API 调用，前端隐藏按钮不能替代接口鉴权。</p>
              </div>
              <div className="divide-y divide-slate-100">
                {apis.map((api) => (
                  <div key={api.id} className="grid grid-cols-[140px_1fr_260px_180px] gap-4 px-5 py-4 text-sm">
                    <div>
                      <span className="rounded bg-slate-100 px-2 py-1 font-bold text-slate-700">{api.method}</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{api.path}</div>
                      <div className="mt-1 text-xs text-slate-500">{api.name}</div>
                    </div>
                    <div className="text-slate-600">{api.roles.join("、")}</div>
                    <div className="text-xs text-slate-500">{api.audit}</div>
                  </div>
                ))}
              </div>
            </section>
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
                        <div className="font-bold text-slate-900">{agent.name}</div>
                        <div className="mt-1 text-xs text-slate-500">负责人：{agent.owner}</div>
                      </div>
                      <span className={cn("rounded-full border px-2 py-1 text-xs font-bold", agent.status === "运行中" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="text-sm font-bold text-blue-900">入站授权</div>
                        <p className="mt-2 text-sm leading-6 text-blue-700">
                          谁可以查看、调用、配置或发布该 Agent。当前命中 {inbound.length} 条策略。
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-4">
                        <div className="text-sm font-bold text-emerald-900">出站边界</div>
                        <p className="mt-2 text-sm leading-6 text-emerald-700">
                          Agent 可访问的数据源、模型、Skill 和日志范围。当前允许 {allowedResources.length} 类资源。
                        </p>
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
                  <div key={resource.id} className="grid grid-cols-[1fr_120px_120px_180px] gap-4 px-5 py-4 text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{resource.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{resource.id}</div>
                    </div>
                    <div className="text-slate-600">{resource.type}</div>
                    <div>
                      <span className={cn("rounded-full px-2 py-1 text-xs font-bold", resource.sensitivity === "高敏" ? "bg-rose-50 text-rose-700" : resource.sensitivity === "敏感" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600")}>
                        {resource.sensitivity}
                      </span>
                    </div>
                    <div className="text-slate-600">{resource.owner}</div>
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
                  <div key={policy.id} className="grid grid-cols-[130px_1fr_180px_110px] gap-4 px-5 py-4 text-sm">
                    <div className="font-bold text-slate-900">{policy.subject}</div>
                    <div>
                      <div className="text-slate-700">{policy.resource}</div>
                      <div className="mt-1 text-xs text-slate-500">{policy.actions.join("、")}</div>
                    </div>
                    <div className="text-xs leading-5 text-slate-500">{policy.reason}</div>
                    <div className="text-right">
                      <span className={cn("rounded-full border px-2 py-1 text-xs font-bold", decisionStyle(policy.decision))}>{policy.decision}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "simulate" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <section className="rounded-lg border border-slate-200 p-5">
                <div className="mb-5 flex items-center gap-2 font-bold text-slate-900">
                  <Search className="h-4 w-4 text-blue-600" />
                  有效权限模拟
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="权限类型" value={permissionKind} onChange={(value) => setPermissionKind(value as PermissionKind)} options={permissionKinds} />
                  <Select label="角色" value={selectedRole} onChange={setSelectedRole} options={roles} />

                  {permissionKind === "菜单权限" && <Select label="菜单" value={selectedMenu} onChange={setSelectedMenu} options={menus.map((item) => item.name)} />}
                  {permissionKind === "按钮权限" && <Select label="按钮" value={selectedButton} onChange={setSelectedButton} options={buttons.map((item) => item.name)} />}
                  {permissionKind === "接口权限" && <Select label="接口" value={selectedApi} onChange={setSelectedApi} options={apis.map((item) => item.path)} />}

                  {(permissionKind === "数据/资源权限" || permissionKind === "Agent权限") && (
                    <>
                      <Select label="Agent" value={selectedAgent} onChange={setSelectedAgent} options={agents.map((agent) => agent.name)} />
                      <Select label="资源" value={selectedResource} onChange={setSelectedResource} options={resources.map((resource) => resource.name)} />
                      <Select label="动作" value={selectedAction} onChange={setSelectedAction} options={resourceActions} />
                    </>
                  )}
                </div>

                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">请求</div>
                  <div className="mt-2 text-sm text-slate-700">
                    {selectedRole} 请求 {simulation.actions[0]}：{simulation.resource}
                    {(permissionKind === "数据/资源权限" || permissionKind === "Agent权限") && ` / ${selectedAgent}`}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">判定结果</div>
                  <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", decisionStyle(simulation.decision))}>{simulation.decision}</span>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label="策略ID" value={simulation.id} />
                  <InfoRow label="主体" value={simulation.subject} />
                  <InfoRow label="对象" value={simulation.resource} />
                  <InfoRow label="原因" value={simulation.reason} />
                </div>
                <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  <AlertTriangle className="mb-2 h-4 w-4" />
                  权限判定必须同时在前端入口、后端接口和 Agent 执行沙箱生效。
                </div>
              </section>
            </div>
          )}

          {section === "audit" && (
            <section className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-100 px-5 py-4 font-bold text-slate-900">审计日志</div>
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={`${log.time}-${log.action}`} className="grid grid-cols-[100px_140px_1fr_130px] gap-4 px-5 py-4 text-sm">
                    <div className="font-mono text-slate-500">{log.time}</div>
                    <div className="font-bold text-slate-900">{log.user}</div>
                    <div className="text-slate-600">{log.action} / {log.target}</div>
                    <div className="text-right">
                      <span className={cn("rounded-full border px-2 py-1 text-xs font-bold", decisionStyle(log.result))}>{log.result}</span>
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

function PermissionTable({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<{ id: string; main: string; sub: string; meta: string; roles: string[]; risk?: string }>;
}) {
  return (
    <section className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="font-bold text-slate-900">{title}</div>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_120px_280px] gap-4 px-5 py-4 text-sm">
            <div>
              <div className="font-bold text-slate-900">{row.main}</div>
              <div className="mt-1 text-xs text-slate-500">{row.sub}</div>
            </div>
            <div>
              <span className={cn("rounded-full px-2 py-1 text-xs font-bold", row.risk ? riskStyle(row.risk) : "bg-emerald-50 text-emerald-700")}>{row.meta}</span>
            </div>
            <div className="text-slate-600">{row.roles.join("、")}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-blue-500">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[220px] text-right font-bold text-slate-900">{value}</span>
    </div>
  );
}

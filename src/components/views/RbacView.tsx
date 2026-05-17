import React, { useState } from "react";
import { 
  Users, ShieldCheck, KeyRound, Bot, FolderLock, Plus, 
  ChevronRight, ArrowRight, Lock, Activity, ShieldAlert,
  Search, Shield, Database, Webhook, FileText, UserPlus, Fingerprint, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

// Mock Relational Data
const DB = {
  users: [
    { id: "U01", name: "张三", email: "zhangsan@fotile.com", dept: "数据分析部", roleIds: ["R02"], status: "活跃" },
    { id: "U02", name: "李四", email: "lisi@fotile.com", dept: "IT 部", roleIds: ["R01"], status: "活跃" },
    { id: "U03", name: "沈总", email: "shenzong@fotile.com", dept: "管理层", roleIds: ["R01", "R03"], status: "活跃" },
    { id: "U04", name: "王五", email: "wangwu@fotile.com", dept: "合规法务组", roleIds: ["R04"], status: "停用" },
  ],
  roles: [
    { id: "R01", name: "超级管理员", type: "System", desc: "拥有系统所有模块的完全控制权限" },
    { id: "R02", name: "分析师", type: "Custom", desc: "可查看分析数据，监控归因结果及驳回" },
    { id: "R03", name: "业务总监", type: "Custom", desc: "全局只读，核心业务审批" },
    { id: "R04", name: "法务审核员", type: "System", desc: "合规审查与敏感数据脱敏查看" },
  ],
  agents: [
    { id: "A01", name: "数据质检智能归因 Agent", status: "运行中", type: "分析" },
    { id: "A02", name: "业务执行拦截与修复 Agent", status: "空闲", type: "行动" },
  ],
  resources: [
    { id: "RES01", name: "核心业务 DDL / SAP 数据库", type: "Database" },
    { id: "RES02", name: "资金变动 OpenAPI", type: "API" },
    { id: "RES03", name: "质检与对账宽表", type: "Data Warehouse" },
  ],
  // Mappings
  role_to_agent: [
    { roleId: "R01", agentId: "A01", access: "MANAGE" },
    { roleId: "R01", agentId: "A02", access: "MANAGE" },
    { roleId: "R02", agentId: "A01", access: "INVOKE" },
    { roleId: "R03", agentId: "A01", access: "VIEW_LOGS" },
    { roleId: "R03", agentId: "A02", access: "APPROVE_ACTIONS" },
  ],
  role_to_resource: [
    { roleId: "R01", resourceId: "RES01", access: "FULL_ACCESS" },
    { roleId: "R01", resourceId: "RES02", access: "FULL_ACCESS" },
    { roleId: "R01", resourceId: "RES03", access: "FULL_ACCESS" },
    { roleId: "R02", resourceId: "RES03", access: "READ_ONLY" },
    { roleId: "R04", resourceId: "RES03", access: "MASKED_READ" },
  ],
  agent_to_resource: [
    { agentId: "A01", resourceId: "RES01", access: "SQL_SELECT_ONLY", requireAudit: false },
    { agentId: "A01", resourceId: "RES03", access: "WRITE_APPEND", requireAudit: false },
    { agentId: "A02", resourceId: "RES02", access: "API_WRITE_BLOCKED", requireAudit: true },
  ]
};

export function RbacView() {
  const [activeEntity, setActiveEntity] = useState<"users" | "roles" | "agents">("users");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive selection context
  const selectedUser = activeEntity === 'users' ? DB.users.find(u => u.id === selectedId) : null;
  const selectedRole = activeEntity === 'roles' ? DB.roles.find(r => r.id === selectedId) : null;
  const selectedAgent = activeEntity === 'agents' ? DB.agents.find(a => a.id === selectedId) : null;

  // Render Topology based on entity
  const renderTopology = () => {
    if (activeEntity === 'users' && selectedUser) {
      const userRoles = DB.roles.filter(r => selectedUser.roleIds.includes(r.id));
      const accessibleAgents = DB.role_to_agent.filter(rta => selectedUser.roleIds.includes(rta.roleId)).map(rta => ({ ...rta, agent: DB.agents.find(a => a.id === rta.agentId)}));
      const accessibleResources = DB.role_to_resource.filter(rtr => selectedUser.roleIds.includes(rtr.roleId)).map(rtr => ({ ...rtr, res: DB.resources.find(r => r.id === rtr.resourceId)}));

      return (
        <div className="space-y-6">
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md z-10 relative">
                 <Fingerprint className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-800 mt-2">{selectedUser.name}</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedUser.email}</p>
           </div>
           
           <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 z-0" />
              
              <div className="relative z-10 bg-white border border-slate-200 rounded-xl p-4 shadow-sm my-4">
                 <div className="flex items-center gap-2 mb-3">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span className="font-bold text-xs text-slate-700">继承角色 (Roles)</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {userRoles.map(r => (
                     <div key={r.id} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                       {r.name}
                     </div>
                   ))}
                 </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                 <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 text-[10px] font-bold text-slate-400 px-2 rounded-full border border-slate-200">授权智能体</div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-xs text-slate-700">可访问 Agent</span>
                    </div>
                    <div className="space-y-2">
                      {accessibleAgents.map((a, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                           <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{a.agent?.name}</div>
                           <div className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block">{a.access}</div>
                        </div>
                      ))}
                      {accessibleAgents.length === 0 && <span className="text-xs text-slate-400">无权限</span>}
                    </div>
                 </div>
                 <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 text-[10px] font-bold text-slate-400 px-2 rounded-full border border-slate-200">授权底层资源</div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Database className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-xs text-slate-700">系统与数据</span>
                    </div>
                    <div className="space-y-2">
                      {accessibleResources.map((r, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                           <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{r.res?.name}</div>
                           <div className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded inline-block">{r.access}</div>
                        </div>
                      ))}
                      {accessibleResources.length === 0 && <span className="text-xs text-slate-400">无权限</span>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (activeEntity === 'agents' && selectedAgent) {
       const permittedRoles = DB.role_to_agent.filter(rta => rta.agentId === selectedAgent.id).map(rta => ({...rta, role: DB.roles.find(r => r.id === rta.roleId)}));
       const accessedResources = DB.agent_to_resource.filter(atr => atr.agentId === selectedAgent.id).map(atr => ({...atr, res: DB.resources.find(r => r.id === atr.resourceId)}));

       return (
         <div className="space-y-6">
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-md z-10 relative">
                  <Bot className="w-8 h-8 text-indigo-600" />
               </div>
               <h4 className="font-bold text-slate-800 mt-2 text-center leading-tight max-w-[200px]">{selectedAgent.name}</h4>
               <p className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full mt-1.5">{selectedAgent.status}</p>
            </div>
            
            <div className="relative">
               <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 z-0" />
               
               <div className="relative z-10 bg-white border border-slate-200 rounded-xl p-4 shadow-sm my-4">
                  <div className="flex flex-col items-center text-center">
                      <div className="text-xs text-slate-500 font-bold mb-3">谁可以使用此智能体？ (Inbound)</div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {permittedRoles.map((r, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex flex-col items-center gap-1 min-w-[100px]">
                             <ShieldCheck className="w-3.5 h-3.5 text-slate-400"/>
                             <span className="text-[10px] font-bold text-slate-700">{r.role?.name}</span>
                             <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">{r.access}</span>
                          </div>
                        ))}
                      </div>
                  </div>
               </div>

               <div className="relative z-10 bg-rose-50 border border-rose-100 rounded-xl p-4 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4 text-rose-500" />
                       <span className="font-bold text-xs text-rose-900">智能体沙箱管控边界 (Outbound)</span>
                     </div>
                     <span className="text-[10px] text-rose-500 bg-white/50 px-2 py-0.5 rounded border border-rose-200">零信任网络</span>
                  </div>
                  <div className="space-y-2">
                    {accessedResources.map((ar, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-rose-100 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            {ar.res?.type === 'API' ? <Webhook className="w-4 h-4 text-slate-400" /> : <Database className="w-4 h-4 text-slate-400" />}
                            <div>
                               <div className="text-xs font-bold text-slate-800">{ar.res?.name}</div>
                               <div className="text-[10px] font-mono text-slate-400 mt-0.5">Asset ID: {ar.res?.id}</div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded font-bold border", 
                              ar.access.includes('BLOCKED') ? "bg-rose-50 text-rose-600 border-rose-200" :
                              ar.access.includes('WRITE') ? "bg-amber-50 text-amber-600 border-amber-200" :
                              "bg-emerald-50 text-emerald-600 border-emerald-200"
                            )}>
                               {ar.access}
                            </span>
                            {ar.requireAudit && <span className="text-[10px] text-amber-600 flex items-center gap-1"><Lock className="w-3 h-3"/> 触发人工审核</span>}
                         </div>
                      </div>
                    ))}
                    {accessedResources.length === 0 && <span className="text-xs text-slate-400">无出站访问权限</span>}
                  </div>
               </div>
            </div>
         </div>
       );
    }
    
    if (activeEntity === 'roles' && selectedRole) {
      const RoleUsers = DB.users.filter(u => u.roleIds.includes(selectedRole.id));
      const accessibleAgents = DB.role_to_agent.filter(rta => rta.roleId === selectedRole.id).map(rta => ({ ...rta, agent: DB.agents.find(a => a.id === rta.agentId)}));
      const accessibleResources = DB.role_to_resource.filter(rtr => rtr.roleId === selectedRole.id).map(rtr => ({ ...rtr, res: DB.resources.find(r => r.id === rtr.resourceId)}));

      return (
        <div className="space-y-6">
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-md z-10 relative">
                 <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-800 mt-2 text-center">{selectedRole.name}</h4>
              <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5">{selectedRole.type} Role</p>
           </div>
           
           <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 z-0" />
              
              <div className="relative z-10 bg-white border border-slate-200 rounded-xl p-4 shadow-sm my-4">
                 <div className="flex items-center gap-2 mb-3">
                   <Users className="w-4 h-4 text-blue-500" />
                   <span className="font-bold text-xs text-slate-700">受委托账户 ({RoleUsers.length})</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {RoleUsers.map(u => (
                     <div key={u.id} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                       <span className="text-xs font-bold shadow-sm">{u.name}</span>
                       <span className="text-[10px] opacity-60 font-mono">{u.dept}</span>
                     </div>
                   ))}
                   {RoleUsers.length === 0 && <span className="text-xs text-slate-400">无关联账户</span>}
                 </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
                 <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 text-[10px] font-bold text-slate-400 px-2 rounded-full border border-slate-200">授权智能体</div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold text-xs text-slate-700">可访问侧限</span>
                    </div>
                    <div className="space-y-2">
                      {accessibleAgents.map((a, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col gap-1">
                           <div className="text-xs font-bold text-slate-800 line-clamp-1">{a.agent?.name}</div>
                           <div className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded max-w-max border border-indigo-100">{a.access}</div>
                        </div>
                      ))}
                      {accessibleAgents.length === 0 && <span className="text-xs text-slate-400">未授予权限</span>}
                    </div>
                 </div>
                 <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 text-[10px] font-bold text-slate-400 px-2 rounded-full border border-slate-200">授权底层块</div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Database className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-xs text-slate-700">直连数据</span>
                    </div>
                    <div className="space-y-2">
                      {accessibleResources.map((r, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col gap-1">
                           <div className="text-xs font-bold text-slate-800 line-clamp-1">{r.res?.name}</div>
                           <div className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded max-w-max border border-amber-100">{r.access}</div>
                        </div>
                      ))}
                      {accessibleResources.length === 0 && <span className="text-xs text-slate-400">未授予直接访问</span>}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    
    // Default / Role selection handling could be similar, simplified for brevity
    return (
       <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Layers className="w-12 h-12 mb-4 text-slate-200" />
          <p className="text-sm font-bold">选择左侧表格中的数据实体</p>
          <p className="text-xs mt-1">查看实时计算的依赖拓扑图与权限沙箱规则</p>
       </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] z-10 relative">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-base tracking-tight">统一身份与资产边界 (Unified RBAC & Sandbox)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 ml-7">
            不再孤立管理。点击各类实体查看完整的数据链路与智能体访问控制安全水位。
          </p>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
         {/* Left Panel: Entity Tables */}
         <div className="w-full flex flex-col bg-slate-50/50">
            {/* Entity Selectors */}
            <div className="flex border-b border-slate-100 p-6 gap-4 bg-slate-50/50">
               <button 
                  onClick={() => {setActiveEntity('users'); setSelectedId(null)}}
                  className={cn("flex-1 p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left shadow-sm group", 
                     activeEntity === 'users' ? "border-blue-300 bg-white shadow-blue-100/50 ring-2 ring-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
               >
                  <div className="flex items-center justify-between w-full mb-1">
                     <Users className={cn("w-5 h-5", activeEntity === 'users' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                     <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", activeEntity === 'users' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>4 账户</span>
                  </div>
                  <span className={cn("font-bold text-sm tracking-tight", activeEntity === 'users' ? "text-slate-900" : "text-slate-700")}>人与组织配置</span>
               </button>
               
               <button 
                  onClick={() => {setActiveEntity('roles'); setSelectedId(null)}}
                  className={cn("flex-1 p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left shadow-sm group", 
                     activeEntity === 'roles' ? "border-emerald-300 bg-white shadow-emerald-100/50 ring-2 ring-emerald-500/10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
               >
                  <div className="flex items-center justify-between w-full mb-1">
                     <ShieldCheck className={cn("w-5 h-5", activeEntity === 'roles' ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                     <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", activeEntity === 'roles' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>4 策略</span>
                  </div>
                  <span className={cn("font-bold text-sm tracking-tight", activeEntity === 'roles' ? "text-slate-900" : "text-slate-700")}>角色与网关网格</span>
               </button>

               <button 
                  onClick={() => {setActiveEntity('agents'); setSelectedId(null)}}
                  className={cn("flex-1 p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left shadow-sm group", 
                     activeEntity === 'agents' ? "border-indigo-300 bg-white shadow-indigo-100/50 ring-2 ring-indigo-500/10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
               >
                  <div className="flex items-center justify-between w-full mb-1">
                     <Bot className={cn("w-5 h-5", activeEntity === 'agents' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                     <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", activeEntity === 'agents' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>2 引擎</span>
                  </div>
                  <span className={cn("font-bold text-sm tracking-tight", activeEntity === 'agents' ? "text-slate-900" : "text-slate-700")}>智能体控制面</span>
               </button>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-auto p-6 w-full max-w-7xl mx-auto">
               {/* Search Bar */}
               <div className="relative mb-8 max-w-2xl mx-auto">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder={`搜索相关的${activeEntity === 'users' ? '用户' : activeEntity === 'roles' ? '策略' : 'Agent 名称'}...`} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm transition-all" />
               </div>

               {activeEntity === 'users' && (
                  <div className="grid grid-cols-2 gap-4">
                     {DB.users.map(u => (
                        <div 
                           key={u.id} 
                           onClick={() => setSelectedId(u.id)}
                           className={cn("flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all", 
                              selectedId === u.id ? "bg-white border-blue-400 shadow-md ring-1 ring-blue-400/50" : "bg-white border-slate-200 hover:border-blue-300 shadow-sm"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {u.name[0]}
                              </div>
                              <div>
                                 <div className="font-bold text-sm text-slate-800">{u.name}</div>
                                 <div className="text-[10px] text-slate-500">{u.dept} · {u.email}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", u.status === '活跃' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{u.status}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeEntity === 'agents' && (
                  <div className="grid grid-cols-2 gap-4">
                     {DB.agents.map(a => (
                        <div 
                           key={a.id} 
                           onClick={() => setSelectedId(a.id)}
                           className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", 
                              selectedId === a.id ? "bg-white border-indigo-400 shadow-md ring-1 ring-indigo-400/50" : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", selectedId === a.id ? "bg-indigo-100" : "bg-slate-100")}>
                                <Bot className={cn("w-5 h-5", selectedId === a.id ? "text-indigo-600" : "text-slate-500")} />
                              </div>
                              <div>
                                 <div className="font-bold text-sm text-slate-800">{a.name}</div>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 rounded border border-slate-200">ID: {a.id}</span>
                                    <span className="text-[10px] text-slate-500 font-bold">{a.type}类智能体</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                           </div>
                        </div>
                     ))}
                  </div>
               )}
               
               {activeEntity === 'roles' && (
                  <div className="grid grid-cols-2 gap-4">
                     {DB.roles.map(r => (
                        <div 
                           key={r.id} 
                           onClick={() => setSelectedId(r.id)}
                           className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", 
                              selectedId === r.id ? "bg-white border-emerald-400 shadow-md ring-1 ring-emerald-400/50" : "bg-white border-slate-200 hover:border-emerald-300 shadow-sm"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", selectedId === r.id ? "bg-emerald-100" : "bg-slate-100")}>
                                <ShieldCheck className={cn("w-5 h-5", selectedId === r.id ? "text-emerald-600" : "text-slate-500")} />
                              </div>
                              <div>
                                 <div className="font-bold text-sm text-slate-800">{r.name}</div>
                                 <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{r.desc}</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            
            {/* Context Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs">
                <span className="text-slate-500">点击列表中的实体以查看详细配置与拓扑</span>
                <button className="flex items-center gap-1.5 text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> 
                  新增{activeEntity === 'users' ? '人员' : activeEntity === 'roles' ? '策略' : '沙箱配置'}
                </button>
            </div>
         </div>
         
         {/* Details Modal overlay */}
         <AnimatePresence>
            {selectedId && (
               <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-6">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
                     {/* Modal Header */}
                     <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <Activity className="w-4 h-4 text-blue-500" />
                           <h3 className="font-bold text-slate-800 text-lg">Topology Trace</h3>
                        </div>
                        <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none bg-white border border-slate-200 p-1 rounded hover:bg-slate-50 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                     </div>
                     {/* Modal Body */}
                     <div className="flex-1 overflow-y-auto p-8 relative">
                         {renderTopology()}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}

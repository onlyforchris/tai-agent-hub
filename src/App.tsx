import React, { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  BookOpen,
  Brain,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  HardDrive,
  LayoutDashboard,
  Lock,
  Network,
  Server,
  Waypoints,
  Wrench,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { SidebarFooter } from "./components/SidebarFooter";
import type { AppViewMode } from "./components/RoleSwitcher";
import { readAppUrlParams, syncAppUrlParams } from "@/src/lib/urlParams";
import { DashboardView } from "./components/views/DashboardView";
import { ModelsView } from "./components/views/ModelsView";
import { SkillsView } from "./components/views/SkillsView";
import { DataView } from "./components/views/DataView";
import { NotificationsView } from "./components/views/NotificationsView";
import { RbacView } from "./components/views/RbacView";
import { AgentsView } from "./components/views/AgentsView";
import { TaskWorkbench } from "./components/views/TaskWorkbench";
import { RunsView } from "./components/views/RunsView";
import { ToolsView } from "./components/views/ToolsView";
import { InterfaceMonitorView } from "./components/views/InterfaceMonitorView";
import { KnowledgeBaseView } from "./components/views/KnowledgeBaseView";
import { WorkflowsView } from "./components/views/WorkflowsView";

type Tab =
  | "dashboard"
  | "agents"
  | "workflows"
  | "models"
  | "skills"
  | "knowledge"
  | "tools"
  | "data"
  | "interfaceMonitor"
  | "tasks"
  | "runs"
  | "notifications"
  | "rbac";

const headerTitles: Record<Tab, string> = {
  dashboard: "运营大盘",
  agents: "Agent 编排与配置",
  workflows: "Workflow 管理",
  models: "模型配置与监控",
  skills: "领域技能库管理",
  knowledge: "知识库管理",
  tools: "Tool 注册中心",
  data: "数据集成与分发",
  interfaceMonitor: "接口日志监控",
  tasks: "数据质检 Agent 工作台",
  runs: "Agent 执行追踪 (Trace)",
  notifications: "统一消息调度",
  rbac: "系统权限与操作审计",
};

const coreNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "运营大盘" },
  { id: "agents", icon: Bot, label: "Agent 配置" },
  { id: "workflows", icon: Network, label: "Workflow 管理" },
  { id: "models", icon: Cpu, label: "模型管理" },
  { id: "skills", icon: Brain, label: "技能管理" },
  { id: "knowledge", icon: BookOpen, label: "知识库管理" },
  { id: "tools", icon: Wrench, label: "Tool 注册中心" },
  { id: "data", icon: HardDrive, label: "数据管理" },
  { id: "interfaceMonitor", icon: Server, label: "接口监控" },
  { id: "notifications", icon: Bell, label: "消息通知" },
  { id: "rbac", icon: Lock, label: "权限与安全" },
];

const businessNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "tasks", icon: ClipboardCheck, label: "数据质检 Agent 工作台" },
];

const adminBusinessNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "tasks", icon: ClipboardCheck, label: "数据质检 Agent" },
  { id: "runs", icon: Waypoints, label: "Agent 执行追踪" },
];

const VIEW_MODE_KEY = "tai-agent-view-mode";

export default function App() {
  const urlParams = readAppUrlParams();
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (urlParams.view) return urlParams.view;
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === "admin" ? "admin" : "business";
  });
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    syncAppUrlParams({ view: viewMode });
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "business") {
      setActiveTab("tasks");
    }
  }, [viewMode]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: Tab }>).detail;
      if (detail?.tab) setActiveTab(detail.tab);
    };
    window.addEventListener("agent-hub-tab-switch", handler);
    return () => window.removeEventListener("agent-hub-tab-switch", handler);
  }, []);

  const switchViewMode = (mode: AppViewMode) => {
    setViewMode(mode);
    syncAppUrlParams({ view: mode });
    if (mode === "admin") {
      setActiveTab("dashboard");
    }
  };

  const isBusinessView = viewMode === "business";

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <aside
        className={cn(
          "z-10 flex flex-col bg-slate-900 pt-6 shadow-2xl transition-all duration-200",
          isBusinessView ? "w-56" : "w-64",
        )}
      >
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/50">
            A
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight text-white">Agent 智能中台</h1>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {isBusinessView ? "业务工作台" : "企业级基座"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {isBusinessView ? (
            <>
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">
                财务对账
              </div>
              {businessNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "rounded-l-none border-l-2 border-blue-500 bg-blue-900/20 text-blue-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">
                核心管控
              </div>
              {coreNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-slate-200",
                    activeTab === item.id && "bg-slate-800/50 text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400",
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "interfaceMonitor" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-rose-950/30">
                      <Bell className="h-3 w-3" />
                      2
                    </span>
                  )}
                </button>
              ))}

              <div className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">
                业务支撑
              </div>
              {adminBusinessNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "rounded-l-none border-l-2 border-blue-500 bg-blue-900/20 text-blue-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400",
                    )}
                  />
                  {item.label}
                </button>
              ))}
            </>
          )}
        </nav>

        <SidebarFooter viewMode={viewMode} onSwitchRole={switchViewMode} />
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="z-0 flex h-16 items-center border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {isBusinessView ? "业财对账" : "Agent 中台核心"}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-semibold text-slate-700">{headerTitles[activeTab]}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && <DashboardView key="dashboard" />}
            {activeTab === "agents" && <AgentsView key="agents" />}
            {activeTab === "workflows" && <WorkflowsView key="workflows" />}
            {activeTab === "models" && <ModelsView key="models" />}
            {activeTab === "skills" && <SkillsView key="skills" />}
            {activeTab === "knowledge" && <KnowledgeBaseView key="knowledge" />}
            {activeTab === "tools" && <ToolsView key="tools" />}
            {activeTab === "data" && <DataView key="data" />}
            {activeTab === "interfaceMonitor" && <InterfaceMonitorView key="interfaceMonitor" />}
            {activeTab === "notifications" && <NotificationsView key="notifications" />}
            {activeTab === "rbac" && <RbacView key="rbac" />}
            {activeTab === "tasks" && (
              <TaskWorkbench
                initialTab={urlParams.workbenchTab ?? undefined}
                initialBillNo={urlParams.billNo}
              />
            )}
            {activeTab === "runs" && <RunsView key="runs" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

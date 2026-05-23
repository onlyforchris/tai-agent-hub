import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Bot,
  BookOpen,
  Brain,
  ChevronRight,
  Cpu,
  HardDrive,
  LayoutDashboard,
  ListChecks,
  Lock,
  Network,
  Server,
  TrendingUp,
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
import { WorkbenchView } from "./components/views/WorkbenchView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { RunsView } from "./components/views/RunsView";
import { ToolsView } from "./components/views/ToolsView";
import { InterfaceMonitorView } from "./components/views/InterfaceMonitorView";
import { KnowledgeBaseView } from "./components/views/KnowledgeBaseView";
import { WorkflowsView } from "./components/views/WorkflowsView";
import type { WorkbenchTab } from "./components/views/workbench/constants";

// 侧栏 Tab 分三层：后台管理 | 通用平台 | Agent 场景
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
  | "workbench"       // 通用平台 → 工作台
  | "analytics"       // 通用平台 → 运营分析
  | "sceneAttribution" // 对账治理Agent → 对账差异清单
  | "sceneCases"      // 对账治理Agent → 案例库
  | "runs"
  | "notifications"
  | "rbac";

type SceneTab = "sceneAttribution" | "sceneCases";

const headerTitles: Record<Tab, string> = {
  dashboard: "运营大盘",
  agents: "Agent 编排与配置",
  workflows: "Workflow 管理",
  models: "模型配置与监控",
  skills: "领域技能库管理",
  knowledge: "知识库管理",
  tools: "Tool 注册中心",
  data: "数据源与字段映射",
  interfaceMonitor: "接口日志监控",
  workbench: "工作台",
  analytics: "运营分析",
  sceneAttribution: "对账差异清单",
  sceneCases: "案例库",
  runs: "Agent 执行追踪",
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
  { id: "data", icon: HardDrive, label: "数据源配置" },
  { id: "interfaceMonitor", icon: Server, label: "接口监控" },
  { id: "notifications", icon: Bell, label: "通知配置" },
  { id: "rbac", icon: Lock, label: "权限与安全" },
];

// 通用平台导航（所有非 admin 角色共享）
const platformNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "workbench", icon: LayoutDashboard, label: "工作台" },
  { id: "analytics", icon: TrendingUp, label: "运营分析" },
];

// 对账治理Agent 场景导航
const dataQualityNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "sceneAttribution", icon: ListChecks, label: "对账差异清单" },
  { id: "sceneCases", icon: BookOpen, label: "案例库" },
];

// 业务角色（SAP/DMS）的对账治理场景导航（精简版）
const dataQualityBusinessNav: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: "sceneAttribution", icon: ListChecks, label: "对账差异清单" },
  { id: "sceneCases", icon: BookOpen, label: "案例库" },
];

const VIEW_MODE_KEY = "tai-agent-view-mode";

function defaultTabForMode(mode: AppViewMode): Tab {
  if (mode === "admin") return "dashboard";
  return "workbench"; // finance/sap/dms 默认进入工作台
}

function roleLabel(mode: AppViewMode) {
  if (mode === "admin") return "管理员后台";
  if (mode === "finance") return "财务前台";
  return `${mode.toUpperCase()} 业务处理`;
}

// Tab 类型判断：通用平台 vs Agent 场景
function isPlatformTab(tab: Tab) { return tab === "workbench" || tab === "analytics"; }
function isSceneTab(tab: Tab): tab is SceneTab { return tab === "sceneAttribution" || tab === "sceneCases"; }

// Agent 场景 Tab → TaskWorkbench 内部子视图映射
const sceneTabToView: Record<SceneTab, WorkbenchTab> = {
  sceneAttribution: "todo",
  sceneCases: "cases",
};

export default function App() {
  const urlParams = readAppUrlParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => defaultTabForMode(urlParams.view ?? "finance"));
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (urlParams.view) return urlParams.view;
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === "admin" || saved === "sap" || saved === "dms" || saved === "finance" ? saved : "finance";
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    syncAppUrlParams({ view: viewMode });
  }, [viewMode]);

  useEffect(() => {
    setActiveTab(defaultTabForMode(viewMode));
  }, [viewMode]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tab: Tab; billNo?: string | null }>).detail;
      if (detail?.tab) {
        syncAppUrlParams({ billNo: detail.billNo ?? null, workbenchTab: null });
        setActiveTab(detail.tab);
      }
    };
    window.addEventListener("agent-hub-tab-switch", handler);
    return () => window.removeEventListener("agent-hub-tab-switch", handler);
  }, []);

  const navigateTab = (tab: Tab) => {
    syncAppUrlParams({ billNo: null, workbenchTab: null });
    setActiveTab(tab);
  };

  const switchViewMode = (mode: AppViewMode) => {
    setViewMode(mode);
    syncAppUrlParams({ view: mode });
    setActiveTab(defaultTabForMode(mode));
  };

  const navGroups = useMemo(() => {
    if (viewMode === "admin") {
      return [
        { title: "后台配置", items: coreNav },
        { title: "通用平台", items: platformNav },
        { title: "业务支撑", items: [{ id: "runs" as Tab, icon: Waypoints, label: "Agent 执行追踪" }] },
      ];
    }
    if (viewMode === "finance") {
      return [
        { title: "通用平台", items: platformNav },
        { title: "对账治理Agent", items: dataQualityNav },
      ];
    }
    // sap / dms
    return [
      { title: "通用平台", items: [{ id: "workbench" as Tab, icon: LayoutDashboard, label: "工作台" }] },
      { title: "对账治理Agent", items: dataQualityBusinessNav },
    ];
  }, [viewMode]);

  const sceneInitialView = isSceneTab(activeTab) ? sceneTabToView[activeTab] : undefined;

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <aside className="z-10 flex min-h-0 w-64 flex-col bg-slate-900 pt-6 shadow-2xl">
        <div className="mb-8 flex min-w-0 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/50">
            A
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight text-white">Agent 智能中台</h1>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {roleLabel(viewMode)}
            </p>
          </div>
        </div>

        <nav className="scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-60">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTab(item.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      activeTab === item.id
                        ? "rounded-l-none border-l-2 border-blue-500 bg-blue-900/20 text-blue-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                    {item.id === "interfaceMonitor" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm shadow-rose-950/30">
                        <Bell className="h-3 w-3" />
                        2
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <SidebarFooter viewMode={viewMode} onSwitchRole={switchViewMode} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-0 flex h-16 min-w-0 items-center border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm text-slate-400">{roleLabel(viewMode)}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="truncate font-semibold text-slate-700">{headerTitles[activeTab]}</span>
          </div>
        </header>

        <div className="scrollbar-hide min-w-0 flex-1 overflow-auto bg-slate-50/50">
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
            {activeTab === "runs" && <RunsView key="runs" />}
            {activeTab === "workbench" && <div key="workbench" className="h-full"><WorkbenchView roleMode={viewMode} /></div>}
            {activeTab === "analytics" && <div key="analytics" className="h-full"><AnalyticsView roleMode={viewMode} /></div>}
            {isSceneTab(activeTab) && sceneInitialView && (
              <div key={activeTab} className="h-full">
                <TaskWorkbench
                  roleMode={viewMode}
                  initialTab={sceneInitialView}
                  initialBillNo={urlParams.billNo}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

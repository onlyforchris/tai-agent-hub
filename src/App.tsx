import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart3, 
  Brain, 
  ChevronRight, 
  ClipboardCheck, 
  Database, 
  FileText, 
  Home, 
  LayoutDashboard, 
  Lock, 
  MessageSquare, 
  RefreshCcw, 
  Search, 
  Settings, 
  ShieldCheck, 
  Zap,
  Cpu,
  Bell,
  HardDrive,
  Users,
  Key,
  Shield,
  Plus,
  Check,
  Activity,
  ShieldAlert,
  Box,
  TerminalSquare,
  Waypoints,
  FileUp,
  Workflow,
  Webhook,
  FileSpreadsheet,
  Download,
  MessageSquareDot,
  Smartphone,
  Mail,
  Bot,
  Network,
  Braces,
  SlidersHorizontal,
  ToggleLeft,
  KeyRound,
  UsersRound,
  Wrench,
  AlignLeft,
  FolderLock,
  ToggleRight,
  Lightbulb,
  Palette,
  Settings2,
  ArrowRight,
  Server,
  Layers,
  Blocks,
  ArrowDown,
  PlayCircle,
  GitBranch,
  BrainCircuit,
  SearchCode,
  CheckCircle2,
  FileOutput,
  Info,
  AlertTriangle,
  UploadCloud,
  X,
  MessageCircle,
  Send,
  Sparkles,
  Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/src/lib/utils";
import { DashboardView } from "./components/views/DashboardView";
import { ModelsView } from "./components/views/ModelsView";
import { SkillsView } from "./components/views/SkillsView";
import { DataView } from "./components/views/DataView";
import { NotificationsView } from "./components/views/NotificationsView";
import { RbacView } from "./components/views/RbacView";
import { AgentsView } from "./components/views/AgentsView";
import { PlaceholderView } from "./components/ui/PlaceholderView";
import { StatCard } from "./components/ui/StatCard";
import { Step } from "./components/ui/Step";

import { TaskImportProcess } from "./components/views/TaskImportProcess";
import type { ReconciliationDifference, AnalysisResult } from "./types";

// Types
type Tab = "dashboard" | "agents" | "models" | "skills" | "data" | "tasks" | "notifications" | "rbac";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("agents");
  const [differences, setDifferences] = useState<ReconciliationDifference[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<ReconciliationDifference | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Upload/Import workflow state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [appToast, setAppToast] = useState<string | null>(null);

  // Copilot State
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<{role: 'user'|'ass', content: string}[]>([
    { role: 'ass', content: '您好，我是 Agent 中台 Copilot。您可以让我帮您编写提示词、一句话生成/修改工作流，或者直接在沙盒中测试应用逻辑。' }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages]);

  const handleSendCopilotMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!copilotInput.trim()) return;
      
      const newMsgs = [...copilotMessages, { role: 'user' as const, content: copilotInput }];
      setCopilotMessages(newMsgs);
      setCopilotInput("");
      
      setTimeout(() => {
          setCopilotMessages([...newMsgs, { role: 'ass', content: '好的，基于您的指令（一句话修改工作流），正在自动重新配置 Agent... 已将该分支节点的判断方式切换为 LLM 逻辑判断。视图已为您高亮对应节点。' }]);
          // 发出自定义事件更新 AgentsView 的状态
          window.dispatchEvent(new CustomEvent('copilot-action', { detail: { action: 'switch-decision-llm' } }));
      }, 1000);
  };

  const showNotification = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/differences")
      .then((res) => res.json())
      .then((data) => setDifferences(data));
  }, []);

  const handleAnalyze = async (diff: ReconciliationDifference) => {
    setSelectedDiff(diff);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diffId: diff.id, billNo: diff.billNo, type: diff.type }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAnalysisResult({ 
          error: data.error || "分析失败，请稍后重试或检查模型配置", 
          evidence: [],
          report: ""
        });
      } else {
        setAnalysisResult(data);
        setDifferences(prev => prev.map(d => d.id === diff.id ? { ...d, status: 'COMPLETED' } : d));
      }
    } catch (error) {
      console.error(error);
      setAnalysisResult({ 
        error: "网络错误，分析请求未成功抵达服务器。", 
        evidence: [],
        report: ""
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload and processing
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);
          setShowUploadModal(false);
          
          // Generate a mock difference task
          const newDiff: ReconciliationDifference = {
            id: `diff-${Date.now()}`,
            billNo: `IMP-${Math.floor(Math.random() * 10000)}`,
            diffAmount: Math.floor(Math.random() * 50000) + 1000,
            sapAmount: Math.floor(Math.random() * 100000) + 50000,
            module: '导入质检池',
            type: 'MDM_ID_ANOMALY',
            createdAt: new Date().toISOString(),
            status: 'PENDING',
            businessLine: '财务导入',
            sourceSystem: 'USER_IMPORT',
            targetSystem: 'SAP_S4'
          };
          setDifferences(prevArray => [newDiff, ...prevArray]);
          
          // Automatically trigger the analysis directly after import
          setTimeout(() => {
            handleAnalyze(newDiff);
            setActiveTab("tasks"); // Ensure we switch to tasks tab
          }, 600);
          
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 uppercase-none relative overflow-hidden">
      <AnimatePresence>
        {appToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[60] flex items-center gap-2 px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold">{appToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Updated to Dark Theme (Slate 900) */}
      <aside className="w-64 bg-slate-900 flex flex-col pt-6 z-10 shadow-2xl">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
            A
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">Agent 智能中台</h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">企业级基座</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-2 opacity-60">核心管控</div>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "数字化大盘" },
            { id: "agents", icon: Bot, label: "Agent 配置" },
            { id: "models", icon: Cpu, label: "模型管理" },
            { id: "skills", icon: Brain, label: "技能管理" },
            { id: "data", icon: HardDrive, label: "数据管理" },
            { id: "notifications", icon: Bell, label: "消息通知" },
            { id: "rbac", icon: Lock, label: "权限与安全" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                activeTab === item.id && "bg-slate-800/50 text-white"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
              {item.label}
            </button>
          ))}

          <div className="pt-6 text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 mb-2 opacity-60">业务支撑</div>
          {[
            { id: "tasks", icon: ClipboardCheck, label: "数据质检智能归因 Agent" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-blue-900/20 text-blue-400 border-l-2 border-blue-500 rounded-l-none" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              FT
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-white font-semibold truncate leading-tight">管理员</p>
              <p className="text-[10px] text-slate-500 font-medium">全局统筹配置</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Updated with Professional Finish */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Agent 中台核心</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-700">
              {activeTab === "dashboard" && "数字化大盘"}
              {activeTab === "agents" && "Agent 编排与配置"}
              {activeTab === "models" && "模型配置与监控"}
              {activeTab === "skills" && "领域技能库管理"}
              {activeTab === "data" && "数据集成与分发"}
              {activeTab === "notifications" && "统一消息调度"}
              {activeTab === "rbac" && "系统权限与操作审计"}
              {activeTab === "tasks" && "数据质检归因分析"}
            </span>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <AnimatePresence mode="wait">
            {activeTab === "agents" && (
              <AgentsView key="agents" />
            )}
            {activeTab === "tasks" && (
              <>
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-[1700px] mx-auto flex flex-col gap-6 h-full pb-6 px-4"
              >
                {/* Full Width: Difference List */}
                <div className="w-full flex flex-col gap-6 h-full">
                  <div className="grid grid-cols-3 gap-6">
                    <StatCard label="待处理任务" value={differences.filter(d => d.status === 'PENDING').length} color="blue" />
                    <StatCard label="规则准确率" value="99.98%" color="green" />
                    <StatCard label="分析可信度" value="99.1%" color="purple" />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        实时业务差异分析队列
                      </h3>
                      <div className="flex gap-3 items-center">
                        <div className="flex gap-2 text-[10px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">批次 #10492</span>
                          <span className="bg-emerald-100 px-2 py-0.5 rounded text-emerald-700 font-bold uppercase tracking-tighter">自动化修复: 开启</span>
                        </div>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5" /> 导入单据分析
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3">单据编号与来源</th>
                            <th className="px-6 py-3 text-right">差异金额</th>
                            <th className="px-6 py-3 text-center">异常分类</th>
                            <th className="px-6 py-3 text-center">状态</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-slate-50">
                          {differences.map((diff) => (
                            <tr 
                              key={diff.id} 
                              className={cn(
                                "hover:bg-slate-50/80 transition-colors cursor-pointer group border-l-2",
                                selectedDiff?.id === diff.id ? "border-blue-600 bg-blue-50/30" : "border-transparent"
                              )}
                              onClick={() => {
                                setSelectedDiff(diff);
                                setAnalysisResult(null);
                              }}
                            >
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{diff.billNo}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{diff.module} • {diff.type}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <p className="font-mono font-bold text-slate-800 tracking-tighter">¥{diff.diffAmount.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400">SAP 差值比: {((diff.diffAmount/diff.sapAmount)*100).toFixed(0)}%</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                                  diff.type === 'MDM_ID_ANOMALY' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                )}>
                                  {diff.type === 'MDM_ID_ANOMALY' ? "主数据异常" : "校验未通过"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "text-[10px] font-bold px-2.5 py-1 rounded-full",
                                  diff.status === 'PENDING' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                  {diff.status === 'PENDING' ? "待分析处理" : "自动排查通过"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Analysis Modal */}
              <AnimatePresence>
                {selectedDiff && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-6">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-800 text-lg">AI 智能归因分析面板</h3>
                          <span className="bg-blue-100/50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold font-mono">
                            {selectedDiff.billNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          {analysisResult && (
                            <div className="flex items-center gap-2">
                              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">排查结束，结论已出</span>
                            </div>
                          )}
                          <button onClick={() => { setSelectedDiff(null); setAnalysisResult(null); }} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto p-8 bg-slate-50/30">
                        {/* Status Step Indicator */}
                        <div className="flex items-center gap-4 px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <Step text="意图识别与规则匹配" active={true} completed={!!analysisResult || isAnalyzing} />
                          <div className="h-px bg-slate-200 flex-1" />
                          <Step text="执行 Skill 对决排查" active={isAnalyzing || !!analysisResult} completed={!!analysisResult} />
                          <div className="h-px bg-slate-200 flex-1" />
                          <Step text="生成归因与可执行建议" active={isAnalyzing || !!analysisResult} completed={!!analysisResult} />
                        </div>

                        {isAnalyzing ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="relative">
                              <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                              <Brain className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-slate-800">正在调用专家 Skill 执行关联系统排查...</p>
                              <p className="text-sm text-slate-400 mt-1 italic tracking-wide">内网跨应用交叉比对中 (SAP, DMS, 帆软)</p>
                            </div>
                          </div>
                        ) : analysisResult ? (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                          >
                            {analysisResult.error ? (
                              <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                  <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-red-800">模型服务异常</h4>
                                  <p className="text-sm text-red-600 mt-1">{analysisResult.error}</p>
                                </div>
                                <button className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold" onClick={() => setAnalysisResult(null)}>重试排查</button>
                              </div>
                            ) : (
                              <>
                                {/* Evidence Chain */}
                                <section>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Database className="w-3.5 h-3.5" />
                                    结构化排查证据链 (内网引擎计算)
                                  </h4>
                                  <div className="space-y-3">
                                    {analysisResult.evidence?.map((item, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium flex items-start gap-3"
                                      >
                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">{i + 1}</div>
                                        <p className="text-slate-700 leading-relaxed">{item}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                </section>

                                {/* AI Report */}
                                <section className="relative">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-t pt-6 border-slate-100">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    专家级大模型辅助归因报告
                                  </h4>
                                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-slate-100 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                      <Brain className="w-32 h-32 text-white" />
                                    </div>
                                    <div className="relative z-10 prose prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed whitespace-pre-wrap font-medium">
                                      {analysisResult.report}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10">
                                      <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">高置信度结论，数据已严防侧漏</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors">丢弃驳回</button>
                                        <button 
                                          onClick={() => {
                                            showNotification("已通过钉钉、邮件触达链路关联责任人，工单流转闭环完成！");
                                            setAnalysisResult(null);
                                            setSelectedDiff(null);
                                          }}
                                          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/20 transition-transform hover:scale-105 active:scale-95"
                                        >
                                          定案并推工单
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </section>
                              </>
                            )}
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
                            <div className="p-4 bg-white rounded-xl shadow-sm mb-4 border border-slate-100">
                              <Zap className="w-10 h-10 text-blue-600 fill-blue-50" />
                            </div>
                            <h4 className="font-bold text-slate-800">已就绪待分析</h4>
                            <p className="text-xs text-slate-400 mt-2 text-center max-w-[200px] leading-relaxed">
                              系统已自动提取匹配排查所需字段约束。点击按钮委派质检 Agent 跑通完整排查流。
                            </p>
                            <button 
                              onClick={() => handleAnalyze(selectedDiff)}
                              className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all text-sm"
                            >
                              激活 Agent 根因排查
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showUploadModal && (
                  <TaskImportProcess 
                     onClose={() => setShowUploadModal(false)}
                     onComplete={() => {
                         setShowUploadModal(false);
                         showNotification("导入解析完成，差异数据已推入异常池等待分析");
                         
                         const mockDiff: ReconciliationDifference = {
                            id: `diff-${Date.now()}`,
                            billNo: `MLT-${Math.floor(Math.random() * 8000) + 1000}`,
                            diffAmount: 14200,
                            sapAmount: 125000,
                            module: '多模态快照比对',
                            type: 'MDM_ID_ANOMALY',
                            status: 'PENDING',
                            desc: '系统检测到多域协同比对异常，等待关联根因推断'
                         };
                         
                         setDifferences(prev => [mockDiff, ...prev]);
                         
                         setTimeout(() => {
                           handleAnalyze(mockDiff);
                         }, 500);
                     }}
                  />
                )}
              </AnimatePresence>
              </>
            )}

            {activeTab === "models" && (
              <ModelsView />
            )}
            {activeTab === "skills" && (
              <SkillsView />
            )}
            {activeTab === "data" && (
              <DataView />
            )}
            {activeTab === "notifications" && (
              <NotificationsView />
            )}
            {activeTab === "dashboard" && (
              <DashboardView />
            )}
            {activeTab === "rbac" && (
              <RbacView />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Copilot Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCopilot(!showCopilot)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 outline-none hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 ring-4 ring-blue-600/20 transition-all"
      >
        {showCopilot ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        {!showCopilot && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-slate-50"></span>
            </span>
        )}
      </motion.button>

      {/* Copilot Drawer Panel */}
      <AnimatePresence>
        {showCopilot && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                     <Sparkles className="w-4 h-4 text-blue-50" />
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-sm tracking-wide">Agent 中台 Copilot</h3>
                     <p className="text-blue-200 text-[10px] tracking-wider font-bold">一句话生成/修改工作流</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button className="text-blue-200 hover:text-white p-1 transition-colors" title="清除发话" onClick={() => setCopilotMessages([{ role: 'ass', content: '您好，我是 Agent 中台 Copilot。您可以让我帮您编写提示词、一句话生成/修改工作流，或者直接在沙盒中测试业务逻辑。' }])}>
                   <RefreshCcw className="w-4 h-4" />
                 </button>
               </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
               {copilotMessages.map((msg, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                  >
                     <div className={cn("w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm", msg.role === 'user' ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-600 border border-blue-200")}>
                        {msg.role === 'user' ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                     </div>
                     <div className={cn("px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed", msg.role === 'user' ? "bg-slate-800 text-white rounded-tr-none" : "bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none")}>
                        {msg.content}
                     </div>
                  </motion.div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendCopilotMessage} className="p-4 bg-white border-t border-slate-100 shrink-0">
               <div className="relative">
                  <input 
                     type="text" 
                     value={copilotInput}
                     onChange={e => setCopilotInput(e.target.value)}
                     placeholder="输入要求 (如: 将决策节点切换为LLM判断)..." 
                     className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button 
                     type="submit"
                     disabled={!copilotInput.trim()}
                     className="absolute right-2 top-2 bottom-2 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                  >
                     <Send className="w-4 h-4" />
                  </button>
               </div>
               <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {["将决策节点切换为LLM判断", "帮我写对账提示词", "一句话生成异常审批链"].map(tag => (
                     <button 
                        key={tag}
                        type="button"
                        onClick={() => setCopilotInput(tag)}
                        className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full transition-colors shrink-0"
                     >
                        {tag}
                     </button>
                  ))}
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

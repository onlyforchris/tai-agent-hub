import React, { useState, useEffect } from "react";
import { 
  BarChart3, Brain, ChevronRight, ClipboardCheck, Database, FileText, Home, LayoutDashboard, Lock, MessageSquare, RefreshCcw, Search, Settings, ShieldCheck, Zap, Cpu, Bell, HardDrive, Users, Key, Shield, Plus, Check, Activity, ShieldAlert, Box, TerminalSquare, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, MessageSquareDot, Smartphone, Mail, Bot, Network, Braces, SlidersHorizontal, ToggleLeft, KeyRound, UsersRound, Wrench, AlignLeft, FolderLock, ToggleRight, Lightbulb, Palette, Settings2, ArrowRight, Server, Layers, Blocks, ArrowDown, PlayCircle, GitBranch, BrainCircuit, SearchCode, CheckCircle2, FileOutput, Info, AlertTriangle, UploadCloud, X, Eye, Pencil, ShieldBan, MousePointerClick, Code, ZoomIn, ZoomOut, Maximize
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/src/lib/utils";

export function AgentsView() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  if (!selectedAgentId) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50 p-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Agent 中台网关</h2>
            <p className="text-sm text-slate-500 mt-1">管理业务系统中已挂载的所有专门场景化 Agent 生态。</p>
          </div>
          <button 
            onClick={() => setSelectedAgentId('new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 新增场景 Agent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Card 1: Existing Agent */}
           <div 
             className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-56"
             onClick={() => setSelectedAgentId('agent-1')}
           >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <Bot className="w-5 h-5" />
                </div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3"/> 已上架
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2 truncate">数据质检智能归因 Agent</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                负责多系统数据自动汇聚、异常特征提取以及质检校验比对的大型财务模型引擎。
              </p>
              <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                    <Database className="w-3 h-3 text-cyan-500" /> 2 DBs  <Waypoints className="w-3 h-3 ml-2 text-indigo-500" /> 9 Nodes
                 </div>
                 <div className="text-blue-600 text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    进入编排 <ArrowRight className="w-3 h-3" />
                 </div>
              </div>
           </div>
           
           {/* Card 2: Create new placeholder */}
           <div 
             className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col h-56 items-center justify-center text-center"
             onClick={() => setSelectedAgentId('new')}
           >
              <div className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center shrink-0 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors mb-4">
                 <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors mb-1">新建 Agent</h3>
              <p className="text-xs text-slate-500 max-w-[200px]">
                 创建一个全新的垂直领域 Agent 向导执行特定工作流。
              </p>
           </div>
        </div>
      </div>
    );
  }

  return <AgentConfig onBack={() => setSelectedAgentId(null)} isNew={selectedAgentId === 'new'} />;
}

function AgentConfig({ onBack, isNew }: { onBack: () => void, isNew?: boolean }) {
  const [isEditing, setIsEditing] = useState<boolean>(isNew ? true : false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showToast, setShowToast] = useState(false);
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<string | null>(isNew ? null : 'trigger');
  const [viewMode, setViewMode] = useState<'build' | 'observe'>('build');
  const [selectedModel, setSelectedModel] = useState<string>('deepseek');
  const [memoryStrategy, setMemoryStrategy] = useState<string>('window');
  const [decisionLogic, setDecisionLogic] = useState("code");
  const [sandboxPhase, setSandboxPhase] = useState<'upload' | 'running' | 'result'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, type: 'data'|'log'}[]>([]);
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });

  // Handle zooming using keyboard shortcuts
  useEffect(() => {
    if (currentStep !== 6) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '=' || e.key === '+') {
        setZoomLevel((z) => Math.min(2, z + 0.1));
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(0.2, z - 0.1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // State for Context list
  const [runtimeContexts, setRuntimeContexts] = useState<any[]>([
    {
      id: "sys-logs",
      type: "dir",
      name: "系统全局错误日志目录",
      path: "/var/logs/sys/",
      desc: "只读访问模式，用于捕获任务执行周期的底层系统异常。"
    },
    {
      id: "routing-rules",
      type: "file",
      name: "财务汇集及质检路由规则配置",
      path: "routing-rules.yaml",
      desc: "包含各渠道账单的数据映射与异常预判规则字典。"
    }
  ]);

  const handleAddContext = () => {
    const newContext = {
      id: `ctx-${Date.now()}`,
      type: "file",
      name: "新增业务规则库字典",
      path: `biz-rules-${Math.floor(Math.random() * 1000)}.json`,
      desc: "用户新上传的场景细化字典配置。"
    };
    setRuntimeContexts(prev => [...prev, newContext]);
  };

  const handleRemoveContext = (id: string) => {
    setRuntimeContexts(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => {
     const handleCopilotAction = (e: any) => {
         if (e.detail?.action === 'switch-decision-llm') {
             // 自动选中 decision 节点
             setActiveWorkflowNode('decision');
             // 切换逻辑
             setDecisionLogic('llm');
             // 将视图模式调整回配置模式（以防在observe模式下）
             setViewMode('build');
         }
     };
     window.addEventListener('copilot-action', handleCopilotAction);
     return () => window.removeEventListener('copilot-action', handleCopilotAction);
  }, []);

  const steps = [
    { id: 1, title: '基础设定', desc: '身份与基础提示词', icon: Info },
    { id: 2, title: '知识与记忆', desc: '模型底座与记忆体', icon: Cpu },
    { id: 3, title: '能力挂载', desc: '工具集与专属技能', icon: Wrench },
    { id: 4, title: '安全隔离', desc: '权限审计与沙箱拦截', icon: ShieldAlert },
    { id: 5, title: '架构预览', desc: '拓扑与依赖链路检视', icon: Network },
    { id: 6, title: '执行链路', desc: 'Agent 运作工作流', icon: GitBranch },
    { id: 7, title: '沙盒测试', desc: '端到端模拟调试', icon: TerminalSquare },
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const isLastStep = currentStep === steps.length;

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
      {/* Save Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-4 left-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Agent 配置已保存起效</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <button onClick={onBack} className="p-1 hover:bg-slate-200 rounded text-slate-500 mr-1"><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <Bot className="w-4 h-4 text-blue-600" />
            {isNew ? '新建 Agent (配置向导)' : '数据质检智能归因 Agent (配置向导)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 pl-8">按照步骤向导，配置该智能体的逻辑边界、依赖项以及数据交互权限。</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-bold rounded-lg flex items-center gap-2">
               <Pencil className="w-4 h-4" /> 修改配置
            </button>
          )}
          {isEditing && !isNew && (
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm font-bold rounded-lg flex items-center gap-2">
               <X className="w-4 h-4" /> 取消修改
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Stepper */}
        <div className="w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
           {steps.map((st, idx) => {
              const active = currentStep === st.id;
              const completed = currentStep > st.id;
              return (
                 <div key={st.id} className="flex gap-4 relative">
                    {idx < steps.length - 1 && (
                       <div className={cn("absolute left-4 top-10 bottom-[-24px] w-0.5", completed ? "bg-blue-600" : "bg-slate-200")} />
                    )}
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white shadow-sm transition-colors duration-300", active ? "border-blue-600 text-blue-600 ring-4 ring-blue-600/10" : completed ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-400")}>
                        {completed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <st.icon className="w-4 h-4" />}
                    </div>
                    <div className="pt-1 cursor-pointer group" onClick={() => setCurrentStep(st.id)}>
                       <h4 className={cn("font-bold text-sm transition-colors", active ? "text-blue-700" : completed ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700")}>{st.title}</h4>
                       <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                 </div>
              )
           })}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col bg-slate-50/30">
          <div className="flex-1 overflow-y-auto w-full relative">
          <fieldset disabled={!isEditing} className={cn("h-full w-full flex flex-col border-none p-0 m-0", !isEditing && "opacity-90 [&_.group-hover\\:opacity-100]:!opacity-0 [&_input]:!text-slate-500 [&_textarea]:!text-slate-500 [&_select]:!text-slate-500")}>
          {currentStep === 1 && (
             <div className="w-full max-w-2xl mx-auto py-10 px-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-blue-600" /> 基础设定</h4>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-1.5">Agent 名称</label>
                         <input type="text" defaultValue={isNew ? "" : "数据质检智能归因 Agent"} placeholder="请输入 Agent 名称" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-1.5">核心定位描述 (Identity)</label>
                         <textarea rows={3} defaultValue={isNew ? "" : "负责多系统数据自动汇聚、异常特征提取以及质检校验比对的大型财务模型引擎。"} placeholder="描述 Agent 的定位与主要职能" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 resize-none"></textarea>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-1.5">System Prompt (系统级提示词)</label>
                         <textarea rows={6} defaultValue={isNew ? "" : `你是一个精通内审与数据核对的资深业务专家。\n请严格遵守以下规则：\n1. 只处理数据类相关异常，不能处理人力或人事数据。\n2. 处理步骤中必须说明异常推断的数据源锚点。\n3. 不要提供猜测性的结论，必须基于数值给出推演步骤。`} placeholder="编写基础提示词..." className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 bg-slate-50/50 resize-none font-medium text-blue-900"></textarea>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {currentStep === 2 && (
             <div className="w-full max-w-2xl mx-auto py-10 px-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-600" /> 模型与上下文记忆</h4>
                   <div className="space-y-6">
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-2">底层大模型 (Foundation Model)</label>
                         <div className="grid grid-cols-2 gap-3">
                             <div 
                                onClick={() => setSelectedModel('deepseek')}
                                className={cn("border-2 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm", selectedModel === 'deepseek' ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-white hover:border-blue-300")}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", selectedModel === 'deepseek' ? "bg-blue-600 border-blue-700 shadow-md" : "bg-slate-100 border-slate-200")}>
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                         <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className={selectedModel === 'deepseek' ? "text-blue-100" : "text-slate-400"} />
                                         <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedModel === 'deepseek' ? "text-white" : "text-slate-500"}/>
                                         <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={selectedModel === 'deepseek' ? "text-white" : "text-slate-500"}/>
                                      </svg>
                                   </div>
                                   <div>
                                      <div className="font-bold text-sm text-slate-800">DeepSeek v4 Flash</div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">极速推理，极低延迟</div>
                                   </div>
                                </div>
                                {selectedModel === 'deepseek' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                             </div>
                             <div 
                                onClick={() => setSelectedModel('qwen')}
                                className={cn("border-2 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm", selectedModel === 'qwen' ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 bg-white hover:border-indigo-300")}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", selectedModel === 'qwen' ? "bg-indigo-600 border-indigo-700 shadow-md" : "bg-slate-100 border-slate-200")}>
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                         <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className={selectedModel === 'qwen' ? "text-indigo-200" : "text-slate-400"} />
                                         <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={selectedModel === 'qwen' ? "text-white" : "text-slate-500"} />
                                      </svg>
                                   </div>
                                   <div>
                                      <div className="font-bold text-sm text-slate-800">Qwen Max</div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">适合复杂逻辑与多步调度</div>
                                   </div>
                                </div>
                                {selectedModel === 'qwen' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                             </div>
                         </div>
                      </div>
                      
                      {selectedModel === 'deepseek' ? (
                          <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-blue-50/30 p-5 mt-4">
                              <div className="absolute top-0 right-0 p-2">
                                  <Lock className="w-4 h-4 text-blue-400 opacity-50" />
                              </div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">记忆体模式 (Memory Strategy)</label>
                              <div className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed flex items-center justify-between">
                                  <span>长上下文滑动窗口保留 (8K Tokens)</span>
                              </div>
                              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-100/50 px-3 py-2 rounded-lg border border-blue-200">
                                  <ShieldCheck className="w-4 h-4" /> 推荐参数已锁定，与全局设定一致
                              </div>
                          </div>
                      ) : (
                          <div className="mt-4">
                             <label className="block text-xs font-bold text-slate-700 mb-2">记忆体模式 (Memory Strategy)</label>
                             <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={memoryStrategy} onChange={(e) => setMemoryStrategy(e.target.value)}>
                                 <option value="window">长上下文滑动窗口保留 (8K Tokens)</option>
                                 <option value="none">无记忆模式 (单次并发会话)</option>
                                 <option value="rag">基于向量库检索增强记忆 (RAG)</option>
                             </select>
                          </div>
                      )}
                      
                      <div className="pt-2">
                          <label className="block text-xs font-bold text-slate-700 mb-2">上下文最大传输 Token 数</label>
                          {selectedModel === 'deepseek' ? (
                             <div className="flex items-center gap-4">
                                <input type="range" min="8" max="1024" defaultValue="128" className="flex-1 accent-blue-600" />
                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">128K / 1M</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-4">
                                <input type="range" min="1" max="128" defaultValue="32" className="flex-1 accent-indigo-600" />
                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">32K / 128K</span>
                             </div>
                          )}
                      </div>
                      
                      <div className="pt-6 mt-6 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                             <label className="block text-xs font-bold text-slate-700">运行上下文 (Runtime Context) 数据挂载</label>
                             <button onClick={handleAddContext} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors">
                                 <Plus className="w-3 h-3" /> 添加上下文源
                             </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">指定 Agent 在执行任务时可访问的外部数据，例如特定的日志目录、规则配置文件等。Agent 能够基于这些上下文进行更精细化的分析和决策。</p>
                          
                          <div className="space-y-3">
                              <AnimatePresence>
                              {runtimeContexts.map((ctx) => (
                                  <motion.div key={ctx.id} initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3 relative group hover:border-blue-300 transition-colors cursor-pointer">
                                      <div className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                                         {ctx.type === 'dir' ? <FolderLock className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2">
                                              <div className="font-bold text-sm text-slate-700 truncate">{ctx.name}</div>
                                              <span className={cn(
                                                  "shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border max-w-[200px] truncate",
                                                  ctx.type === 'dir' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                              )}>{ctx.path}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{ctx.desc}</p>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); handleRemoveContext(ctx.id); }} className="text-slate-400 hover:text-rose-500 ml-2 transition-colors absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-white shadow border border-slate-200 p-1 rounded"><X className="w-3 h-3" /></button>
                                  </motion.div>
                              ))}
                              </AnimatePresence>
                              
                              {/* Dropzone for new items */}
                              <div onClick={handleAddContext} className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-colors">
                                  <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                                  <span className="text-xs font-bold text-slate-500">拖拽上传新的上下文文件，或点击选择</span>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {currentStep === 3 && (
             <div className="w-full max-w-3xl mx-auto py-10 px-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
                   <div className="flex items-center justify-between mb-4">
                       <h4 className="font-bold text-slate-800 text-base flex items-center gap-2"><Wrench className="w-5 h-5 text-cyan-600" /> 已装载的 Tools (物理工具)</h4>
                       <button className="text-xs bg-slate-100 font-bold text-slate-600 px-3 py-1 rounded hover:bg-slate-200">去市场添加</button>
                   </div>
                   {isNew ? (
                       <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
                           <Wrench className="w-6 h-6 text-slate-300 mb-2" />
                           <p className="text-sm font-bold text-slate-600 mb-1">暂无装载物理工具</p>
                           <p className="text-xs text-slate-500 mb-3">支持访问数据库、执行代码等操作</p>
                           <button className="text-xs bg-white border border-slate-200 font-bold text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm">浏览工具市场</button>
                       </div>
                   ) : (
                       <div className="grid grid-cols-2 gap-3">
                           <div className="border border-slate-200 p-3 rounded-lg flex items-start gap-3 bg-slate-50 relative overflow-hidden group">
                               <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0 hidden group-hover:block transition-all"></div>
                               <Server className="w-5 h-5 text-slate-400 mt-0.5" />
                               <div>
                                   <div className="font-bold text-sm text-slate-700">SQL 只读沙箱执行器</div>
                                   <div className="text-[10px] text-slate-500 mt-1">执行系统生成的 SELECT 并返回结构化结果</div>
                               </div>
                           </div>
                           <div className="border border-slate-200 p-3 rounded-lg flex items-start gap-3 bg-slate-50 relative overflow-hidden group">
                               <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0 hidden group-hover:block transition-all"></div>
                               <Database className="w-5 h-5 text-slate-400 mt-0.5" />
                               <div>
                                   <div className="font-bold text-sm text-slate-700">数据库表结构 Schema 读取</div>
                                   <div className="text-[10px] text-slate-500 mt-1">内省 SAP/CRM 等外部微服务的元数据</div>
                               </div>
                           </div>
                       </div>
                   )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                       <h4 className="font-bold text-slate-800 text-base flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> 已挂载的 Skills (认知技能)</h4>
                       <button className="text-xs bg-slate-100 font-bold text-slate-600 px-3 py-1 rounded hover:bg-slate-200">新建/导入</button>
                   </div>
                   {isNew ? (
                       <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
                           <Lightbulb className="w-6 h-6 text-slate-300 mb-2" />
                           <p className="text-sm font-bold text-slate-600 mb-1">暂无挂载认知技能</p>
                           <p className="text-xs text-slate-500 mb-3">赋予 Agent 应对特定复杂场景的专家知识流</p>
                           <button className="text-xs bg-white border border-slate-200 font-bold text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm">新建专属技能</button>
                       </div>
                   ) : (
                   <div className="flex flex-col gap-3">
                       <div className="border border-slate-200 p-3 rounded-lg flex justify-between items-center bg-slate-50">
                           <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                               <div>
                                   <div className="font-bold text-sm text-slate-800">长链路业财数据比对流</div>
                                   <div className="text-[10px] font-mono text-slate-500 mt-0.5 bg-slate-200 px-1.5 rounded inline-block">Skill ID: f-recon-01</div>
                               </div>
                           </div>
                           <ToggleRight className="w-8 h-8 text-blue-600" />
                       </div>
                        <div className="border border-slate-200 p-3 rounded-lg flex justify-between items-center bg-slate-50">
                           <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                               <div>
                                   <div className="font-bold text-sm text-slate-800">异常数据聚类降维</div>
                                   <div className="text-[10px] font-mono text-slate-500 mt-0.5 bg-slate-200 px-1.5 rounded inline-block">Skill ID: err-cluster-02</div>
                               </div>
                           </div>
                           <ToggleRight className="w-8 h-8 text-slate-300" />
                       </div>
                    </div>
                   )}
                 </div>
              </div>
          )}

          {currentStep === 4 && (
             <div className="w-full max-w-2xl mx-auto py-10 px-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                   <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-600" /> 安全与数据隔离</h4>
                   <div className="space-y-6">
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-2">数据权限沙箱 (Data Sandbox)</label>
                         <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800">
                             <option>严格隔离 (仅同组机构业务)</option>
                             <option>全局只读 (仅查不改)</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-2">敏感字段脱敏策略</label>
                         <div className="grid grid-[auto_1fr] items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer" />
                            <div className="text-sm font-medium text-slate-700">自动对 PII 进行掩码输出</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

                    {currentStep === 5 && (
            <div className="w-full max-w-4xl mx-auto py-10 px-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col gap-16">
               <div className="w-full flex justify-center">
                   <div className="flex flex-col items-center">
                       <div className="text-center w-full mb-6 shrink-0">
                           <h4 className="font-bold text-lg text-slate-800">Agent 系统架构拓扑</h4>
                           <p className="text-slate-500 text-sm mt-1">可视化该智能体的依赖链路与调用结构</p>
                       </div>

                       <div className="flex flex-col items-center shrink-0">
                            <div className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 relative z-10 w-64 justify-center">
                                 <UsersRound className="w-5 h-5 text-slate-500" />
                                 <span className="font-bold text-slate-700">业务系统 / 用户请求</span>
                            </div>
                            <div className="w-px h-10 bg-slate-300 relative z-0 flex items-center justify-center">
                                <ArrowDown className="w-4 h-4 text-slate-400 absolute bg-slate-50/100" />
                            </div>
                       </div>

                       <div className="flex items-center gap-0 relative w-full justify-center shrink-0" style={{ maxWidth: '800px' }}>
                          <div className="bg-blue-600 border-2 border-blue-700 px-8 py-5 rounded-2xl shadow-lg shadow-blue-600/20 flex flex-col items-center gap-2 relative z-10 w-72">
                                 <Bot className="w-8 h-8 text-white" />
                                 <span className="font-bold text-white text-lg">{isNew ? "新建领域 Agent" : "智能归因 Agent"}</span>
                                 <span className="bg-blue-800/50 text-blue-100 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-blue-500">Orchestrator Central</span>
                          </div>
                          <div className="w-16 h-px bg-slate-300 flex items-center justify-center relative -ml-1 -mr-1">
                             <ArrowRight className="w-4 h-4 text-slate-400 relative z-10 bg-slate-50/100 px-0.5" />
                          </div>
                          <div className="bg-white border-2 border-blue-200 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 relative z-10">
                                 <Cpu className="w-6 h-6 text-blue-500" />
                                 <div>
                                    <span className="font-bold text-blue-900 block text-sm">DeepSeek v4 Flash</span>
                                    <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">Foundation Model</span>
                                 </div>
                          </div>
                       </div>

                       {isNew ? (
                           <div className="flex flex-col items-center mt-[-8px] shrink-0 w-full max-w-3xl">
                             <div className="w-px h-12 bg-slate-300 relative z-0 flex items-center justify-center">
                                 <ArrowDown className="w-4 h-4 text-slate-400 absolute bg-slate-50/100" />
                             </div>
                             <div className="bg-slate-50 text-slate-500 border border-slate-200 px-6 py-4 rounded-xl text-sm font-bold shadow-sm">
                               尚未配置任何能力与边界
                             </div>
                           </div>
                       ) : (
                       <div className="flex flex-col items-center mt-[-8px] shrink-0 w-full max-w-3xl">
                            <div className="w-px h-12 bg-slate-300 relative z-0 flex items-center justify-center mr-[226px]">
                                <ArrowDown className="w-4 h-4 text-slate-400 absolute bg-slate-50/100" />
                            </div>
                            
                            <div className="w-full border-t-2 border-slate-300 relative pt-8 flex justify-between gap-6 px-10">
                               <div className="absolute top-0 left-[16.666%] w-px h-8 bg-slate-300">
                                  <ArrowDown className="w-3 h-3 text-slate-400 absolute -bottom-1.5 -left-[5px] bg-slate-50/100" />
                               </div>
                               <div className="absolute top-0 left-[50%] w-px h-8 bg-slate-300">
                                   <ArrowDown className="w-3 h-3 text-slate-400 absolute -bottom-1.5 -left-[5px] bg-slate-50/100" />
                               </div>
                               <div className="absolute top-0 right-[16.666%] w-px h-8 bg-slate-300">
                                   <ArrowDown className="w-3 h-3 text-slate-400 absolute -bottom-1.5 -left-[5px] bg-slate-50/100" />
                               </div>

                               <div className="flex-1 flex flex-col items-center gap-4 relative z-10 min-w-0">
                                   <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-1.5"><Lightbulb className="w-3 h-3 text-amber-500" /> Skills</div>
                                   <div className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center text-xs font-bold text-slate-600">已挂载 2 个专有技能</div>
                               </div>

                               <div className="flex-1 flex flex-col items-center gap-4 relative z-10 min-w-0">
                                   <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-1.5"><Wrench className="w-3 h-3 text-cyan-500" /> Tools</div>
                                   <div className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center text-xs font-bold text-slate-600">已装载 5 个物理工具</div>
                               </div>

                               <div className="flex-1 flex flex-col items-center gap-4 relative z-10 min-w-0">
                                   <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 flex items-center gap-1.5"><Server className="w-3 h-3 text-rose-500" /> Services</div>
                                   <div className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center text-xs font-bold text-slate-600">关联 2 个微服务</div>
                               </div>
                            </div>
                       </div>
                       )}

                       {/* Data Permission Boundaries section */}
                       <div className="w-full max-w-3xl mt-16 pt-10 border-t border-slate-200 flex flex-col items-center justify-center">
                           <div className="text-center w-full mb-8">
                               <h5 className="font-bold text-slate-800 text-lg flex items-center justify-center gap-2">
                                  <Shield className="w-5 h-5 text-indigo-500" /> 数据权限边界
                               </h5>
                               <p className="text-xs text-slate-500 mt-1">控制该 Agent 可以访问和修改的业务数据范围</p>
                           </div>

                           {isNew ? (
                               <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center w-full">
                                    <Database className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-600 mb-1">尚未分配数据权限</p>
                                    <p className="text-xs text-slate-500">此 Agent 目前处于隔离状态，无法读取或写入任何外部数据源。</p>
                                    <button className="mt-4 text-xs font-bold text-blue-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                                        配置权限策略
                                    </button>
                               </div>
                           ) : (
                               <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                                   {/* Resource 1 */}
                                   <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                                       <div className="w-1 h-full bg-emerald-500 absolute left-0 top-0"></div>
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <Database className="w-4 h-4 text-slate-400" />
                                               <span className="font-bold text-sm text-slate-700">财务结算数据库</span>
                                           </div>
                                           <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                               <Eye className="w-3 h-3" /> 只读
                                           </span>
                                       </div>
                                       <p className="text-xs text-slate-500 line-clamp-2">允许执行 SELECT 查询以获取历史结算记录和账单明细。</p>
                                       <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                                           <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">db.billing.orders</span>
                                           <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">db.billing.invoices</span>
                                       </div>
                                   </div>

                                   {/* Resource 2 */}
                                   <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                                       <div className="w-1 h-full bg-blue-500 absolute left-0 top-0"></div>
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <Webhook className="w-4 h-4 text-slate-400" />
                                               <span className="font-bold text-sm text-slate-700">工单管理 API</span>
                                           </div>
                                           <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                               <Pencil className="w-3 h-3" /> 读写
                                           </span>
                                       </div>
                                       <p className="text-xs text-slate-500 line-clamp-2">允许查询工单状态，并有权新增或更新数据异常处理工单。</p>
                                       <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                                           <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">POST /v1/tickets</span>
                                           <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">PUT /v1/tickets</span>
                                       </div>
                                   </div>
                                   
                                   {/* Resource 3 (Context) */}
                                   <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                                       <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0"></div>
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <FolderLock className="w-4 h-4 text-slate-400" />
                                               <span className="font-bold text-sm text-slate-700">运行上下文 (目录文件)</span>
                                           </div>
                                           <span className="bg-cyan-50 text-cyan-600 border border-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                               <Eye className="w-3 h-3" /> 局域只读
                                           </span>
                                       </div>
                                       <p className="text-xs text-slate-500 line-clamp-2">允许 Agent 读取系统级配置字典与底层排障日志，受制于沙箱访问。</p>
                                       <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                                           {runtimeContexts.map(ctx => (
                                               <span key={ctx.id} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">{ctx.path}</span>
                                           ))}
                                       </div>
                                   </div>
                                    
                                   {/* Resource 4 */}
                                   <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden md:col-span-3 group">
                                       <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                               <UsersRound className="w-4 h-4 text-slate-400" />
                                               <span className="font-bold text-sm text-slate-500">HR 人事系统 (被拒绝)</span>
                                           </div>
                                           <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                               <ShieldBan className="w-3 h-3" /> 拦截策略
                                           </span>
                                       </div>
                                       <p className="text-xs text-slate-400">基于安全策略，该 Agent 被严格禁止访问任何员工薪酬及隐私数据连接点。</p>
                                   </div>
                               </div>
                           )}
                       </div>

                   </div>
               </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="w-full h-full flex animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
               {/* Workflow Canvas */}
               <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 flex justify-center relative">
                   {/* Background dot pattern */}
                   <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                   
                   <div className="absolute inset-0 bg-slate-50/50 overflow-hidden w-full h-full text-left">
                           {/* Toolbox / Component Library */}
                           <div className="absolute top-6 left-6 w-56 flex flex-col gap-3 z-30">
                              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                 <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">节点库 (Nodes)</span>
                                    <div className="flex gap-1">
                                       <div role="button" className="p-1 hover:bg-slate-200 rounded cursor-pointer"><Search className="w-3 h-3 text-slate-500" /></div>
                                    </div>
                                 </div>
                                 <div className="p-2 flex flex-col gap-1 max-h-[400px] overflow-auto">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 mt-1">触发器</div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><PlayCircle className="w-4 h-4 text-emerald-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">定时任务 Trigger</span></div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><Webhook className="w-4 h-4 text-emerald-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">Webhook Trigger</span></div>
                                    
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 mt-2">认知与决策</div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><BrainCircuit className="w-4 h-4 text-blue-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">LLM Node</span></div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><GitBranch className="w-4 h-4 text-purple-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">条件分支 (If/Else)</span></div>

                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 mt-2">执行与工具</div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><SearchCode className="w-4 h-4 text-cyan-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">数据检索 (Query)</span></div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><Database className="w-4 h-4 text-amber-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">数据库操作 (SQL)</span></div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-grab border border-transparent hover:border-slate-200 transition-all"><Bell className="w-4 h-4 text-amber-500 shrink-0" /> <span className="text-xs font-medium text-slate-700 truncate">消息通知 (Notify)</span></div>
                                 </div>
                              </div>

                              <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-2 shadow-sm flex items-center justify-between">
                                 <div role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setZoomLevel(z => Math.max(0.2, z - 0.1)); }} className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors tooltip cursor-pointer" title="缩小 (Zoom Out)"><ZoomOut className="w-4 h-4" /></div>
                                 <span className="text-[10px] font-mono text-slate-500 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                                 <div role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setZoomLevel(z => Math.min(2, z + 0.1)); }} className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors tooltip cursor-pointer" title="放大 (Zoom In)"><ZoomIn className="w-4 h-4" /></div>
                                 <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                 <div role="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setZoomLevel(0.85); setPan({ x: 0, y: 0 }); }} className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors tooltip cursor-pointer" title="适应窗口 (Fit View)"><Maximize className="w-4 h-4" /></div>
                              </div>
                           </div>

                           <div className="absolute bottom-10 left-6 w-60 flex flex-col gap-3 z-30">
                              <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                      <TerminalSquare className="w-4 h-4 text-indigo-600" />
                                      <h3 className="font-bold text-[13px] text-slate-800 tracking-tight">执行上下文诊断日志</h3>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">提供额外的执行链路所需环境日志或参考标准，用于归因节点决策支撑。</p>
                                  <div 
                                     onClick={(e) => { e.stopPropagation(); setUploadedFiles(prev => [...prev, {name: 'custom_context_v2.log', size: '200KB', type: 'log'}])}}
                                     className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group"
                                  >
                                      <UploadCloud className="w-5 h-5 text-indigo-300 mx-auto mb-1.5 group-hover:text-indigo-500 transition-colors" />
                                      <span className="text-[11px] font-bold text-indigo-600">点击上传日志 .log/.json</span>
                                  </div>
                                  
                                   {uploadedFiles.filter(f => f.type === 'log').length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1 hide-scrollbar">
                                            {uploadedFiles.filter(f => f.type === 'log').map((file, i) => (
                                               <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 text-[10px]">
                                                   <div className="flex items-center gap-2 overflow-hidden">
                                                       <TerminalSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                       <span className="font-medium text-slate-700 truncate max-w-[120px]" title={file.name}>{file.name}</span>
                                                   </div>
                                                   <span className="text-slate-400 font-mono scale-90">{file.size}</span>
                                               </div>
                                            ))}
                                        </div>
                                    )}
                              </div>
                           </div>

                           {/* Canvas Area wrapper */}
                           <div 
                              className={cn("absolute inset-0 overflow-hidden w-full h-full flex items-center justify-center outline-none", isCanvasDragging ? "cursor-grabbing" : "cursor-grab")}
                              style={{
                                  backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                                  backgroundSize: `${16 * zoomLevel}px ${16 * zoomLevel}px`,
                                  backgroundPosition: `${pan.x}px ${pan.y}px`
                              }}
                              onPointerDown={(e) => {
                                  if (e.target instanceof Element && e.target.closest('[role="button"], button, .cursor-pointer')) return;
                                  setIsCanvasDragging(true);
                                  setCanvasDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                                  (e.target as Element).setPointerCapture(e.pointerId);
                              }}
                              onPointerMove={(e) => {
                                  if (!isCanvasDragging) return;
                                  setPan({ x: e.clientX - canvasDragStart.x, y: e.clientY - canvasDragStart.y });
                              }}
                              onPointerUp={(e) => {
                                  setIsCanvasDragging(false);
                                  if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
                                      e.target.releasePointerCapture(e.pointerId);
                                  }
                              }}
                              onPointerCancel={(e) => {
                                  setIsCanvasDragging(false);
                              }}
                              onWheel={(e) => {
                                  if (e.ctrlKey || e.metaKey) {
                                      setZoomLevel(z => Math.max(0.2, Math.min(2, z - e.deltaY * 0.005)));
                                  } else {
                                      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
                                  }
                              }}
                           >
                               {isNew ? (
                                   <div className="flex flex-col items-center justify-center w-full h-[800px] text-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})` }}>
                                        <Bot className="w-16 h-16 text-slate-300 mb-4" />
                                        <h3 className="font-bold text-slate-500 text-lg">工作流画布为空</h3>
                                        <p className="text-sm text-slate-400 mt-2 max-w-sm">从左侧节点库拖拽触发器、判断逻辑和工具节点，构建符合您的垂直场景智能体执行链路。</p>
                                   </div>
                               ) : (<>
                               <div className="relative w-[1200px] h-[1300px] shrink-0 z-10 mx-auto" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`, transformOrigin: 'center' }}>
                               {/* SVG Edge Connections */}
                               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                   <defs>
                                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                                      </marker>
                                      <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                                      </marker>
                                   </defs>
                                   {/* Trigger to Planner */}
                                   <path d="M 600 240 C 600 290, 600 290, 600 330" stroke={activeWorkflowNode === 'trigger' || activeWorkflowNode === 'planner' ? '#818cf8' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd={activeWorkflowNode === 'trigger' || activeWorkflowNode === 'planner' ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
                                   
                                   {/* Planner to Action */}
                                   <path d="M 600 440 C 600 490, 600 490, 600 530" stroke={activeWorkflowNode === 'planner' || activeWorkflowNode === 'action' ? '#818cf8' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd={activeWorkflowNode === 'planner' || activeWorkflowNode === 'action' ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
                                   
                                   {/* Action to Decision */}
                                   <path d="M 600 640 C 600 690, 600 690, 600 730" stroke={activeWorkflowNode === 'action' || activeWorkflowNode === 'decision' ? '#818cf8' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd={activeWorkflowNode === 'action' || activeWorkflowNode === 'decision' ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
                                   
                                   {/* Decision Branches */}
                                   {/* Branch 1 -> End Ok */}
                                   <path d="M 500 830 C 500 870, 300 870, 300 930" stroke={activeWorkflowNode === 'decision' || activeWorkflowNode === 'endOk' ? '#10b981' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                                   <g transform="translate(400, 878)">
                                       <rect x="-60" y="-12" width="120" height="24" rx="12" fill="white" stroke="#10b981" strokeWidth="1" />
                                       <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#10b981">Condition: No Diff</text>
                                   </g>

                                   {/* Branch 2 -> Error Handling */}
                                   <path d="M 700 830 C 700 870, 900 870, 900 930" stroke={activeWorkflowNode === 'decision' || activeWorkflowNode === 'errorHandling' ? '#f43f5e' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                                   <g transform="translate(800, 878)">
                                       <rect x="-60" y="-12" width="120" height="24" rx="12" fill="white" stroke="#f43f5e" strokeWidth="1" />
                                       <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#f43f5e">Condition: Has Diff</text>
                                   </g>

                                   {/* ErrorHandling to Notification */}
                                   <path d="M 900 1100 C 900 1140, 900 1140, 900 1180" stroke={activeWorkflowNode === 'errorHandling' || activeWorkflowNode === 'notification' ? '#818cf8' : '#cbd5e1'} strokeWidth="2" fill="none" markerEnd={activeWorkflowNode === 'errorHandling' || activeWorkflowNode === 'notification' ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
                               </svg>

                                  {/* Nodes wrapper absolute positioned */}
                                  
                                  {/* Trigger */}
                                  <div className="absolute left-[470px] top-[180px] w-[260px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('trigger')}}>
                                     <div className={cn("px-6 py-4 rounded-full flex items-center justify-center gap-3 shadow-lg transition-all", activeWorkflowNode === 'trigger' ? "bg-emerald-600 text-white ring-4 ring-emerald-600/30 scale-105" : "bg-slate-800 text-white hover:bg-slate-700")}>
                                        <PlayCircle className={cn("w-5 h-5", activeWorkflowNode === 'trigger' ? "text-emerald-200" : "text-emerald-400")} />
                                        <span className="font-bold text-[15px]">接收数据质检任务</span>
                                     </div>
                                     {viewMode === 'observe' && (
                                       <div className="absolute -right-32 top-3 flex flex-col gap-1 z-20 pointer-events-none">
                                          <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Triggered</div>
                                       </div>
                                     )}
                                  </div>

                                  {/* Planner */}
                                  <div className="absolute left-[440px] top-[330px] w-[320px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('planner')}}>
                                     <div className={cn("border-2 px-5 py-4 rounded-xl flex items-center gap-4 shadow-md bg-white transition-all", activeWorkflowNode === 'planner' ? "border-blue-500 ring-4 ring-blue-500/20 scale-105" : "border-slate-200 hover:border-blue-300")}>
                                        <div className={cn("p-2 rounded-lg", activeWorkflowNode === 'planner' ? "bg-blue-100" : "bg-blue-50")}>
                                          <BrainCircuit className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">理解意图与规划</h5>
                                          <p className="text-[11px] text-slate-500 mt-0.5">分解出取数和核对的目标结构</p>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Planner</div>
                                     </div>
                                     {viewMode === 'observe' && (
                                        <div className="absolute -right-32 top-4 flex flex-col gap-1 z-20 pointer-events-none">
                                           <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 2.1s</div>
                                           <div className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">Tokens: 6k</div>
                                        </div>
                                     )}
                                  </div>

                                  {/* Action */}
                                  <div className="absolute left-[440px] top-[530px] w-[320px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('action')}}>
                                     <div className={cn("border-2 px-5 py-4 rounded-xl flex items-center gap-4 shadow-md bg-white transition-all", activeWorkflowNode === 'action' ? "border-cyan-500 ring-4 ring-cyan-500/20 scale-105" : "border-slate-200 hover:border-cyan-300")}>
                                        <div className={cn("p-2 rounded-lg", activeWorkflowNode === 'action' ? "bg-cyan-100" : "bg-cyan-50")}>
                                          <SearchCode className="w-6 h-6 text-cyan-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">跨系统数据撷取</h5>
                                          <div className="text-[10px] text-slate-500 mt-1 font-mono leading-tight flex gap-1.5 flex-wrap">
                                            <span className="bg-slate-50 border border-slate-200 px-1.5 py-[2px] rounded text-slate-600">SQL沙箱</span>
                                            <span className="bg-slate-50 border border-slate-200 px-1.5 py-[2px] rounded text-slate-600">结构读取</span>
                                          </div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Action</div>
                                     </div>
                                     {viewMode === 'observe' && (
                                        <div className="absolute -right-32 top-2 flex flex-col gap-1 z-20 pointer-events-none">
                                           <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 0.8s</div>
                                           <div className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">API Calls: 3</div>
                                           <div className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">Rows: 240</div>
                                        </div>
                                     )}
                                  </div>

                                  {/* Decision */}
                                  <div className="absolute left-[440px] top-[730px] w-[320px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('decision')}}>
                                      <div className={cn("border-2 px-5 py-4 rounded-xl flex items-center gap-4 shadow-md bg-white transition-all", activeWorkflowNode === 'decision' ? "border-purple-500 ring-4 ring-purple-500/20 scale-105" : "border-slate-200 hover:border-purple-300")}>
                                        <div className={cn("p-2 rounded-lg", activeWorkflowNode === 'decision' ? "bg-purple-100" : "bg-purple-50")}>
                                          <GitBranch className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">差异计算与比对</h5>
                                          <p className="text-[11px] text-purple-600 mt-0.5 font-bold">判断：是否发现异常差异？</p>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Rule Engine</div>
                                      </div>
                                      {viewMode === 'observe' && (
                                        <div className="absolute -right-28 top-4 flex flex-col gap-1 z-20 pointer-events-none">
                                           <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 0.1s</div>
                                           <div className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm font-bold">Diff Match</div>
                                        </div>
                                      )}
                                  </div>

                                  {/* End Ok */}
                                  <div className="absolute left-[180px] top-[940px] w-[240px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('endOk')}}>
                                      <div className={cn("border-2 px-4 py-4 rounded-xl flex items-center gap-3 shadow-md bg-white transition-all justify-center", activeWorkflowNode === 'endOk' ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-105" : "border-slate-200 hover:border-emerald-300")}>
                                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                          <span className="font-bold text-sm text-slate-700">数据一致 / 正常结束</span>
                                      </div>
                                  </div>

                                  {/* Error Handling */}
                                  <div className="absolute left-[740px] top-[940px] w-[320px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('errorHandling')}}>
                                     <div className={cn("border-2 px-5 py-4 rounded-xl flex flex-col shadow-md bg-white transition-all", activeWorkflowNode === 'errorHandling' ? "border-rose-500 ring-4 ring-rose-500/20 scale-105" : "border-slate-200 hover:border-rose-300")}>
                                        <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                                          <div className={cn("p-1.5 rounded-lg", activeWorkflowNode === 'errorHandling' ? "bg-rose-100" : "bg-rose-50")}>
                                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                                          </div>
                                          <span className="font-bold text-sm text-slate-800">异常数据聚类与归因</span>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="text-xs text-rose-700 font-mono text-[10px] bg-slate-50 border border-slate-200 p-2 rounded w-full flex justify-between items-center"><span className="text-rose-900 font-sans font-bold flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Skill</span> 异常聚类分析</div>
                                            <div className="text-xs text-rose-700 font-mono text-[10px] bg-slate-50 border border-slate-200 p-2 rounded w-full flex justify-between items-center"><span className="text-rose-900 font-sans font-bold flex items-center gap-1.5"><FileOutput className="w-3.5 h-3.5 text-blue-500" /> Action</span> 生成质检报告</div>
                                        </div>
                                     </div>
                                     {viewMode === 'observe' && (
                                        <div className="absolute -right-32 top-8 flex flex-col gap-1 z-20 pointer-events-none">
                                           <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 5.2s</div>
                                           <div className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">Tokens: 14k</div>
                                           <div className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">Gen: 1 File</div>
                                        </div>
                                     )}
                                  </div>

                                  {/* Notification */}
                                  <div className="absolute left-[740px] top-[1180px] w-[320px] cursor-pointer" onClick={(e) => {e.stopPropagation(); setActiveWorkflowNode('notification')}}>
                                     <div className={cn("border-2 px-5 py-4 rounded-xl flex flex-col shadow-md bg-white transition-all", activeWorkflowNode === 'notification' ? "border-amber-500 ring-4 ring-amber-500/20 scale-105" : "border-slate-200 hover:border-amber-300")}>
                                        <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                                          <div className={cn("p-1.5 rounded-lg", activeWorkflowNode === 'notification' ? "bg-amber-100" : "bg-amber-50")}>
                                            <Bell className="w-5 h-5 text-amber-500 shrink-0" />
                                          </div>
                                          <span className="font-bold text-sm text-slate-800">通知与响应闭环</span>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="text-xs text-amber-700 font-mono text-[10px] bg-slate-50 border border-slate-200 p-2 rounded w-full flex justify-between items-center"><span className="text-slate-700 font-sans font-bold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> Action</span> IM/邮件推流</div>
                                            <div className="text-xs text-amber-700 font-mono text-[10px] bg-slate-50 border border-slate-200 p-2 rounded w-full flex justify-between items-center"><span className="text-slate-700 font-sans font-bold flex items-center gap-1.5"><Webhook className="w-3.5 h-3.5 text-emerald-500" /> Webhook</span> 触发纠错工单</div>
                                        </div>
                                     </div>
                                     {viewMode === 'observe' && (
                                        <div className="absolute -right-28 top-8 flex flex-col gap-1 z-20 pointer-events-none">
                                           <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> 0.3s</div>
                                           <div className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">Notify: 1</div>
                                        </div>
                                     )}
                                  </div>
                               </div>
                               </>)}
                           </div>
                        </div>
                    </div>

               {/* Right Configuration Panel */}
               <AnimatePresence>
                 {activeWorkflowNode && (
                   <motion.div 
                     initial={{ width: 0, opacity: 0 }} 
                     animate={{ width: 384, opacity: 1 }} 
                     exit={{ width: 0, opacity: 0 }} 
                     transition={{ duration: 0.2, ease: "easeInOut" }}
                     className="bg-white border-l border-slate-200 shadow-xl flex flex-col z-20 shrink-0 overflow-hidden"
                   >
                     <div className="w-96 flex flex-col h-full bg-white relative">
                       <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                          <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               {viewMode === 'build' ? <Settings className="w-4 h-4 text-slate-500" /> : <TerminalSquare className="w-4 h-4 text-indigo-500" />}
                               {viewMode === 'build' ? "Node Configuration" : "Diagnostics & State"}
                            </div>
                            <div role="button" onClick={() => setActiveWorkflowNode(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none bg-slate-200/50 hover:bg-slate-200 p-1 rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></div>
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded w-max">{activeWorkflowNode ? activeWorkflowNode.toUpperCase() : 'NONE'}</span>
                       </div>
                       <div className="flex-1 overflow-y-auto p-5">
                         <AnimatePresence mode="wait">
                           {viewMode === 'build' ? (
                             <>
                               {activeWorkflowNode === 'trigger' && (
                            <motion.div key="build-trigger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">触发器类型 (Trigger)</label>
                            <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                              <option>事件驱动 (Event Webhook)</option>
                              <option>定时调度 (Cron Schedule)</option>
                              <option>手动触发 (API Call)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">监听通道 (Channel)</label>
                            <input type="text" defaultValue="data_quality_events" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                          </div>
                          <div className="pt-2 border-t border-slate-100">
                             <div className="flex items-center gap-2 mb-2">
                               <input type="checkbox" id="queue" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                               <label htmlFor="queue" className="text-xs font-bold text-slate-700">启用消息队列缓冲</label>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed">在高并发场景下将任务推入缓冲区，避免系统过载。</p>
                          </div>
                        </motion.div>
                      )}

                      {activeWorkflowNode === 'planner' && (
                        <motion.div key="planner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">推理模型选型</label>
                            <select className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 outline-none">
                              <option>与全局设置一致 (DeepSeek V4 Flash)</option>
                              <option>Qwen Max (混合调度)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">Node Prompt (规划侧重点)</label>
                            <textarea rows={4} defaultValue="分析用户输入的模糊指令，提取数据比对的源表、目标表及关联主键。同时结合运行上下文（如配置规则与日志文件）对异常情况进行精细化推断，如果缺少条件需中断任务。" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 resize-none outline-none font-mono text-[11px]"></textarea>
                          </div>
                           <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block flex justify-between">最多思考步骤 <span className="text-blue-600">3 Steps</span></label>
                            <input type="range" min="1" max="10" defaultValue="3" className="w-full accent-blue-600" />
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3 border-t border-slate-100 pt-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700">最大并发任务数</label>
                                  <input type="number" defaultValue={5} min="1" max="20" className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-blue-500" />
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <label className="text-xs font-bold text-slate-700">规划深度限制</label>
                                  <input type="number" defaultValue={10} min="1" max="50" className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-blue-500" />
                              </div>
                          </div>
                        </motion.div>
                      )}

                      {activeWorkflowNode === 'action' && (
                        <motion.div key="action" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <label className="text-xs font-bold text-slate-700 block mb-1">可调用工具授权 (Tools)</label>
                          <div className="space-y-2">
                             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:border-slate-300">
                               <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                               <div>
                                 <div className="text-xs font-bold text-slate-700">SQL 只读沙箱执行器</div>
                                 <div className="text-[10px] text-slate-500 mt-0.5 font-mono">system.sql.reader</div>
                               </div>
                             </label>
                             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:border-slate-300">
                               <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                               <div>
                                 <div className="text-xs font-bold text-slate-700">数据库表结构 Schema 读取</div>
                                 <div className="text-[10px] text-slate-500 mt-0.5 font-mono">system.db.schema</div>
                               </div>
                             </label>
                             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:border-slate-300 opacity-60">
                               <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                               <div>
                                 <div className="text-xs font-bold text-slate-700">Web Search (联网搜索)</div>
                                 <div className="text-[10px] text-slate-500 mt-0.5 font-mono">tools.web.search</div>
                               </div>
                             </label>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3 mt-4">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700">执行超时 (Timeout)</label>
                                  <div className="flex items-center gap-1 text-xs">
                                     <input type="number" defaultValue={30} className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-blue-500" />
                                     <span className="text-slate-500">秒</span>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <label className="text-xs font-bold text-slate-700">自动重试次数</label>
                                  <input type="number" defaultValue={3} min="0" max="5" className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-blue-500" />
                              </div>
                          </div>
                        </motion.div>
                      )}

                      {activeWorkflowNode === 'decision' && (
                        <motion.div key="decision" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">决策条件判断逻辑</label>
                            <select 
                              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 outline-none mb-2 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              value={decisionLogic}
                              onChange={(e) => setDecisionLogic(e.target.value)}
                            >
                              <option value="llm">由大语言模型自动推理 (LLM Logic)</option>
                              <option value="code">基于确定性代码规则 (Code Regex)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 leading-relaxed">让模型基于上方采集的系统数据，以及挂载的运行上下文（日志、配置等），通过财务逻辑精细化比对并确定差异归属及是否构成实际异常。</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                             <div className="text-xs font-bold text-purple-900 mb-2">流出路径 (Edges)</div>
                             <div className="space-y-2">
                               <div className="flex justify-between items-center text-xs">
                                 <span className="text-slate-600 font-medium font-mono">分支 1: No Diff</span>
                                 <span className="bg-white text-[10px] px-1.5 py-0.5 rounded border border-slate-200">Goto End</span>
                               </div>
                               <div className="flex justify-between items-center text-xs">
                                 <span className="text-slate-600 font-medium font-mono">分支 2: Has Diff</span>
                                 <span className="bg-white text-[10px] px-1.5 py-0.5 rounded border border-slate-200">Goto ErrorHandling</span>
                               </div>
                             </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700">严格模式比对 (Strict Mode)</label>
                                  <div className="relative inline-block w-8 h-4 rounded-full bg-blue-600 cursor-pointer">
                                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <label className="text-xs font-bold text-slate-700">容错差异比率阈值</label>
                                  <div className="flex items-center gap-1 text-xs">
                                     <input type="number" defaultValue={0} min="0" max="100" className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-blue-500" />
                                     <span className="text-slate-500 font-mono text-[10px]">%</span>
                                  </div>
                              </div>
                          </div>
                        </motion.div>
                      )}

                      {activeWorkflowNode === 'errorHandling' && (
                        <motion.div key="errorHandling" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">异常处理 Skill 挂载</label>
                            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 relative cursor-pointer group">
                               <div className="absolute right-2 top-2 text-amber-600 hidden group-hover:block text-[10px] font-bold">更换</div>
                               <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500"/>异常数据聚类降维</div>
                               <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">分析异常账目的发生时间段及凭证聚集特征，提供数据闭环链路的归因证据。</div>
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700">聚类阈值 (Threshold)</label>
                                  <div className="flex items-center gap-2">
                                     <input type="range" min="0" max="1" step="0.05" defaultValue="0.85" className="w-24 accent-amber-500" />
                                     <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-500">0.85</span>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <label className="text-xs font-bold text-slate-700">最大聚类数量</label>
                                  <input type="number" defaultValue={5} min="1" max="20" className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center bg-white outline-none focus:border-amber-500" />
                              </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">输出动作 (Output Action)</label>
                            <div className="border border-slate-200 bg-slate-50 rounded-lg p-3">
                               <div className="font-bold text-sm text-slate-800">生成标准质检报告</div>
                               <div className="text-[10px] font-mono text-slate-500 mt-1 bg-white border border-slate-200 px-1 py-0.5 rounded inline-block">Format: Markdown</div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-100">
                             <button className="w-full px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors">
                               向后流转移交 (Hand-off)
                             </button>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeWorkflowNode === 'notification' && (
                        <motion.div key="notification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">通知分发渠道</label>
                            <div className="space-y-2">
                               <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:border-slate-300">
                                 <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer" />
                                 <div>
                                   <div className="text-xs font-bold text-slate-700 block">企微/飞书推送机器人</div>
                                 </div>
                               </label>
                               <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:border-slate-300">
                                 <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer" />
                                 <div>
                                   <div className="text-xs font-bold text-slate-700 block">业务系统工单 Webhook</div>
                                 </div>
                               </label>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 block">通知内容组装与派发</label>
                            <div className="border border-slate-200 bg-slate-50 rounded-lg p-3">
                               <div className="font-bold text-sm text-slate-800">透传上下文及质检报告</div>
                               <div className="text-[10px] font-mono text-slate-500 mt-1 line-clamp-2">附带异常账目的主键ID、凭证及聚类归因分析记录，精准推送至财务对接人。</div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-100 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End of Execution Loop</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeWorkflowNode === 'endOk' && (
                        <motion.div key="endOk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                          <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h4 className="font-bold text-slate-800 text-base">终端节点 (Terminal)</h4>
                            <p className="text-xs text-slate-500 mt-1">数据核对一致，流转在此安全结束，不产生告警噪音。</p>
                          </div>
                        </motion.div>
                      )}
                      </>
                    ) : (
                      <motion.div key={`observe-${activeWorkflowNode}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                         {/* Common Header for Trace Detail */}
                         <div className="flex justify-between items-start pt-2">
                            <div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Execution Status</div>
                               <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5"/> Success</span>
                                  <span className="text-xs text-slate-500 font-mono">
                                     {activeWorkflowNode === 'trigger' ? 't=0ms' : activeWorkflowNode === 'planner' ? 't=2.1s' : activeWorkflowNode === 'action' ? 't=2.9s' : activeWorkflowNode === 'decision' ? 't=3.0s' : activeWorkflowNode === 'errorHandling' ? 't=8.2s' : 't=8.5s'}
                                  </span>
                               </div>
                            </div>
                         </div>
                         
                         {/* I/O State */}
                         <div>
                            <div className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-2">Input Payload (依赖项)</div>
                            <div className="bg-slate-800 text-slate-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto whitespace-pre">
                               {activeWorkflowNode === 'trigger' && `{\n  "event_id": "EVT-9902",\n  "batch_size": 240,\n  "timestamp": "2024-05-17T01:40:00Z"\n}`}
                               {activeWorkflowNode === 'planner' && `{\n  "raw_context": "Daily DB reconcile",\n  "auth_token": "valid"\n}`}
                               {activeWorkflowNode === 'action' && `{\n  "tasks": [\n    {"type": "sql", "target": "sap_db"},\n    {"type": "api", "target": "dms_billing"}\n  ]\n}`}
                               {activeWorkflowNode === 'decision' && `{\n  "sap_records": [...240 items],\n  "dms_records": [...240 items]\n}`}
                               {activeWorkflowNode === 'errorHandling' && `{\n  "status": "MISMATCH_DETECTED",\n  "diff_count": 4,\n  "diff_samples": [...]\n}`}
                               {activeWorkflowNode === 'notification' && `{\n  "report_url": "s3://reports/id-x",\n  "severity": "HIGH",\n  "cause": "SYSTEM_TIMEOUT"\n}`}
                               {activeWorkflowNode === 'endOk' && `{}`}
                            </div>
                         </div>
                         
                         <div>
                            <div className="text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-2">Output State (执行产物)</div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                               {activeWorkflowNode === 'trigger' && <div className="text-xs font-medium text-slate-600 leading-relaxed">成功解析事件包，向下流转上下文对象 <code className="bg-slate-200 px-1 rounded text-emerald-600 font-mono text-[10px]">ctx.payload</code>。</div>}
                               {activeWorkflowNode === 'planner' && <div className="text-xs font-medium text-slate-600 leading-relaxed">分解为两个并发的 Action Task，生成 AST 查询意图。</div>}
                               {activeWorkflowNode === 'action' && (
                                   <div className="flex flex-col gap-2">
                                       <div className="text-[10px] flex items-center justify-between border-b border-slate-100 pb-1">
                                           <span className="font-bold text-slate-700">DB.SAP.Query</span>
                                           <span className="text-emerald-600 font-mono">200 OK</span>
                                       </div>
                                       <div className="text-[10px] flex items-center justify-between">
                                           <span className="font-bold text-slate-700">API.DMS.Fetch</span>
                                           <span className="text-emerald-600 font-mono">200 OK</span>
                                       </div>
                                   </div>
                               )}
                               {activeWorkflowNode === 'decision' && <div className="text-xs font-medium text-rose-600 leading-relaxed font-bold bg-rose-50 p-2 rounded">触发异常分支: 发现 4 笔孤儿对账单。</div>}
                               {activeWorkflowNode === 'errorHandling' && <div className="text-xs font-medium text-slate-600 leading-relaxed">技能执行完毕。消耗 14K Tokens。生成 Markdown 归因文件 <code className="bg-slate-200 px-1 rounded text-purple-600 font-mono text-[10px]">report_v1.md</code>。</div>}
                               {activeWorkflowNode === 'notification' && <div className="text-xs font-medium text-slate-600 leading-relaxed">飞书机器人 (Robot 01) 推送回调 HTTP 200，并完成触发逻辑。</div>}
                               {activeWorkflowNode === 'endOk' && <div className="text-xs font-medium text-slate-600 leading-relaxed">终端节点未进行额外数据转换。返回退出码 0。</div>}
                            </div>
                         </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
            </div>
          )}

          {currentStep === 7 && (
            <div className="w-full h-full flex flex-col p-8 overflow-y-auto animate-in fade-in duration-300">
               <div className="max-w-4xl mx-auto w-full">
                   <div className="flex items-center justify-between mb-8">
                       <div>
                           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                               <TerminalSquare className="w-6 h-6 text-indigo-600" /> 沙盒模拟与推演
                           </h2>
                           <p className="text-sm text-slate-500 mt-1">在隔离环境中上传测试数据集，观察 Agent 解析、规划与执行全过程。</p>
                       </div>
                       <div className="flex items-center gap-3">
                           {sandboxPhase !== 'upload' && (
                               <button onClick={() => {setSandboxPhase('upload'); setUploadedFiles([]);}} className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors">
                                   重置测试状态
                               </button>
                           )}
                       </div>
                   </div>

                   {sandboxPhase === 'upload' && (
                       <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
                                   <div className="flex items-center gap-2 mb-2">
                                      <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                                      <h3 className="font-bold text-slate-700">业务单据数据源 (可选待定)</h3>
                                   </div>
                                   <p className="text-xs text-slate-500 mb-4">上传需要验证处理能力的数据表格。如果暂时没有数据，可直接跳过，引擎将自动调度系统内部配置好的 Mock 沙盘数据开展测试。</p>
                                   
                                   <div 
                                     onClick={() => setUploadedFiles(prev => [...prev, {name: 'demo-data-1001.xlsx', size: '1.2MB', type: 'data'}])}
                                     className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group"
                                   >
                                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-xs font-bold text-blue-600">点击导入 CSV/Excel</span>
                                   </div>
                                   {uploadedFiles.filter(f => f.type === 'data').length > 0 && (
                                       <div className="mt-3 space-y-2">
                                           {uploadedFiles.filter(f => f.type === 'data').map((file, i) => (
                                              <div key={i} className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded p-2 text-xs">
                                                  <div className="flex items-center gap-2">
                                                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                                                      <span className="font-medium text-slate-700">{file.name}</span>
                                                  </div>
                                                  <span className="text-slate-400">{file.size}</span>
                                              </div>
                                           ))}
                                       </div>
                                   )}
                               </div>

                               <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
                                   <div className="flex items-center gap-2 mb-2">
                                      <TerminalSquare className="w-5 h-5 text-slate-700" />
                                      <h3 className="font-bold text-slate-700">运行日志数据源 (可选依赖)</h3>
                                   </div>
                                   <p className="text-xs text-slate-500 mb-4">导入可能相关的系统运行日志文件。Agent 可在工作流归因决策时，自动关联比对并对提取错误特征以协助人类推测根因。</p>
                                   
                                   <div 
                                     onClick={() => setUploadedFiles(prev => [...prev, {name: 'sys-log-evt-2041.json', size: '400KB', type: 'log'}])}
                                     className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group"
                                   >
                                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-slate-700 transition-colors" />
                                        <span className="text-xs font-bold text-slate-600">导入诊断日志</span>
                                   </div>
                                   {uploadedFiles.filter(f => f.type === 'log').length > 0 && (
                                       <div className="mt-3 space-y-2">
                                           {uploadedFiles.filter(f => f.type === 'log').map((file, i) => (
                                              <div key={i} className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded p-2 text-xs">
                                                  <div className="flex items-center gap-2">
                                                      <TerminalSquare className="w-4 h-4 text-slate-500" />
                                                      <span className="font-medium text-slate-700">{file.name}</span>
                                                  </div>
                                                  <span className="text-slate-400">{file.size}</span>
                                              </div>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           </div>
                           
                           <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                               <div className="text-xs text-slate-500">
                                   全部数据准备完成或直接空置后，点击开始分析。（沙盒模式下仅进行推演并拦截所有真实业务系统写操作）
                               </div>
                               <button 
                                  onClick={() => setSandboxPhase('running')}
                                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors flex items-center flex-shrink-0 gap-2 group"
                               >
                                   <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> {uploadedFiles.length > 0 ? "投入数据并启动运行" : "以预置 Mock 上下文启动"}
                               </button>
                           </div>
                       </div>
                   )}

                   {sandboxPhase === 'running' && (
                       <div className="space-y-4">
                           <div className="bg-slate-900 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                   <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5 }} className="h-full bg-indigo-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-slate-400 font-mono text-xs ml-2">Agent Trace Shell : {decisionLogic === 'llm' ? 'LLM_DYNAMIC_JUDGMENT' : 'STATIC_RULE_ENGINE'}</span>
                                </div>

                                <div className="space-y-4 font-mono text-xs max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400">
                                       <span className="text-indigo-400">[SYSTEM]</span> {selectedModel} Container Standby...
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="text-slate-300">
                                       <span className="text-blue-400">[PLANNER]</span> {uploadedFiles.length > 0 ? 'Loading user contexts and mounting buffers.' : 'Skip raw load, switching to synthetic [240_records] mock view.'}
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="text-slate-300">
                                       <span className="text-emerald-400">[ACTION]</span> Dispatched tool-call: <span className="bg-slate-800 text-emerald-300 px-1 rounded">Data.Parser</span> ... Yield: Ok (240 Entities extracted)
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="text-slate-300">
                                       <span className="text-purple-400">[DECISION]</span> {decisionLogic === 'llm' ? 'Passing extracted states to LLM zero-shot evaluator' : 'Triggering configured code blocks'}
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }} className="text-rose-400 font-bold">
                                       <span className="text-rose-500">[WARNING]</span> Policy match (4 anomalies): Re-routing branch to Error-Reporting flow.
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.5 }} className="text-slate-300">
                                       <span className="text-amber-400">[SKILL: Clustering]</span> {uploadedFiles.some(f => f.type === 'log') ? 'Analyzing matched sub-clusters from provided log file.' : 'No log supplied. Evaluating implicit characteristics.'}
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 5.2 }} className="text-slate-300">
                                       <span className="text-slate-400">[SYSTEM]</span> Graph cycle finalized. Exit 0.
                                    </motion.div>
                                </div>
                                
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5 }} className="mt-8 flex justify-end">
                                    <button onClick={() => setSandboxPhase('result')} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                                        展示诊断报告
                                    </button>
                                </motion.div>
                           </div>
                       </div>
                   )}

                   {sandboxPhase === 'result' && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">沙盒测试流已执行完毕</h3>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">240 Processed</span>
                                        <span className="bg-rose-50 px-2 py-0.5 rounded text-rose-600 font-mono">4 Findings</span>
                                        <span>5.2s</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-slate-700">智能归属判别结果</h4>
                                <div className="bg-rose-50 border border-rose-100 rounded-lg p-5">
                                    <div className="text-sm font-medium text-rose-800 leading-relaxed space-y-3">
                                        <p>根据注入的数据切片，检测出 4 笔关键订单记录存在两端系统不一致的问题。</p>
                                        <p>
                                           <strong>根因大模型推论：</strong> 基于 {uploadedFiles.some(f => f.type === 'log') ? '上传补充的业务流日志' : '系统推断及默认回溯源'}判定，这批孤儿凭证的时间节点命中过几次微小的高偶发性事务短路错误。推测为：<span className="font-bold border-b border-rose-300">底层数据库提交事务期间突发的网关层抖动截断</span>。
                                        </p>
                                        <p>
                                           <strong>动作下发：</strong> 由于评估为技术级瞬态故障而非业务造假风险，建议自动下发工单至运维/研发队列进行回溯，而非阻断财务结账。
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-3">
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">流程生成物 (Artifacts)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 shrink-0 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                                            <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">业务缺陷推流工单.md</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">Payload Template</div>
                                            </div>
                                        </div>
                                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 shrink-0 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                                            <Code className="w-8 h-8 text-slate-600 shrink-0" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">Session Debug Trace</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">221 Lines Output JSON Dump</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                   )}
               </div>
            </div>
          )}
          </fieldset>
          </div>
          <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between gap-3 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                  向导步骤: <span className="text-blue-600">{currentStep} / {steps.length}</span>
               </div>
               {isEditing && (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 shadow-sm">
                     <Pencil className="w-4 h-4" /> 编辑模式
                  </div>
               )}
             </div>
             
             <div className="flex items-center gap-3">
                 {isEditing && <button onClick={() => setIsEditing(false)} className="px-5 py-2 hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-bold rounded-lg transition-colors bg-white shadow-sm">取消变更</button>}
                 
                 {currentStep > 1 && (
                   <button onClick={handlePrev} className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-bold rounded-lg shadow-sm">
                     <ArrowRight className="w-4 h-4 rotate-180 inline-block mr-1" /> 返回上一步
                   </button>
                 )}
                 {isLastStep ? (
                   isEditing ? (
                     <button onClick={() => { handleSave(); setIsEditing(false); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> 确定并保存设定
                     </button>
                   ) : (
                     <button onClick={onBack} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 transition-colors text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> 完成查阅
                     </button>
                   )
                 ) : (
                   <button onClick={handleNext} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2">
                     下一步 <ArrowRight className="w-4 h-4" />
                   </button>
                 )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

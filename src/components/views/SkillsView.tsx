import React, { useState } from "react";
import { 
  BarChart3, Brain, ChevronRight, ClipboardCheck, Database, FileText, Home, LayoutDashboard, Lock, MessageSquare, RefreshCcw, Search, Settings, ShieldCheck, Zap, Cpu, Bell, HardDrive, Users, Key, Shield, Plus, Check, Activity, ShieldAlert, Box, TerminalSquare, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, MessageSquareDot, Smartphone, Mail, Bot, Network, Braces, SlidersHorizontal, ToggleLeft, KeyRound, UsersRound, Wrench, AlignLeft, FolderLock, ToggleRight, Lightbulb, Palette, Settings2, ArrowRight, Server, Layers, Blocks, ArrowDown, PlayCircle, GitBranch, BrainCircuit, SearchCode, CheckCircle2, FileOutput, Info, AlertTriangle, UploadCloud, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/src/lib/utils";

export function SkillsView() {
  const [subTab, setSubTab] = useState<"general" | "scene">("scene");
  
  const [generalTools] = useState([
    { id: "T01", name: "PDF 发票解析器", type: "数据提取", desc: "从标准企业 PDF 发票中提取金额、税号与开票项目。" },
    { id: "T02", name: "Excel 多表合并核对", type: "数据处理", desc: "加载多个表单并根据主键执行差异交叉核对运算。" },
    { id: "T03", name: "汇率换算服务", type: "辅助计算", desc: "调用外部 API 实时获得多币种汇率快照。" },
    { id: "T04", name: "历史法务库检索", type: "信息检索", desc: "根据关键词查询历史法务案例与相关法规。" },
    { id: "T05", name: "数据库表结构及约束读取", type: "数据洞察", desc: "连接指定数据库获取DDL或约束条件以供诊断验证。" },
    { id: "T06", name: "SQL 只读沙箱执行器", type: "数据洞察", desc: "在只读沙箱权限下执行底层数据探索与取穿。" },
    { id: "T07", name: "异常数据聚类模型", type: "算法推理", desc: "基于无监督学习将特征向量聚集分类以发现异常模式簇。" }
  ]);

  const [sceneSkills, setSceneSkills] = useState([
    { id: "S01", name: "数据质检归因智能网络", type: "分析推理", desc: "自动探测表体情况，调用 SQL 沙箱和异常分析及归因提取。", tools: ["数据库表结构及约束读取", "SQL 只读沙箱执行器", "异常数据聚类模型"] },
    { id: "S02", name: "合同文本合规稽核", type: "法务合规", desc: "检索历史法务库，对比新合同条款是否带有潜在违约金等高风险条目。", tools: ["历史法务库检索"] },
    { id: "S03", name: "财务业财数据穿透网络", type: "分析推理", desc: "组合各类数据分析工具，跨中台与底层追踪账务不平与分录遗漏。", tools: ["PDF 发票解析器", "Excel 多表合并核对", "SQL 只读沙箱执行器"] },
  ]);

  const [managingToolsFor, setManagingToolsFor] = useState<string | null>(null);
  const [tempTools, setTempTools] = useState<string[]>([]);

  const handleOpenManager = (sceneId: string, currentTools: string[]) => {
    setManagingToolsFor(sceneId);
    setTempTools([...currentTools]);
  };

  const toggleTool = (toolName: string) => {
    setTempTools(prev => 
      prev.includes(toolName) 
        ? prev.filter(t => t !== toolName) 
        : [...prev, toolName]
    );
  };

  const saveTools = () => {
    setSceneSkills(prev => prev.map(s => s.id === managingToolsFor ? { ...s, tools: tempTools } : s));
    setManagingToolsFor(null);
  };

  const activeSceneInfo = managingToolsFor ? sceneSkills.find(s => s.id === managingToolsFor) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
      {/* Tools Management Modal */}
      {managingToolsFor && activeSceneInfo && (
        <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-center items-center p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-full">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h4 className="font-bold text-slate-800">管理关联工具</h4>
                <p className="text-xs text-slate-500 mt-1">正在配置：<span className="font-bold text-slate-700">{activeSceneInfo.name}</span></p>
              </div>
              <button onClick={() => setManagingToolsFor(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">可选通用工具库 (Tools)</label>
              <div className="space-y-3">
                {generalTools.map(tool => {
                  const isSelected = tempTools.includes(tool.name);
                  return (
                    <div 
                      key={tool.id} 
                      onClick={() => toggleTool(tool.name)}
                      className={cn("flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all", isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}
                    >
                      <div className={cn("mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors", isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-transparent")}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h5 className={cn("font-bold text-sm", isSelected ? "text-blue-900" : "text-slate-800")}>{tool.name}</h5>
                           <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest", isSelected ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-500 border border-slate-200")}>{tool.type}</span>
                        </div>
                        <p className={cn("text-xs mt-1", isSelected ? "text-blue-600/80" : "text-slate-500")}>{tool.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button onClick={() => setManagingToolsFor(null)} className="px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm py-2.5 rounded-lg transition-colors">取消</button>
              <button onClick={saveTools} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg shadow-sm transition-colors">保存更改</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            技能库与 Agent 编排
          </h3>
          <p className="text-xs text-slate-500 mt-1">管理通用文件解析、计算能力工具，及针对特定业务场景（财报、审计）挂载的专有技能。</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">创建新技能</button>
      </div>

      <div className="flex border-b border-slate-100 px-4 bg-white">
        <button 
          onClick={() => setSubTab('general')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'general' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <Box className="w-4 h-4" /> 通用工具技能 (Tools)
        </button>
        <button 
          onClick={() => setSubTab('scene')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'scene' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <TerminalSquare className="w-4 h-4" /> 场景 Agent 技能 (Skills)
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
        <div className="grid grid-cols-2 gap-4">
          {subTab === 'general' && generalTools.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-sm transition-shadow">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">{t.name}</h4>
                     <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border border-slate-200">{t.type}</span>
               </div>
            </div>
          ))}

          {subTab === 'scene' && sceneSkills.map(s => (
            <div key={s.id} className="bg-white border border-slate-200 p-5 rounded-xl hover:shadow-sm transition-shadow flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="font-bold text-slate-800">{s.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                     </div>
                     <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border border-blue-100">{s.type}</span>
                  </div>
                </div>
               <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">已关联通用工具 ({s.tools.length})</p>
                    <button onClick={() => handleOpenManager(s.id, s.tools)} className="text-[10px] font-bold text-blue-600 hover:underline hover:text-blue-700">管理关联工具</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {s.tools.map(tool => (
                        <span key={tool} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                           <Box className="w-3.5 h-3.5 text-slate-400" />
                           {tool}
                        </span>
                     ))}
                     {s.tools.length === 0 && (
                        <span className="text-xs text-slate-400 italic">暂无关联的通用工具</span>
                     )}
                     <button onClick={() => handleOpenManager(s.id, s.tools)} className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                        <Plus className="w-3 h-3" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

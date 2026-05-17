import React, { useState } from "react";
import { 
  BarChart3, Brain, ChevronRight, ClipboardCheck, Database, FileText, Home, LayoutDashboard, Lock, MessageSquare, RefreshCcw, Search, Settings, ShieldCheck, Zap, Cpu, Bell, HardDrive, Users, Key, Shield, Plus, Check, Activity, ShieldAlert, Box, TerminalSquare, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, MessageSquareDot, Smartphone, Mail, Bot, Network, Braces, SlidersHorizontal, ToggleLeft, KeyRound, UsersRound, Wrench, AlignLeft, FolderLock, ToggleRight, Lightbulb, Palette, Settings2, ArrowRight, Server, Layers, Blocks, ArrowDown, PlayCircle, GitBranch, BrainCircuit, SearchCode, CheckCircle2, FileOutput, Info, AlertTriangle, UploadCloud, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/src/lib/utils";

export function ModelsView() {
  const [subTab, setSubTab] = useState<"config" | "monitor" | "rules">("config");
  const [models, setModels] = useState([
    { id: "M01", name: "DeepSeek v4 Flash", provider: "DeepSeek", status: "运行中", latency: "42ms", tps: 156, load: 32, url: "https://api.deepseek.com/v4", token: "sk-********" },
    { id: "M02", name: "Qwen Max", provider: "Alibaba Cloud", status: "运行中", latency: "180ms", tps: 89, load: 76, url: "https://dashscope.aliyuncs.com/api/v1", token: "sk-********" },
  ]);
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModel, setNewModel] = useState({ name: "", provider: "DeepSeek", url: "", token: "" });

  const testConnection = async (id: string) => {
    setIsTesting(prev => ({ ...prev, [id]: true }));
    // Simulate network request testing API key and endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    setModels(prev => prev.map(m => {
       if (m.id === id) {
          return { ...m, status: Math.random() > 0.2 ? "运行中" : "异常" };
       }
       return m;
    }));
    setIsTesting(prev => ({ ...prev, [id]: false }));
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.url || !newModel.token) return;
    const id = "M" + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setModels(prev => [...prev, { ...newModel, id, status: "未测试", latency: "-", tps: 0, load: 0 }]);
    setShowAddModal(false);
    setNewModel({ name: "", provider: "DeepSeek", url: "", token: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
      {/* Add Model Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-center items-center p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">接入新模型引擎</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddModel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Model Name</label>
                <input type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm" placeholder="e.g. Claude 3.5 Sonnet" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Provider</label>
                <select value={newModel.provider} onChange={e => setNewModel({...newModel, provider: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm">
                  <option value="DeepSeek">DeepSeek API</option>
                  <option value="Alibaba Cloud">Alibaba Cloud (Dashscope)</option>
                  <option value="OpenAI">OpenAI Compatible (v1)</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Local">Local (Ollama/vLLM)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Base URL</label>
                <input type="url" value={newModel.url} onChange={e => setNewModel({...newModel, url: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm font-mono" placeholder="https://..." required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">API Token</label>
                <input type="password" value={newModel.token} onChange={e => setNewModel({...newModel, token: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm font-mono" placeholder="sk-..." required />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg shadow-sm transition-colors">保存配置</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm py-2.5 rounded-lg transition-colors">取消</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            模型与算力调度中心
          </h3>
          <p className="text-xs text-slate-500 mt-1">统管企业级大模型 API、本地私有化模型负载及调用监控。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">接入新模型</button>
        </div>
      </div>

      <div className="flex border-b border-slate-100 px-4 bg-white">
        <button 
          onClick={() => setSubTab('config')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'config' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <Key className="w-4 h-4" /> 供应商与引擎配置
        </button>
        <button 
          onClick={() => setSubTab('monitor')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'monitor' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <Activity className="w-4 h-4" /> 算力探针与大盘监控
        </button>
        <button 
          onClick={() => setSubTab('rules')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'rules' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <ShieldAlert className="w-4 h-4" /> 脱敏与内容安全清洗
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
        {subTab === 'config' && (
          <div className="grid grid-cols-2 gap-6">
            {models.map(m => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -translate-y-1/2 translate-x-1/2", m.status === '运行中' ? "bg-blue-600" : m.status === '异常' ? "bg-rose-500" : m.status === '闲置' ? "bg-amber-500" : "bg-slate-400")} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", m.provider === 'DeepSeek' ? "bg-blue-50 border-blue-200 text-blue-600" : m.provider === 'Alibaba Cloud' ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-500")}>
                      {m.provider === 'DeepSeek' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-blue-200" />
                             <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"/>
                             <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"/>
                          </svg>
                      ) : m.provider === 'Alibaba Cloud' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-indigo-300" />
                             <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-600" />
                          </svg>
                      ) : (
                          <Cpu className={cn("w-5 h-5", m.status === '运行中' ? "text-blue-600" : m.status === '异常' ? "text-rose-500" : "text-slate-400")} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{m.name}</h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">{m.provider}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase flex items-center gap-1.5", m.status === '运行中' ? "bg-blue-50 text-blue-600 border border-blue-100" : m.status === '异常' ? "bg-rose-50 text-rose-600 border border-rose-100" : m.status === '闲置' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500 border border-slate-200")}>
                    {m.status === '异常' && <ShieldAlert className="w-3 h-3" />}
                    {m.status}
                  </span>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium tracking-wide">Base URL</span>
                    <span className="font-mono text-slate-700 select-all truncate max-w-[180px]">{m.url}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium tracking-wide">API Token</span>
                    <span className="font-mono text-slate-400 group-hover:text-slate-700 transition-colors">{m.token.replace(/(?<=.{3}).*(?=.{3})/, '****')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-slate-500 font-medium tracking-wide">Max Tokens</span>
                    <span className="font-bold text-slate-700">128,000</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 relative z-10">
                  <button onClick={() => testConnection(m.id)} disabled={isTesting[m.id]} className="flex-1 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-bold text-xs py-2 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2">
                    {isTesting[m.id] && <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />}
                    {isTesting[m.id] ? "连通测试中..." : "测试连通性"}
                  </button>
                  <button className="px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 rounded-lg border border-slate-200 transition-colors shrink-0">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'monitor' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">24H 令牌消耗量</p>
                 <p className="text-2xl font-bold font-mono text-slate-800">4.2<span className="text-sm text-slate-500 ml-1">M</span></p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">平均推理延迟</p>
                 <p className="text-2xl font-bold font-mono text-blue-600">240<span className="text-sm text-blue-400 ml-1">ms</span></p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">峰值 TPS</p>
                 <p className="text-2xl font-bold font-mono text-slate-800">134</p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">风控拦截次数</p>
                 <p className="text-2xl font-bold font-mono text-rose-600">89</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
               <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-700">实时请求流</h4>
               </div>
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Trace ID</th>
                      <th className="px-6 py-3">发起方应用</th>
                      <th className="px-6 py-3">选用模型</th>
                      <th className="px-6 py-3 text-right">消耗 Tokens</th>
                      <th className="px-6 py-3 text-right">耗时</th>
                      <th className="px-6 py-3 text-center">状态</th>
                    </tr>
                 </thead>
                 <tbody className="text-xs divide-y divide-slate-50 font-mono">
                    {[
                      { id: "req-8f92a1", app: "财务对账 Agent", model: "DeepSeek v4", tokens: 1024, time: "42ms", status: "OK" },
                      { id: "req-3b4c90", app: "内审合规助手", model: "Qwen Max", tokens: 8590, time: "890ms", status: "OK" },
                      { id: "req-1a2f65", app: "收入确认 Agent", model: "DeepSeek v4", tokens: 512, time: "38ms", status: "OK" },
                      { id: "req-7e8d21", app: "财报分析大图", model: "Qwen Max", tokens: 0, time: "18ms", status: "BLOCKED" },
                    ].map(r => (
                      <tr key={r.id}>
                         <td className="px-6 py-3 border-r border-slate-50 text-slate-500">{r.id}</td>
                         <td className="px-6 py-3 border-r border-slate-50 font-sans font-medium text-slate-700">{r.app}</td>
                         <td className="px-6 py-3 border-r border-slate-50 text-slate-600">{r.model}</td>
                         <td className="px-6 py-3 border-r border-slate-50 text-right text-slate-600">{r.tokens}</td>
                         <td className="px-6 py-3 border-r border-slate-50 text-right text-slate-600">{r.time}</td>
                         <td className="px-6 py-3 text-center">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold font-sans", r.status === "OK" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>{r.status}</span>
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {subTab === 'rules' && (
           <div className="flex items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
             <div className="text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">企业级数据脱敏与前置探卫</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[320px] leading-relaxed mx-auto">设置正则表达式或 NLP 模型探测敏感词，在所有 API 交互发出前进行自动遮盖替换。防止如 PII、商业机密直接流入公有云端大模型。</p>
                <button className="mt-6 px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg shadow hover:bg-slate-700">添加脱敏规则</button>
             </div>
           </div>
        )}
      </div>
    </motion.div>
  );
}

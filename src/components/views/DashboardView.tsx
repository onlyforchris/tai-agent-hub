import React, { useState } from "react";
import { 
  BarChart3, Brain, ChevronRight, ClipboardCheck, Database, FileText, Home, LayoutDashboard, Lock, MessageSquare, RefreshCcw, Search, Settings, ShieldCheck, Zap, Cpu, Bell, HardDrive, Users, Key, Shield, Plus, Check, Activity, ShieldAlert, Box, TerminalSquare, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, MessageSquareDot, Smartphone, Mail, Bot, Network, Braces, SlidersHorizontal, ToggleLeft, KeyRound, UsersRound, Wrench, AlignLeft, FolderLock, ToggleRight, Lightbulb, Palette, Settings2, ArrowRight, Server, Layers, Blocks, ArrowDown, PlayCircle, GitBranch, BrainCircuit, SearchCode, CheckCircle2, FileOutput, Info, AlertTriangle, UploadCloud, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/src/lib/utils";

export function DashboardView() {
  const trendData = [
    { name: "Mon", tasks: 400, tokens: 2400 },
    { name: "Tue", tasks: 600, tokens: 3200 },
    { name: "Wed", tasks: 550, tokens: 2900 },
    { name: "Thu", tasks: 800, tokens: 4100 },
    { name: "Fri", tasks: 950, tokens: 5300 },
    { name: "Sat", tasks: 400, tokens: 1800 },
    { name: "Sun", tasks: 300, tokens: 1200 },
  ];

  const agentData = [
    { name: "对账治理分析", success: 85, error: 5 },
    { name: "财报解读", success: 42, error: 2 },
    { name: "智能客服", success: 120, error: 10 },
    { name: "审批路由", success: 65, error: 1 },
  ];

  const anomalyData = [
    { name: "金额不一致", value: 400, color: "#ef4444" },
    { name: "缺漏凭证", value: 300, color: "#f59e0b" },
    { name: "系统超时", value: 150, color: "#64748b" },
    { name: "权限拒绝", value: 100, color: "#8b5cf6" },
  ];

  return (
    <div className="h-full flex flex-col p-8 gap-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">全景数字化大盘</h2>
          <p className="text-sm text-slate-500 mt-1">纵览 Agent 中台各项健康度指标、任务吞吐与模型用量。</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2">
             <Activity className="w-4 h-4 text-emerald-500" />
             系统运转良好
           </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Workflow className="w-4 h-4 text-blue-500" /> 总调度任务</div>
           <div className="text-3xl font-bold text-slate-800">14,230</div>
           <div className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded">+12.5% 较上周</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-500" /> API Token 消耗</div>
           <div className="text-3xl font-bold text-slate-800">4.2M</div>
           <div className="text-xs text-rose-600 font-bold mt-2 bg-rose-50 inline-block px-2 py-0.5 rounded">+5.2% 较上周</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-amber-500" /> 平均响应延迟</div>
           <div className="text-3xl font-bold text-slate-800">320<span className="text-lg text-slate-500 ml-1">ms</span></div>
           <div className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 inline-block px-2 py-0.5 rounded">-10ms 优化</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-500" /> 异常拦截率</div>
           <div className="text-3xl font-bold text-slate-800">99.8%</div>
           <div className="text-xs text-slate-500 font-bold mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded">持平</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 min-h-[350px]">
        {/* Token Usage Trend */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">7 天任务与 Token 消耗趋势</h3>
            <p className="text-xs text-slate-500 mt-1">展示每日处理任务数及消耗的推理算力</p>
          </div>
          <div className="flex-1 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" name="Token数(k)" />
                <Area yAxisId="right" type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" name="任务数" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
            {/* Agent Performance */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col flex-1 min-h-0">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-base">各 Agent 吞吐与异常</h3>
                </div>
                <div className="flex-1 -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={80} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      <Bar dataKey="success" stackId="a" fill="#10b981" name="成功" radius={[0, 0, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="error" stackId="a" fill="#f43f5e" name="异常/失败" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Anomalies Distribution */}
             <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center h-48 shrink-0">
                <div className="flex-1 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={anomalyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {anomalyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3 pr-4">
                    <h3 className="font-bold text-slate-800 text-sm mb-1 border-b border-slate-100 pb-2">常见异常类型分布</h3>
                    {anomalyData.map(d => (
                        <div key={d.name} className="flex justify-between items-center text-xs">
                           <div className="flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                               <span className="text-slate-600">{d.name}</span>
                           </div>
                           <span className="font-bold text-slate-800">{d.value}</span>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

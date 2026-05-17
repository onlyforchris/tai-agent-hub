import React, { useState } from "react";
import { 
  Database, HardDrive, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, 
  TerminalSquare, UploadCloud, PlayCircle, CheckCircle2, FileText, Code, CheckCircle, Smartphone, Box, ShieldAlert, Cpu, Server, Table, Brain, 
  X, ChevronLeft, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface TaskImportProcessProps {
  onClose: () => void;
  onComplete: () => void;
}

export function TaskImportProcess({ onClose, onComplete }: TaskImportProcessProps) {
  const [sandboxPhase, setSandboxPhase] = useState<'upload' | 'running' | 'result'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, type: string}[]>([]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-6xl h-[90vh] bg-slate-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            多维单据导入与智能归因分析
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">闭环演示：模拟完整的多域数据采集、交叉比对及根因推断</p>
                    </div>
                </div>
                
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-sm w-96">
                   {['upload', 'running', 'result'].map((step, i) => {
                       const isActive = sandboxPhase === step;
                       const labels = { upload: "1. 挂载数据", running: "2. Agent 执行", result: "3. 归因推演" };
                       const stepState = ['upload', 'running', 'result'];
                       const isPast = stepState.indexOf(sandboxPhase) > i;
                       return (
                           <div key={step} className={cn("flex-1 text-center py-1.5 text-[10px] font-bold rounded flex items-center justify-center gap-1.5 transition-colors", isActive ? "bg-white text-blue-600 shadow-sm" : isPast ? "text-emerald-500" : "text-slate-400")}>
                               {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : <span className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center border", isActive ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400")}>{i + 1}</span>}
                               {labels[step as keyof typeof labels]}
                           </div>
                       )
                   })}
               </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8 relative">
               <div className="max-w-5xl mx-auto pb-24">
               {sandboxPhase === 'upload' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                       <div className="space-y-2">
                           <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                               <Database className="w-5 h-5 text-blue-600" />
                               第一步：配置多维业务与财务数据源 (必填至少一项)
                           </h3>
                           <p className="text-sm text-slate-500">为触发核对引擎的高维推演，请导入各异构系统的历史台账或流水快照。支持的源系统维度越多，模型消除假阳性的准度越高。</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[{
                               id: 'pos', title: '门店零售端流水 (POS/CRM)', desc: '导入终端收银结算的底层流水快照', icon: Smartphone
                           }, {
                               id: 'dms', title: '经销存中台业务账 (DMS/OMS)', desc: '导入中台业务聚合后的订单台账', icon: Box
                           }, {
                               id: 'sap', title: '财务底座凭证与确认单 (SAP)', desc: '导入 ERP 最核心的凭证与结转确认单', icon: Database
                           }].map((source) => {
                               const Icon = source.icon;
                               const isUploaded = uploadedFiles.some(f => f.type === source.id);
                               const file = uploadedFiles.find(f => f.type === source.id);
                               return (
                                   <div key={source.id} className={cn("border rounded-xl p-6 transition-all text-left", isUploaded ? "border-blue-300 bg-blue-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm")}>
                                       <div className="flex items-start justify-between mb-4">
                                            <div className="flex flex-col gap-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", isUploaded ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500")}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-[15px]">{source.title}</h4>
                                            </div>
                                       </div>
                                       <p className="text-xs text-slate-500 mb-6 min-h-[32px] leading-relaxed">{source.desc}</p>
                                       
                                       <div 
                                         onClick={() => setUploadedFiles(prev => isUploaded ? prev.filter(f => f.type !== source.id) : [...prev, {name: `export_${source.id}_audit_2024.csv`, size: (Math.random()*4+1).toFixed(1)+'MB', type: source.id} as any])}
                                         className={cn("border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all", isUploaded ? "border-blue-300 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 group" : "border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300")}
                                       >
                                            {isUploaded ? (
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-sm font-bold text-slate-700">{file?.name}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded group-hover:hidden">已挂载就绪</span>
                                                    <div className="hidden group-hover:flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-white rounded">
                                                       <X className="w-3 h-3 text-rose-500" />
                                                       取消挂载
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-2">
                                                    <UploadCloud className="w-6 h-6" />
                                                    <span className="text-xs font-bold text-slate-600">点击此处选择导出文件</span>
                                                    <span className="text-[10px]">支持 .xlsx, .csv 结构化表单</span>
                                                </div>
                                            )}
                                       </div>
                                   </div>
                               );
                           })}
                       </div>

                       <div className="space-y-4 pt-8 border-t border-slate-200">
                           <div className="flex items-center justify-between">
                               <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                   <TerminalSquare className="w-5 h-5 text-slate-600" />
                                   第二步：附加系统环境日志 (可选补充，强烈推荐)
                               </h3>
                               <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded flex items-center gap-1.5"><Server className="w-3.5 h-3.5"/> 提升故障根因诊断精度</div>
                           </div>
                           <p className="text-sm text-slate-500 max-w-3xl">当 Agent 的数据模块检测到订单断层或差额时，往往难以区分是“业务飞单/恶意篡改”还是“IT 底层事务失败”。此时若能提供对应时间段的服务器与中间件日志，Agent 即可结合架构上下文推演是否由应用异常引发财账不平。</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[{
                               id: 'fr', title: '资金汇总归档表 (人工补充)', desc: '帆软、BI 结账月报表等第三方手工介入文件。如果业务经常依赖该台账则可以上传比对 (.xlsx)', icon: Table
                           }, {
                               id: 'log', title: '应用网关日志 / Traces', desc: '微服务网关 (Kong/Nginx) 或 API Gateway、K8s Node 吐出的错误捕获日志快照 (.json/.log)', icon: Server
                           }].map((source) => {
                               const Icon = source.icon;
                               const isUploaded = uploadedFiles.some(f => f.type === source.id);
                               const file = uploadedFiles.find(f => f.type === source.id);
                               return (
                                   <div key={source.id} className={cn("border rounded-xl p-5 transition-all", isUploaded ? "border-slate-400 bg-slate-100 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300")}>
                                       <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-bold text-slate-800">{source.title}</h4>
                                            </div>
                                       </div>
                                       <p className="text-xs text-slate-500 mb-5 pl-13 min-h-[32px]">{source.desc}</p>
                                       <div 
                                         onClick={() => setUploadedFiles(prev => isUploaded ? prev.filter(f => f.type !== source.id) : [...prev, {name: source.id === 'log' ? `k8s-pod-trace-dump.log` : 'bi_summary_jan_2024.xlsx', size: '20.4MB', type: source.id} as any])}
                                         className={cn("border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all mt-2", isUploaded ? "border-slate-300 bg-white hover:bg-slate-200" : "border-slate-200 bg-slate-50 hover:bg-slate-100")}
                                       >
                                            {isUploaded ? (
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-sm font-bold text-slate-700">{file?.name}</span>
                                                    <span className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors">取消选择</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-slate-500 py-1">
                                                    <UploadCloud className="w-5 h-5" />
                                                    <span className="text-sm font-bold">载入辅助证明材料</span>
                                                </div>
                                            )}
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                       
                       <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex justify-center z-20">
                           <button 
                              onClick={() => setSandboxPhase('running')}
                              className="bg-blue-600 text-white px-10 py-4 rounded-xl text-base font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 w-content"
                           >
                               <PlayCircle className="w-6 h-6" /> 
                               {uploadedFiles.length === 0 ? "未挂载数据：使用预置双盲测试数据集启动演示" : `已挂载 ${uploadedFiles.length} 项异构文件源，立即驱动 AI 分析`}
                           </button>
                       </div>
                   </motion.div>
               )}

               {sandboxPhase === 'running' && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 max-w-4xl mx-auto pt-6">
                       <div className="bg-[#0f172a] rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-slate-700">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                               <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 7 }} className="h-full bg-blue-500" />
                            </div>
                            <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-slate-400 font-mono text-sm font-medium tracking-wide">Multi-Agent Verification Workflow</span>
                                </div>
                                <div className="animate-pulse bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded tracking-widest">EXECUTING...</div>
                            </div>

                            <div className="space-y-6 font-mono text-[13px] max-h-[500px] overflow-y-auto pr-2 no-scrollbar pb-8">
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 flex gap-3">
                                   <span className="text-blue-400 whitespace-nowrap">[SYSTEM]</span> <span>DeepSeek-R1 模型容器唤醒... LangChain 图执行器初始化完成。</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="text-slate-400 flex gap-3">
                                   <span className="text-blue-400 whitespace-nowrap">[DATAPIPE]</span> <span>{uploadedFiles.length > 0 ? `拉取用户已挂载的数据集，启动 ETL 并行清洗管道 (Targets: ${uploadedFiles.map(f=>f.type).join(', ')})` : '挂载为空。激活内置测试用例 [Dataset_Sim_Order_240]'}</span>
                                </motion.div>
                                {uploadedFiles.some(f => f.type === 'pos') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="text-slate-300 flex gap-3">
                                       <span className="text-purple-400 whitespace-nowrap">[TOOL: CSVParser]</span> <span>执行工具 {">>"} POS 终端零售流水载入完毕。成功结构化提取 <span className="text-emerald-400 bg-emerald-400/10 px-1">18,940</span> Entities</span>
                                    </motion.div>
                                )}
                                {uploadedFiles.some(f => f.type === 'dms') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.0 }} className="text-slate-300 flex gap-3">
                                       <span className="text-purple-400 whitespace-nowrap">[TOOL: ExcelParser]</span> <span>执行工具 {">>"} DMS 中台业务快照映射完毕。有效明细 <span className="text-emerald-400 bg-emerald-400/10 px-1">18,940</span> Entities</span>
                                    </motion.div>
                                )}
                                {uploadedFiles.some(f => f.type === 'sap') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} className="text-slate-300 flex gap-3">
                                       <span className="text-purple-400 whitespace-nowrap">[TOOL: CSVParser]</span> <span>执行工具 {">>"} SAP 财务底座层对账单读取完毕。可用确认凭单 <span className="text-rose-400 bg-rose-400/10 px-1 font-bold">18,936</span> Entities</span>
                                    </motion.div>
                                )}
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.2 }} className="text-slate-300 flex gap-3">
                                   <span className="text-amber-400 whitespace-nowrap">[CROSS-CHECK]</span> <span>调用内部关联引擎 <span className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">Diff_Engine</span> 执行三方关联约束检查...</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 4.2 }} className="text-rose-400 font-bold border-l-2 border-rose-500 pl-4 py-2 bg-rose-500/10 rounded-r flex gap-3">
                                   <span className="text-rose-500 whitespace-nowrap">[ANOMALY_DETECT]</span> <span>触发规则拦截！发现 4 笔关键订单状态产生断代现象 (POS、DMS 账实相符，但 SAP 未下落数据)。立刻拉单转交大语言模型深挖！</span>
                                </motion.div>

                                {uploadedFiles.some(f => f.type === 'log') ? (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 5.0 }} className="text-slate-300 flex gap-3">
                                       <span className="text-cyan-400 whitespace-nowrap">[TOOL: LogTrace]</span> <span>大模型自主调用辅助证据提取... 在上传的 K8s 日志中针对这 4 笔异常订单的时间窗附近(22:15:00) 执行 Regex 搜索。发现关键特征：<span className="text-rose-300 bg-slate-800 px-1 font-normal">Message=MySQL lock timeout, Rollback...</span></span>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 5.0 }} className="text-slate-300 flex gap-3">
                                       <span className="text-amber-400 whitespace-nowrap">[REASONING]</span> <span>用户未提供 IT 基础日志，分析陷入纯业务层考量。模型利用隐式经验判断：“通常此类高度聚集(发生在同1秒内)但又随机分散的孤单是因高并发架构的异步丢包或数据库死锁回滚产生”。</span>
                                    </motion.div>
                                )}

                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 6.0 }} className="text-emerald-400 leading-relaxed font-bold bg-emerald-500/10 p-3 rounded flex gap-3">
                                   <span className="text-emerald-500 whitespace-nowrap">[LLM_VERDICT]</span> <span>综合判断下达: "该批次对账不平现象的技术特征(瞬发性、截断式)远大于业务造假及飞单特征。确认为【架构短时抖动引发的提交丢包】。"</span>
                                </motion.div>
                                
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 7.2 }} className="text-slate-400 flex gap-3">
                                   <span className="text-blue-400 whitespace-nowrap">[SYSTEM]</span> <span>工作流安全终止。将分析上下文组织后推向展示前端... (Code: 200_SUCCESS)</span>
                                </motion.div>
                            </div>
                            
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.5 }} className="mt-6 flex justify-end border-t border-slate-800 pt-6">
                                <button 
                                  onClick={() => setSandboxPhase('result')} 
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" /> 生成可视化报告 (结论呈现)
                                </button>
                            </motion.div>
                       </div>
                   </motion.div>
               )}

               {sandboxPhase === 'result' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-xl p-10 max-w-5xl mx-auto mb-10 pt-8 mt-6">
                        <div className="flex items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">智能闭环归因大屏已更新摘要结论</h3>
                                    <div className="text-sm text-slate-500 flex items-center gap-4">
                                        <span className="bg-slate-100 px-3 py-1 rounded-md text-slate-700 font-mono font-bold flex items-center gap-2"><Database className="w-4 h-4 text-slate-400"/> 18,940 Records Processed</span>
                                        <span className="bg-rose-50 border border-rose-200 px-3 py-1 rounded-md text-rose-700 font-mono font-bold">4 Blocked Trades</span>
                                        <span className="flex items-center gap-2"><Cpu className="w-4 h-4"/> DeepSeek-R1 CoT</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onComplete} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors">
                                   采纳建议并提交异常池
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-8 space-y-8">
                                <div>
                                    <h4 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-blue-600" />
                                        核心风险评定与根因模型投射
                                    </h4>
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                        <div className="text-[15px] text-slate-700 leading-8 space-y-4">
                                            <p>数据关联管道顺利将多套异构数据系统挂钩比对，从 <span className="font-bold">近 2 万笔</span> 正常生命周期的水单中，安全检出并拦截了 <strong>4</strong> 笔订单金额、状态在财务核算底座产生脱节的异常流水。</p>
                                            
                                            <div className="my-5 bg-white border-l-4 border-rose-500 p-5 rounded-r shadow-sm">
                                               <strong className="text-slate-800 block mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-500" />技术型根因诊断判决：</strong> 
                                               基于大模型的多模态推演，并结合{uploadedFiles.some(f => f.type === 'log') ? '上送提供的应用报错日志进行 Regex 碰撞强相关特征' : '模型内部的通用高并发时序模式判断逻辑'}得出结论：<br/>
                                               由于并发压力的峰值抖动触发了微服务组件层 <span className="bg-rose-100 text-rose-800 px-1 font-bold font-mono">Rollback Transaction</span>，这 4 笔孤单是被动的服务器提交阶段截断导致的。<span className="text-emerald-600 font-bold">非人为洗单、金额篡改等业务级别财务造假风险。</span>
                                            </div>
                                            
                                            <p className="text-sm bg-slate-100 px-4 py-3 rounded-lg border border-slate-200">
                                               <strong>处置与流转建议：</strong> 避免干扰财务的月结工作流。判定风险极低。该事件的上下文已自动生成，并建议直接一键派发 IT 支持或由 RPA 发起异步重推补单。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-4 space-y-6">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-4 uppercase tracking-wider">系统调度挂载产物库 (Artifacts)</h4>
                                    <div className="flex flex-col gap-4">
                                        <div className="border border-slate-200 rounded-xl p-4 bg-white shrink-0 flex items-start gap-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                                            <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform"><FileText className="w-7 h-7 text-blue-600 shrink-0" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 mb-1">推单流转审批件.md</div>
                                                <div className="text-xs text-slate-500">发送至钉钉/飞书的完整文稿 (自动撰写并附加错误回溯码)</div>
                                            </div>
                                        </div>
                                        <div className="border border-slate-200 rounded-xl p-4 bg-white shrink-0 flex items-start gap-4 cursor-pointer hover:border-slate-400 hover:shadow-md transition-all group">
                                            <div className="p-2 bg-slate-100 rounded-lg group-hover:scale-110 transition-transform"><Code className="w-7 h-7 text-slate-700 shrink-0" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 mb-1">Session_Graph_Trace.json</div>
                                                <div className="text-xs text-slate-500">229 节点深度执行追踪调试日志集</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}

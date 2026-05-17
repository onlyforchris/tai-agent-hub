import React, { useState } from "react";
import { 
  Database, HardDrive, Waypoints, FileUp, Workflow, Webhook, FileSpreadsheet, Download, 
  TerminalSquare, UploadCloud, PlayCircle, CheckCircle2, FileText, Code, CheckCircle, Smartphone, Box, ShieldAlert, Cpu, Server, Table
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function DataView() {
  const [subTab, setSubTab] = useState<"api" | "file">("api");
  const [sandboxPhase, setSandboxPhase] = useState<'upload' | 'running' | 'result'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string, type: 'data'|'log'}[]>([]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
       <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
             <HardDrive className="w-4 h-4 text-blue-600" />
             数据集成与分发治理
          </h3>
          <p className="text-xs text-slate-500 mt-1">控制业务数据流入流出的“血脉”，打通孤岛系统，执行闭环操作。</p>
        </div>
      </div>

       <div className="flex border-b border-slate-100 px-4 bg-white">
        <button 
          onClick={() => setSubTab('api')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'api' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <Waypoints className="w-4 h-4" /> API / ETL 连接器
        </button>
        <button 
          onClick={() => setSubTab('file')} 
          className={cn("px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2", subTab === 'file' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}
        >
          <FileUp className="w-4 h-4" /> 导入单据分析 (Agent 闭环演示)
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
        {subTab === 'api' && (
           <div className="space-y-6">
             <div className="bg-slate-900 text-slate-100 p-6 rounded-xl relative overflow-hidden flex justify-between items-center shadow-lg">
                <div className="relative z-10 w-2/3">
                  <h4 className="font-bold text-lg">系统级自动化闭环</h4>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">通过配置定时 ETL 或 Webhook 接收下游管易、SAP 等系统的交易流水。数据落库后将自动触发分析 Agent 识别比对，无需人工干预。</p>
                </div>
                <div className="relative z-10">
                  <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-transform hover:scale-105">配置系统级数据源集成</button>
                </div>
                <Workflow className="w-32 h-32 absolute -right-4 -bottom-8 text-white opacity-10" />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border text-left border-slate-200 p-5 rounded-xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Database className="w-6 h-6" /></div>
                  <div>
                    <h5 className="font-bold text-slate-800">SAP 财务总账同步 ETL</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">mysql-read-replica.fotile.lan:3306</p>
                    <div className="mt-2 text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded inline-block">每小时同步一次</div>
                  </div>
                </div>
                <div className="bg-white border text-left border-slate-200 p-5 rounded-xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Webhook className="w-6 h-6" /></div>
                  <div>
                    <h5 className="font-bold text-slate-800">管易云订单回调 Webhook</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">/api/v1/gy/order_callback</p>
                    <div className="mt-2 text-[10px] font-bold tracking-widest uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded inline-block">实时流式接入</div>
                  </div>
                </div>
             </div>
           </div>
        )}

        {subTab === 'file' && (
           <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
               <div className="flex items-center justify-between mb-2">
                   <div>
                       <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           单据质检与智能归因
                       </h2>
                       <p className="text-sm text-slate-500 mt-1">人工上传散口数据或日志文件，触发 Agent 执行最小 MVP 数据比对与根因排查闭环。</p>
                   </div>
                   {sandboxPhase !== 'upload' && (
                       <button onClick={() => {setSandboxPhase('upload'); setUploadedFiles([]);}} className="text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded transition-colors shadow-sm">
                           返回并重新上传
                       </button>
                   )}
               </div>

               <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm mb-6 max-w-2xl mx-auto">
                   {['upload', 'running', 'result'].map((step, i) => {
                       const isActive = sandboxPhase === step;
                       const labels = { upload: "1. 准备并导入数据", running: "2. Agent 执行与调度", result: "3. 生成归因报表" };
                       const stepState = ['upload', 'running', 'result'];
                       const isPast = stepState.indexOf(sandboxPhase) > i;
                       return (
                           <div key={step} className={cn("flex-1 text-center py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors", isActive ? "bg-blue-50 text-blue-600" : isPast ? "text-emerald-500" : "text-slate-400")}>
                               {isPast ? <CheckCircle className="w-4 h-4" /> : <span className={cn("w-4 h-4 rounded-full flex items-center justify-center border text-[10px]", isActive ? "border-blue-600 text-blue-600" : "border-slate-300 text-slate-400")}>{i + 1}</span>}
                               {labels[step as keyof typeof labels]}
                           </div>
                       )
                   })}
               </div>

               {sandboxPhase === 'upload' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                       
                       <div className="mb-4 space-y-2">
                           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                               <Database className="w-4 h-4 text-blue-600" />
                               第一步：多维业务与财务数据源采集 (支持多选项)
                           </h3>
                           <p className="text-xs text-slate-500">为触发核对，您需要导入不同流水线的源数据快照。提供的核对维度越广，产生假阳性数据的几率越低。</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {[{
                               id: 'pos', title: '门店零售端 (POS/CRM)', desc: '导入门店终端的流水表', icon: Smartphone
                           }, {
                               id: 'dms', title: '经销存中台业务层 (DMS)', desc: '导入中台业务订单对账单', icon: Box
                           }, {
                               id: 'sap', title: '财务与 ERP 底座层 (SAP)', desc: '导入核心凭证与资金确认单', icon: Database
                           }].map((source) => {
                               const Icon = source.icon;
                               const isUploaded = uploadedFiles.some(f => f.type === source.id);
                               const file = uploadedFiles.find(f => f.type === source.id);
                               return (
                                   <div key={source.id} className={cn("border rounded-xl p-5 transition-all text-left", isUploaded ? "border-blue-300 bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300")}>
                                       <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isUploaded ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-slate-700 text-sm">{source.title}</h4>
                                            </div>
                                       </div>
                                       <p className="text-xs text-slate-500 mb-4 min-h-[32px]">{source.desc}</p>
                                       
                                       <div 
                                         onClick={() => setUploadedFiles(prev => isUploaded ? prev.filter(f => f.type !== source.id) : [...prev, {name: `export_${source.id}_2024.csv`, size: '2.1MB', type: source.id as any}])}
                                         className={cn("border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all", isUploaded ? "border-blue-300 bg-blue-50 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 group" : "border-slate-300 bg-slate-50 hover:bg-slate-100")}
                                       >
                                            {isUploaded ? (
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-xs font-medium text-slate-700">{file?.name}</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 group-hover:hidden">已挂载</span>
                                                    <X className="w-3 h-3 text-rose-500 hidden group-hover:block" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                                    <UploadCloud className="w-4 h-4" />
                                                    <span className="text-xs font-bold">点击上传配置</span>
                                                </div>
                                            )}
                                       </div>
                                   </div>
                               );
                           })}
                       </div>

                       <div className="mb-4 space-y-2 pt-6 border-t border-slate-100">
                           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                               <TerminalSquare className="w-4 h-4 text-slate-600" />
                               第二步：差异归因辅助依据 (可选)
                           </h3>
                           <p className="text-xs text-slate-500">补充系统层面的汇总报表或发生差异时间点附近的服务器应用程序/网关报错日志。这些日志将辅助大语言模型从业务与架构结合的角度分析异常根因。</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[{
                               id: 'fr', title: '资金汇总归档表', desc: '帆软、BI 或其他手工台账报表 (.xlsx)', icon: Table
                           }, {
                               id: 'log', title: '应用与网关日志提取', desc: '节点监控快照、K8s Node 或 API Log (.json)', icon: Server
                           }].map((source) => {
                               const Icon = source.icon;
                               const isUploaded = uploadedFiles.some(f => f.type === source.id);
                               const file = uploadedFiles.find(f => f.type === source.id);
                               return (
                                   <div key={source.id} className={cn("border rounded-xl p-5 transition-all", isUploaded ? "border-slate-300 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-300")}>
                                       <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-slate-700 text-sm">{source.title}</h4>
                                            </div>
                                       </div>
                                       <p className="text-xs text-slate-500 mb-4">{source.desc}</p>
                                       <div 
                                         onClick={() => setUploadedFiles(prev => isUploaded ? prev.filter(f => f.type !== source.id) : [...prev, {name: `sys_${source.id}_trace.log`, size: '840KB', type: source.id as any}])}
                                         className={cn("border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all", isUploaded ? "border-slate-300 bg-slate-200 hover:bg-slate-300" : "border-slate-300 bg-slate-50 hover:bg-slate-100")}
                                       >
                                            {isUploaded ? (
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-xs font-medium text-slate-700">{file?.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 hover:text-rose-600 transition-colors">点击撤销</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                                    <UploadCloud className="w-4 h-4" />
                                                    <span className="text-xs font-bold">载入辅助日志文件</span>
                                                </div>
                                            )}
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                       
                       <div className="flex justify-center pt-8">
                           <button 
                              onClick={() => setSandboxPhase('running')}
                              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group w-full max-w-lg justify-center"
                           >
                               <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                               {uploadedFiles.length === 0 ? "未挂载数据，直接使用系统内置沙盒启动" : `已挂载 ${uploadedFiles.length} 项多维数据矩阵，启动 AI 归因排查`}
                           </button>
                       </div>
                   </motion.div>
               )}

               {sandboxPhase === 'running' && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 max-w-4xl mx-auto">
                       <div className="bg-slate-900 rounded-xl p-8 shadow-2xl relative overflow-hidden border border-slate-700">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                               <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 7 }} className="h-full bg-blue-500" />
                            </div>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-slate-400 font-mono text-xs font-medium tracking-wide">Multi-Agent Verification Workflow</span>
                                </div>
                                <div className="animate-pulse bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded">PROCESSING...</div>
                            </div>

                            <div className="space-y-5 font-mono text-xs max-h-[400px] overflow-y-auto pr-2 no-scrollbar pb-8">
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-slate-400">
                                   <span className="text-blue-400">[SYSTEM]</span> DeepSeek-R1 模型容器唤醒... 连接建立中。
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="text-slate-300">
                                   <span className="text-blue-400">[DATALOADER]</span> {uploadedFiles.length > 0 ? `检测到多维数据挂载，正在启动 ETL 规整任务 (Sources: ${uploadedFiles.map(f=>f.type).join(', ')})` : '未检测到用户上传，加载合成 Mock 业务数据流 [240_records]'}
                                </motion.div>
                                {uploadedFiles.some(f => f.type === 'pos') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="text-slate-300">
                                       <span className="text-purple-400">[TOOL: Parser]</span> 门店前端流水表载入完毕: <span className="text-emerald-400">18,940</span> Entities 
                                    </motion.div>
                                )}
                                {uploadedFiles.some(f => f.type === 'dms') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.0 }} className="text-slate-300">
                                       <span className="text-purple-400">[TOOL: Parser]</span> 经销存系统数据映射提取完毕: <span className="text-emerald-400">18,940</span> Entities
                                    </motion.div>
                                )}
                                {uploadedFiles.some(f => f.type === 'sap') && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} className="text-slate-300">
                                       <span className="text-purple-400">[TOOL: Parser]</span> SAP 底座凭证流水映射完毕: <span className="text-rose-400">18,936</span> Entities
                                    </motion.div>
                                )}
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.2 }} className="text-slate-300">
                                   <span className="text-purple-400">[ACTION]</span> 调用内置图计算引擎技能 <span className="bg-slate-800 text-purple-300 px-1 py-0.5 rounded">Cross_Validation</span> 执行跨系统订单金额笛卡尔积比对...
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 4.2 }} className="text-rose-400 font-bold border-l-2 border-rose-500 pl-3">
                                   <span className="text-rose-500">[WARNING: MISMATCH_DETECTED]</span> 比对完成！发现 4 笔关键订单状态产生断层差异 (POS/DMS 有流水，SAP 断代)。触发 LLM 深度推理机制保护！
                                </motion.div>

                                {uploadedFiles.some(f => f.type === 'log') ? (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 5.0 }} className="text-slate-300">
                                       <span className="text-amber-400">[TOOL: Log_Analyzer]</span> 针对该 4 笔订单，在用户挂载的日志中自动执行时间窗检索与关联... 发现多条 `Connection reset by peer` 与死锁报错的提取特征！
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 5.0 }} className="text-slate-300">
                                       <span className="text-amber-400">[REASONING]</span> 业务缺少网关执行日志。模型仅依据隐性特征参数推断，辅助评估财务造假、业务漏洞或技术延迟引发故障的置信度。
                                    </motion.div>
                                )}

                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 6.0 }} className="text-slate-300 leading-relaxed">
                                   <span className="text-indigo-400">[DECISION: LLM_Logic]</span> 分析推流结果: "提取的事实特征符合微服务调用链熔断或网络抖动重试失败的模型。判归类为【IT 架构层瞬态网络故障引发的部分事务回滚】，而非业务欺诈造假与员工飞单..."
                                </motion.div>
                                
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 7.2 }} className="text-slate-400">
                                   <span className="text-emerald-400">[SYSTEM]</span> 自动化归因结束。写入报表缓冲池，安全退出代码: <span className="text-emerald-500 font-bold">200_OK_WITH_WARNINGS</span>
                                </motion.div>
                            </div>
                            
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.5 }} className="mt-6 flex justify-center border-t border-slate-800 pt-6">
                                <button onClick={() => setSandboxPhase('result')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                                    查看由 AI 辅助生成的诊断调查报告
                                </button>
                            </motion.div>
                       </div>
                   </motion.div>
               )}

               {sandboxPhase === 'result' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-xl shadow-xl p-8 max-w-4xl mx-auto mb-10">
                        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">对账核查与归因报告已完成</h3>
                                <div className="text-xs text-slate-500 flex items-center gap-3">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">240 Processed</span>
                                    <span className="bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-rose-600 font-mono font-bold">4 Anomalies</span>
                                    <span>Time Cost: 6.2s</span>
                                    <span>Model: DeepSeek-R1</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-blue-600" />
                                        大语言模型推理结论
                                    </h4>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                                        <div className="text-sm text-slate-700 leading-loose space-y-4">
                                            <p>模型在解析双向系统提单明细后，成功拦截了 <strong>4</strong> 笔关键的交易流水截断现象。未发现明显的人为退款造假或是商品金额被违规修改的问题特征。</p>
                                            <div className="my-4 bg-white border-l-4 border-rose-400 p-4 rounded shadow-sm text-slate-800">
                                               <strong>根因推导：</strong> 结合 {uploadedFiles.some(f => f.type === 'log') ? '上送提供的应用日志分析' : '时间序列聚合和微观行为表现推断'}，这些孤单存在着并发写入期间突发断层失败的共同特性。我们高度怀疑是由 <span className="bg-rose-100 text-rose-800 px-1 font-bold">网关层消息中间件抖动导致的写入事务被强行回滚</span>。
                                            </div>
                                            <p>
                                               <strong>处置建议：</strong> 此故障不会造成直接的资损，模型已按照规定安全阈值建议拦截流转业务线的工单，并将此问题的上下文直接推送给平台基础架构保障团队以确认其偶发性和重连能力。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 mb-3 text-slate-700 mb-3">系统调度产物 (Artifacts)</h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white shrink-0 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                                            <FileText className="w-8 h-8 text-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 mb-0.5">业务推送联络工单.md</div>
                                                <div className="text-[10px] text-slate-500">发送至钉钉/飞书的完整文案</div>
                                            </div>
                                        </div>
                                        <div className="border border-slate-200 rounded-lg p-4 bg-white shrink-0 flex items-center gap-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                                            <Code className="w-8 h-8 text-slate-600 shrink-0 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 mb-0.5">Session_Trace.json</div>
                                                <div className="text-[10px] text-slate-500">供人类工程师回溯调式的对象集</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
               )}
           </div>
        )}
      </div>
    </motion.div>
  );
}


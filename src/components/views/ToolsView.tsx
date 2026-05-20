import React, { useEffect, useMemo, useState } from "react";
import {
  Braces,
  ChevronRight,
  Database,
  Filter,
  RefreshCcw,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import type { ToolMeta } from "@/src/types";

const categoryStyles: Record<string, string> = {
  data_query: "bg-blue-50 text-blue-700 border-blue-200",
  rule: "bg-emerald-50 text-emerald-700 border-emerald-200",
  template: "bg-violet-50 text-violet-700 border-violet-200",
  notify: "bg-amber-50 text-amber-700 border-amber-200",
  compute: "bg-slate-50 text-slate-700 border-slate-200",
};

const sideEffectStyles: Record<string, string> = {
  none: "bg-emerald-50 text-emerald-700 border-emerald-200",
  notify: "bg-amber-50 text-amber-700 border-amber-200",
  write: "bg-rose-50 text-rose-700 border-rose-200",
};

const sensitivityStyles: Record<string, string> = {
  public: "bg-slate-50 text-slate-600 border-slate-200",
  internal: "bg-blue-50 text-blue-700 border-blue-200",
  internal_finance: "bg-violet-50 text-violet-700 border-violet-200",
  restricted: "bg-rose-50 text-rose-700 border-rose-200",
};

const categoryLabels: Record<string, string> = {
  all: "全部",
  data_query: "数据查询",
  rule: "规则判断",
  compute: "计算处理",
  template: "报告模板",
  notify: "消息通知",
};

const sideEffectLabels: Record<string, string> = {
  none: "只读",
  notify: "发送通知",
  write: "写入业务系统",
};

const sensitivityLabels: Record<string, string> = {
  public: "公开数据",
  internal: "内部数据",
  internal_finance: "财务内部数据",
  restricted: "受限数据",
};

const connectorLabels: Record<string, string> = {
  excel_import: "批量导入/模拟连接器",
  rule_engine: "规则引擎",
  compute_engine: "计算引擎",
  template_engine: "报告模板引擎",
  wecom_bot: "企业微信机器人",
  smtp_relay: "邮件网关",
};

const displayNameMap: Record<string, string> = {
  "finereport.query_diff_list": "查询帆软差异清单",
  "dms.query_settlement": "查询 DMS 结算单",
  "dms.query_revenue_ledger": "查询 DMS 收入台账",
  "sap.query_posting": "查询 SAP 过账凭证",
  "sap.query_interface_log": "查询 SAP 回传接口日志",
  "master.query_store_history": "查询门店主数据历史",
  "rule.eval_amount_compare": "金额一致性校验",
  "rule.detect_duplicate": "重复记录识别",
  "rule.eval_status_matrix": "SAP/DMS 状态组合校验",
  "rule.eval_threshold_alert": "差异金额阈值告警",
  "dms.query_customer_master": "查询 DMS 客户主数据",
  "sap.query_billing_doc": "查询 SAP 开票凭证",
  "finereport.query_batch_summary": "查询帆软差异汇总",
  "compute.calc_amount_diff": "计算金额差异",
  "compute.aggregate_by_module": "按业务模块汇总差异",
  "template.render_attribution_report": "生成归因报告",
  "template.render_review_summary": "生成复核摘要",
  "notify.send_review_request": "发送复核任务通知",
  "notify.email_finance_summary": "发送财务汇总邮件",
};

function getDisplayName(tool: ToolMeta) {
  return displayNameMap[tool.name] ?? tool.description;
}

function formatSchema(schema: Record<string, unknown>) {
  return JSON.stringify(schema, null, 2);
}

export function ToolsView() {
  const [tools, setTools] = useState<ToolMeta[]>([]);
  const [selected, setSelected] = useState<ToolMeta | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [keyword, setKeyword] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/tools");
    setTools(await res.json());
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      const text = `${tool.name} ${getDisplayName(tool)} ${tool.description} ${tool.owner}`;
      return !keyword || text.toLowerCase().includes(keyword.toLowerCase());
    });
  }, [category, keyword, tools]);

  const categories = useMemo(() => {
    const set = new Set(tools.map((tool) => tool.category));
    return ["all", ...Array.from(set)];
  }, [tools]);

  const metrics = useMemo(() => {
    return {
      total: tools.length,
      dataQuery: tools.filter((tool) => tool.category === "data_query").length,
      rule: tools.filter((tool) => tool.category === "rule").length,
      noSideEffect: tools.filter((tool) => tool.sideEffect === "none").length,
    };
  }, [tools]);

  return (
    <div className="h-full overflow-auto bg-slate-50/60 p-6">
      <div className="flex flex-col gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">工具注册中心</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                统一管理 Agent 可调用的外部数据查询、规则判断、计算处理、报告生成和消息通知能力。页面以中文业务名称展示，技术标识保留用于研发排查。
              </p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 self-start rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              刷新
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-bold text-slate-500">已注册工具</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{metrics.total}</div>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50 p-3">
              <div className="text-xs font-bold text-blue-700">数据查询工具</div>
              <div className="mt-1 text-2xl font-bold text-blue-700">{metrics.dataQuery}</div>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-bold text-emerald-700">规则判断工具</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{metrics.rule}</div>
            </div>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-bold text-emerald-700">只读工具</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{metrics.noSideEffect}</div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded border px-2.5 py-1 text-[11px] font-bold transition-colors",
                    category === item
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {categoryLabels[item] ?? item}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="按工具名称、说明或负责人搜索"
                className="w-72 rounded border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setSelected(tool)}
                className="rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <h3 className="truncate text-sm font-bold text-slate-900">{getDisplayName(tool)}</h3>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-slate-400">{tool.name}</div>
                  </div>
                  <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold", categoryStyles[tool.category] ?? "")}>
                    {categoryLabels[tool.category] ?? tool.category}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{tool.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className={cn("rounded border px-1.5 py-0.5 font-bold", sideEffectStyles[tool.sideEffect] ?? "")}>
                    {sideEffectLabels[tool.sideEffect] ?? tool.sideEffect}
                  </span>
                  <span className={cn("rounded border px-1.5 py-0.5 font-bold", sensitivityStyles[tool.dataSensitivity] ?? "")}>
                    {sensitivityLabels[tool.dataSensitivity] ?? tool.dataSensitivity}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>{connectorLabels[tool.connector] ?? tool.connector}</span>
                  <span className="inline-flex items-center gap-1 text-blue-600">
                    查看配置 <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <h3 className="truncate font-bold text-slate-900">{getDisplayName(selected)}</h3>
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-400">{selected.name}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{selected.description}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-xs text-slate-400">版本</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.version}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">工具类别</div>
                    <div className="mt-1 font-bold text-slate-900">{categoryLabels[selected.category] ?? selected.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">连接方式</div>
                    <div className="mt-1 font-bold text-slate-900">{connectorLabels[selected.connector] ?? selected.connector}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">负责人</div>
                    <div className="mt-1 font-bold text-slate-900">{selected.owner}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">数据范围</div>
                    <div className="mt-1 font-bold text-slate-900">{sensitivityLabels[selected.dataSensitivity] ?? selected.dataSensitivity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">业务影响</div>
                    <div className="mt-1 font-bold text-slate-900">{sideEffectLabels[selected.sideEffect] ?? selected.sideEffect}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Braces className="h-4 w-4 text-blue-600" />
                    入参配置
                  </div>
                  <pre className="overflow-auto rounded border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-100">
{formatSchema(selected.inputSchema)}
                  </pre>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Database className="h-4 w-4 text-blue-600" />
                    出参配置
                  </div>
                  <pre className="overflow-auto rounded border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-100">
{formatSchema(selected.outputSchema)}
                  </pre>
                </div>

                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs leading-6 text-emerald-700">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    安全边界
                  </div>
                  <p className="mt-1">
                    POC 阶段工具以只读查询、规则判断和通知为主，不直接写入 SAP、DMS 等业务系统。后续若新增“写入业务系统”类工具，需要先经过权限、审批和审计配置。
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

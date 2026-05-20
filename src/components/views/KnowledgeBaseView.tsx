import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Database,
  Edit3,
  FileText,
  Lightbulb,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

type KnowledgeType = "业务口径" | "字段解释" | "处理SOP" | "典型案例";
type KnowledgeStatus = "启用" | "草稿" | "停用";

interface KnowledgeItem {
  id: string;
  title: string;
  type: KnowledgeType;
  scenario: string;
  owner: string;
  status: KnowledgeStatus;
  updatedAt: string;
  summary: string;
  content: string;
  tags: string[];
}

type KnowledgeForm = Omit<KnowledgeItem, "id" | "updatedAt">;

const initialItems: KnowledgeItem[] = [
  {
    id: "KB-001",
    title: "同一结算单出现多个 MDM ID 的业务口径",
    type: "业务口径",
    scenario: "收入对账 / MDM ID 异常",
    owner: "财务数据治理组",
    status: "启用",
    updatedAt: "2026-05-18",
    summary: "用于解释同一结算单关联多个 MDM ID 时的业务判断口径。",
    content:
      "同一结算单出现多个 MDM ID，通常说明门店、客户或组织归属在业务链路中出现映射不一致。处理时应结合业务日期、历史主数据和 DMS 收入台账判断，不宜只按当前主数据映射下结论。",
    tags: ["MDM ID", "主数据", "收入对账"],
  },
  {
    id: "KB-002",
    title: "DMS 结算状态与 SAP 过账状态字段解释",
    type: "字段解释",
    scenario: "状态不一致 / 回传异常",
    owner: "财务信息化组",
    status: "启用",
    updatedAt: "2026-05-17",
    summary: "说明 DMS 业务状态与 SAP 财务状态的字段差异和引用口径。",
    content:
      "DMS 结算状态反映业务侧结算进度，SAP 过账状态反映财务凭证处理结果。两者不是同一字段，但应通过接口回传保持最终一致。报告中必须标注字段来源系统，避免业务状态和财务状态混用。",
    tags: ["DMS", "SAP", "字段口径"],
  },
  {
    id: "KB-003",
    title: "SAP 回传 DMS 失败处理 SOP",
    type: "处理SOP",
    scenario: "接口日志监控 / 告警处理",
    owner: "渠道业务 IT / 财务信息化组",
    status: "启用",
    updatedAt: "2026-05-19",
    summary: "用于处理 SAP 回传 DMS 失败、超时、锁表等接口异常。",
    content:
      "先在接口日志监控中确认错误码和影响单据。TIMEOUT 优先检查目标系统响应和网络链路；DMS_LOCK 优先确认结算单是否被人工任务或批处理占用；MISSING_FX_RATE 转主数据团队处理。",
    tags: ["接口日志", "SAP 回传", "告警"],
  },
  {
    id: "KB-004",
    title: "DMS 收入台账重复写入导致金额翻倍案例",
    type: "典型案例",
    scenario: "收入金额异常 / 金额翻倍",
    owner: "财务对账组",
    status: "草稿",
    updatedAt: "2026-05-16",
    summary: "记录 DMS 台账补写任务重复执行导致金额翻倍的历史案例。",
    content:
      "历史案例中曾出现 DMS 台账补写任务重复执行，导致 DMS 金额翻倍而 SAP 金额正常。若差异金额接近原始结算金额，应优先检查 DMS 收入台账是否存在相同结算单、相同金额、不同写入批次的重复记录。",
    tags: ["金额翻倍", "DMS 台账", "典型案例"],
  },
];

const typeIconMap: Record<KnowledgeType, React.ElementType> = {
  业务口径: Lightbulb,
  字段解释: Database,
  处理SOP: ShieldCheck,
  典型案例: FileText,
};

const typeStyleMap: Record<KnowledgeType, string> = {
  业务口径: "bg-blue-50 text-blue-700 border-blue-200",
  字段解释: "bg-emerald-50 text-emerald-700 border-emerald-200",
  处理SOP: "bg-amber-50 text-amber-700 border-amber-200",
  典型案例: "bg-purple-50 text-purple-700 border-purple-200",
};

const statusStyleMap: Record<KnowledgeStatus, string> = {
  启用: "bg-emerald-50 text-emerald-700 border-emerald-200",
  草稿: "bg-amber-50 text-amber-700 border-amber-200",
  停用: "bg-slate-50 text-slate-600 border-slate-200",
};

const emptyForm: KnowledgeForm = {
  title: "",
  type: "业务口径",
  scenario: "",
  owner: "",
  status: "草稿",
  summary: "",
  content: "",
  tags: [],
};

function todayLabel() {
  return new Date().toISOString().slice(0, 10);
}

function parseTags(value: string) {
  return value
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function KnowledgeBaseView() {
  const [items, setItems] = useState<KnowledgeItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"全部" | KnowledgeType>("全部");
  const [activeStatus, setActiveStatus] = useState<"全部" | KnowledgeStatus>("全部");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<KnowledgeForm>(emptyForm);
  const [tagInput, setTagInput] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const keyword = query.trim().toLowerCase();
      const matchesQuery =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.scenario.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.tags.some((tag) => tag.toLowerCase().includes(keyword));
      const matchesType = activeType === "全部" || item.type === activeType;
      const matchesStatus = activeStatus === "全部" || item.status === activeStatus;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [activeStatus, activeType, items, query]);

  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? items[0];

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagInput("");
  };

  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      type: item.type,
      scenario: item.scenario,
      owner: item.owner,
      status: item.status,
      summary: item.summary,
      content: item.content,
      tags: item.tags,
    });
    setTagInput(item.tags.join("，"));
  };

  const closeEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagInput("");
  };

  const saveForm = () => {
    const normalized: KnowledgeForm = {
      ...form,
      tags: parseTags(tagInput),
      title: form.title.trim(),
      scenario: form.scenario.trim(),
      owner: form.owner.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
    };
    if (!normalized.title || !normalized.summary || !normalized.content) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...normalized,
                updatedAt: todayLabel(),
              }
            : item,
        ),
      );
      setSelectedId(editingId);
    } else {
      const nextId = `KB-${String(items.length + 1).padStart(3, "0")}`;
      const nextItem: KnowledgeItem = {
        id: nextId,
        ...normalized,
        updatedAt: todayLabel(),
      };
      setItems((prev) => [nextItem, ...prev]);
      setSelectedId(nextId);
    }
    closeEditor();
  };

  const deleteItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? "");
      return next;
    });
  };

  const editorOpen = editingId !== null || form !== emptyForm;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full overflow-auto bg-slate-50/60 p-6">
      <div className="grid h-full min-h-[760px] gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  知识库管理
                </h2>
                <p className="mt-1 text-xs text-slate-500">维护业务口径、字段解释、处理 SOP 和典型案例。</p>
              </div>
              <button
                onClick={startCreate}
                className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                新增知识
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题、场景、标签"
                className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["全部", "业务口径", "字段解释", "处理SOP", "典型案例"] as Array<"全部" | KnowledgeType>).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "rounded border px-2.5 py-1.5 text-xs font-bold",
                    activeType === type ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["全部", "启用", "草稿", "停用"] as Array<"全部" | KnowledgeStatus>).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={cn(
                    "rounded border px-2.5 py-1.5 text-xs font-bold",
                    activeStatus === status ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto divide-y divide-slate-100">
            {filtered.map((item) => {
              const Icon = typeIconMap[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn("flex w-full items-start gap-3 p-5 text-left hover:bg-slate-50", selected?.id === item.id && "bg-blue-50/60")}
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded border", typeStyleMap[item.type])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate font-bold text-slate-900">{item.title}</h4>
                      <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold", statusStyleMap[item.status])}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{item.scenario}</div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="flex h-48 items-center justify-center text-sm text-slate-400">暂无匹配知识</div>
            )}
          </div>
        </section>

        <section className="min-h-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          {selected ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("rounded border px-2 py-1 text-xs font-bold", typeStyleMap[selected.type])}>{selected.type}</span>
                      <span className={cn("rounded border px-2 py-1 text-xs font-bold", statusStyleMap[selected.status])}>{selected.status}</span>
                      <span className="font-mono text-xs text-slate-400">{selected.id}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{selected.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{selected.summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(selected)}
                      className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <Edit3 className="h-4 w-4" />
                      编辑
                    </button>
                    <button
                      onClick={() => deleteItem(selected.id)}
                      className="inline-flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">适用场景</div>
                    <div className="mt-1 font-bold text-slate-700">{selected.scenario}</div>
                  </div>
                  <div className="rounded border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">责任团队</div>
                    <div className="mt-1 font-bold text-slate-700">{selected.owner}</div>
                  </div>
                  <div className="rounded border border-slate-100 bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">更新时间</div>
                    <div className="mt-1 font-mono font-bold text-slate-700">{selected.updatedAt}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900">知识内容</h4>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selected.content}</p>
                </div>
                <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900">标签</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">请选择或新增知识</div>
          )}
        </section>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={closeEditor}>
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900">{editingId ? "编辑知识" : "新增知识"}</h3>
                <p className="mt-1 text-xs text-slate-500">维护知识条目的基础信息、正文和标签。</p>
              </div>
              <button onClick={closeEditor} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-500">标题</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold text-slate-500">分类</span>
                    <select
                      value={form.type}
                      onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as KnowledgeType }))}
                      className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                    >
                      {(["业务口径", "字段解释", "处理SOP", "典型案例"] as KnowledgeType[]).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold text-slate-500">状态</span>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as KnowledgeStatus }))}
                      className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                    >
                      {(["启用", "草稿", "停用"] as KnowledgeStatus[]).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold text-slate-500">责任团队</span>
                    <input
                      value={form.owner}
                      onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
                      className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-500">适用场景</span>
                  <input
                    value={form.scenario}
                    onChange={(event) => setForm((prev) => ({ ...prev, scenario: event.target.value }))}
                    className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-500">摘要</span>
                  <textarea
                    value={form.summary}
                    onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                    rows={3}
                    className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-500">正文</span>
                  <textarea
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    rows={8}
                    className="rounded border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold text-slate-500">标签，用逗号分隔</span>
                  <input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    className="h-10 rounded border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={closeEditor} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                取消
              </button>
              <button onClick={saveForm} className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                <Check className="h-4 w-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

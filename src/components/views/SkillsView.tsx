import React, { useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  Edit3,
  FileSpreadsheet,
  FileText,
  Plus,
  SearchCheck,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

type SkillCategory = "业务归因" | "通用解析";

type SkillItem = {
  id: string;
  name: string;
  category: SkillCategory;
  enabled: boolean;
  description: string;
  inputs: string[];
  steps: string[];
  rule: string;
  evidence: string;
  review: string;
};

const emptyForm: Omit<SkillItem, "id"> = {
  name: "",
  category: "业务归因",
  enabled: true,
  description: "",
  inputs: [],
  steps: [],
  rule: "",
  evidence: "",
  review: "",
};

const initialSkills: SkillItem[] = [
  {
    id: "MDM_ID_ANOMALY",
    name: "同结算单多 MDM ID 归因 Skill",
    category: "业务归因",
    enabled: true,
    description: "同一结算单在帆软收入总额核对中出现多行，客户号一致但 MDM ID 不一致。",
    inputs: ["帆软差异清单", "DMS结算单表/函", "DMS收入台账", "SAP过账数据", "门店主数据", "组织变更记录"],
    steps: ["识别同结算单多 MDM ID", "核对DMS传SAP数据", "核对DMS收入台账", "核对门店主数据", "核对组织变更记录"],
    rule: "结算单与SAP一致但收入台账MDM不一致时，定位到DMS收入台账或主数据历史归属。",
    evidence: "MDM ID列表、金额分布、门店归属、组织变更命中记录。",
    review: "DMS侧复核收入台账生成逻辑，财务侧确认历史归属口径。",
  },
  {
    id: "AMOUNT_DOUBLE",
    name: "收入金额翻倍归因 Skill",
    category: "业务归因",
    enabled: true,
    description: "DMS收入台账金额明显偏大，DMS金额约等于SAP金额2倍或存在重复插入特征。",
    inputs: ["帆软差异清单", "DMS结算单", "DMS收入台账", "台账插入时间/批次", "SAP过账数据"],
    steps: ["识别金额比例异常", "核对DMS结算单金额", "核对SAP过账金额", "聚合收入台账", "检查重复插入记录"],
    rule: "SAP与结算单一致但收入台账聚合金额翻倍时，定位到台账重复写入。",
    evidence: "金额比例、同单同金额记录数、批次时间、重复记录证据。",
    review: "DMS侧复核批处理幂等控制与重复写入校验。",
  },
  {
    id: "STATUS_MISMATCH",
    name: "SAP/DMS 状态回传异常归因 Skill",
    category: "业务归因",
    enabled: true,
    description: "SAP已过账或已开票，但DMS结算单状态未同步；或双方状态不一致。",
    inputs: ["帆软状态差异清单", "SAP ZTSD017/凭证", "DMS结算单状态", "SAP回传日志", "DMS接收日志"],
    steps: ["识别状态差异", "查询SAP过账/开票状态", "查询DMS结算单状态", "比对状态矩阵", "查询接口日志"],
    rule: "SAP状态完成且回传成功，但DMS未更新时，定位到DMS接收后处理或状态更新任务。",
    evidence: "状态矩阵、接口返回码、接收成功记录、DMS未更新字段。",
    review: "接口负责人补充消费日志，DMS侧复核状态更新任务。",
  },
  {
    id: "XLSX_PARSE",
    name: "XLSX 表格解析 Skill",
    category: "通用解析",
    enabled: true,
    description: "解析 Excel 工作簿、工作表、表头、单元格类型和多表结构。",
    inputs: ["xlsx文件", "字段映射配置", "表头识别规则"],
    steps: ["读取工作簿", "识别工作表", "抽取表头", "标准化字段", "输出结构化表格"],
    rule: "按字段映射和表头规则识别数据列，保留原始行号和工作表来源。",
    evidence: "工作表名称、字段映射结果、原始行号、解析异常列表。",
    review: "业务人员确认字段映射是否符合当前数据模板。",
  },
  {
    id: "DOCX_PARSE",
    name: "DOCX 文档解析 Skill",
    category: "通用解析",
    enabled: true,
    description: "解析 Word 文档中的段落、表格、标题层级和附件说明。",
    inputs: ["docx文件", "段落抽取规则", "表格抽取规则"],
    steps: ["读取文档结构", "抽取标题层级", "解析正文段落", "解析文档表格", "输出文本与表格片段"],
    rule: "按标题和表格结构保留文档上下文，避免把表格和正文混合为无结构文本。",
    evidence: "标题路径、段落序号、表格坐标、抽取片段。",
    review: "确认文档模板与解析规则是否匹配。",
  },
  {
    id: "LOG_PARSE",
    name: "系统日志解析 Skill",
    category: "通用解析",
    enabled: true,
    description: "解析应用日志、接口日志和任务日志，提取时间、级别、请求号、错误码和上下文。",
    inputs: ["log文件", "json日志", "时间窗口", "关键字/错误码"],
    steps: ["识别日志格式", "按时间窗口过滤", "提取请求链路", "聚合错误码", "输出命中片段"],
    rule: "按时间、请求号、单据号或错误码建立日志证据关联。",
    evidence: "日志时间、请求ID、错误码、命中片段、上下文行。",
    review: "系统负责人确认日志命中是否可作为异常责任依据。",
  },
  {
    id: "CSV_TEXT_PARSE",
    name: "CSV/TXT 文件解析 Skill",
    category: "通用解析",
    enabled: false,
    description: "解析 CSV、TSV、固定分隔符文本和普通文本清单。",
    inputs: ["csv文件", "txt文件", "分隔符配置", "编码配置"],
    steps: ["识别编码", "识别分隔符", "解析表头", "清洗空行", "输出结构化记录"],
    rule: "保留原始文件行号和解析错误，方便回溯。",
    evidence: "编码、分隔符、字段数量、异常行。",
    review: "确认分隔符和编码识别是否正确。",
  },
];

const filterOptions = ["全部", "业务归因", "通用解析", "启用", "禁用"] as const;

function listToText(list: string[]) {
  return list.join("\n");
}

function textToList(text: string) {
  return text
    .split(/\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SkillsView() {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [activeId, setActiveId] = useState(initialSkills[0].id);
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("全部");
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [form, setForm] = useState({
    ...emptyForm,
    inputsText: "",
    stepsText: "",
  });

  const filteredSkills = useMemo(
    () =>
      skills.filter((skill) => {
        if (filter === "业务归因" || filter === "通用解析") return skill.category === filter;
        if (filter === "启用") return skill.enabled;
        if (filter === "禁用") return !skill.enabled;
        return true;
      }),
    [filter, skills],
  );

  const activeSkill = skills.find((skill) => skill.id === activeId) ?? filteredSkills[0] ?? skills[0];
  const formOpen = editingSkill !== null || form.name || form.description;

  const openCreate = () => {
    setEditingSkill(null);
    setForm({ ...emptyForm, inputsText: "", stepsText: "" });
  };

  const openEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    setForm({
      ...skill,
      inputsText: listToText(skill.inputs),
      stepsText: listToText(skill.steps),
    });
  };

  const closeForm = () => {
    setEditingSkill(null);
    setForm({ ...emptyForm, inputsText: "", stepsText: "" });
  };

  const saveSkill = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSkill: SkillItem = {
      id: editingSkill?.id ?? `SKILL_${Date.now()}`,
      name: form.name,
      category: form.category,
      enabled: form.enabled,
      description: form.description,
      inputs: textToList(form.inputsText),
      steps: textToList(form.stepsText),
      rule: form.rule,
      evidence: form.evidence,
      review: form.review,
    };

    if (editingSkill) {
      setSkills((prev) => prev.map((skill) => (skill.id === editingSkill.id ? nextSkill : skill)));
    } else {
      setSkills((prev) => [nextSkill, ...prev]);
      setActiveId(nextSkill.id);
    }
    closeForm();
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
    if (activeId === id) {
      const next = skills.find((skill) => skill.id !== id);
      if (next) setActiveId(next.id);
    }
    if (editingSkill?.id === id) closeForm();
  };

  const toggleEnabled = (id: string) => {
    setSkills((prev) => prev.map((skill) => (skill.id === id ? { ...skill, enabled: !skill.enabled } : skill)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Brain className="h-5 w-5 text-blue-600" />
            技能管理
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            管理业务归因 Skill 与通用解析 Skill，支持新增、编辑、删除、启用和禁用。
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          新增技能
        </button>
      </div>

      <div className="grid h-[calc(100%-92px)] grid-cols-[380px_1fr]">
        <aside className="overflow-auto border-r border-slate-100 bg-slate-50/40 p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={cn(
                  "rounded border px-3 py-1.5 text-xs font-bold",
                  filter === item ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setActiveId(skill.id)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-colors",
                  activeSkill?.id === skill.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{skill.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{skill.category}</span>
                      <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold", skill.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                        {skill.enabled ? "启用" : "禁用"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{skill.description}</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="overflow-auto p-6">
          {formOpen && (
            <form onSubmit={saveSkill} className="mb-6 rounded-lg border border-blue-200 bg-blue-50/40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">{editingSkill ? "编辑技能" : "新增技能"}</h4>
                <button type="button" onClick={closeForm} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">技能名称</label>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">类型</label>
                  <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SkillCategory })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option>业务归因</option>
                    <option>通用解析</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">描述</label>
                  <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">输入数据</label>
                  <textarea value={form.inputsText} onChange={(event) => setForm({ ...form, inputsText: event.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="每行一个输入" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">执行步骤</label>
                  <textarea value={form.stepsText} onChange={(event) => setForm({ ...form, stepsText: event.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="每行一个步骤" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">规则</label>
                  <textarea value={form.rule} onChange={(event) => setForm({ ...form, rule: event.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">输出与复核</label>
                  <textarea value={`${form.evidence}\n${form.review}`} onChange={(event) => {
                    const [evidence = "", ...review] = event.target.value.split("\n");
                    setForm({ ...form, evidence, review: review.join("\n") });
                  }} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} className="h-4 w-4 rounded text-blue-600" />
                  启用
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                    取消
                  </button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">
                    保存
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeSkill && (
            <>
              <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <SearchCheck className="h-4 w-4" />
                      当前选中 Skill
                    </div>
                    <h4 className="mt-2 text-xl font-bold text-slate-900">{activeSkill.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{activeSkill.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => toggleEnabled(activeSkill.id)} className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                      {activeSkill.enabled ? "禁用" : "启用"}
                    </button>
                    <button onClick={() => openEdit(activeSkill)} className="rounded border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" title="编辑">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteSkill(activeSkill.id)} className="rounded border border-slate-200 bg-white p-2 text-rose-600 hover:bg-rose-50" title="删除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 p-5">
                  <h5 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    {activeSkill.category === "通用解析" ? <FileSpreadsheet className="h-4 w-4 text-blue-600" /> : <Database className="h-4 w-4 text-blue-600" />}
                    输入数据
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {activeSkill.inputs.map((item) => (
                      <span key={item} className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 p-5">
                  <h5 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    规则
                  </h5>
                  <p className="text-sm leading-6 text-slate-600">{activeSkill.rule}</p>
                </section>

                <section className="rounded-lg border border-slate-200 p-5">
                  <h5 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    执行步骤
                  </h5>
                  <div className="space-y-2">
                    {activeSkill.steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{index + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 p-5">
                  <h5 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                    <FileText className="h-4 w-4 text-blue-600" />
                    输出与复核
                  </h5>
                  <div className="space-y-4 text-sm leading-6 text-slate-600">
                    <p>
                      <span className="font-bold text-slate-900">输出：</span>
                      {activeSkill.evidence}
                    </p>
                    <p>
                      <span className="font-bold text-slate-900">复核：</span>
                      {activeSkill.review}
                    </p>
                    <div className={cn("flex items-center gap-2 rounded border px-3 py-2 text-xs font-bold", activeSkill.enabled ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <CheckCircle2 className="h-4 w-4" />
                      {activeSkill.enabled ? "当前技能已启用" : "当前技能已禁用"}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
}

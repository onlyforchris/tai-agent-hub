import React, { useMemo, useState } from "react";
import { Activity, Cpu, Edit3, Plus, RefreshCcw, Server, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

type ModelStatus = "运行中" | "未测试" | "异常";

type ModelConfig = {
  id: string;
  name: string;
  modelId: string;
  provider: "DeepSeek" | "通义千问";
  baseUrl: string;
  apiKey: string;
  status: ModelStatus;
  latency: string;
  rpm: number;
};

const emptyForm: Omit<ModelConfig, "id" | "status" | "latency" | "rpm"> = {
  name: "",
  modelId: "",
  provider: "DeepSeek",
  baseUrl: "",
  apiKey: "",
};

const initialModels: ModelConfig[] = [
  {
    id: "M01",
    name: "DeepSeek V4 Flash",
    modelId: "deepseek-v4-flash",
    provider: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "sk-********",
    status: "运行中",
    latency: "126ms",
    rpm: 420,
  },
  {
    id: "M02",
    name: "DeepSeek V4 Pro",
    modelId: "deepseek-v4-pro",
    provider: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "sk-********",
    status: "运行中",
    latency: "188ms",
    rpm: 280,
  },
  {
    id: "M03",
    name: "Qwen Max",
    modelId: "qwen-max",
    provider: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "sk-********",
    status: "运行中",
    latency: "168ms",
    rpm: 360,
  },
  {
    id: "M04",
    name: "Qwen Plus",
    modelId: "qwen-plus",
    provider: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "sk-********",
    status: "未测试",
    latency: "-",
    rpm: 0,
  },
];

export function ModelsView() {
  const [models, setModels] = useState<ModelConfig[]>(initialModels);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [testingId, setTestingId] = useState<string | null>(null);

  const monitor = useMemo(
    () => ({
      total: models.length,
      running: models.filter((model) => model.status === "运行中").length,
      untested: models.filter((model) => model.status === "未测试").length,
      error: models.filter((model) => model.status === "异常").length,
      rpm: models.reduce((sum, model) => sum + model.rpm, 0),
    }),
    [models],
  );

  const openCreate = () => {
    setEditingModel(null);
    setForm(emptyForm);
  };

  const openEdit = (model: ModelConfig) => {
    setEditingModel(model);
    setForm({
      name: model.name,
      modelId: model.modelId,
      provider: model.provider,
      baseUrl: model.baseUrl,
      apiKey: model.apiKey,
    });
  };

  const closeForm = () => {
    setEditingModel(null);
    setForm(emptyForm);
  };

  const saveModel = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingModel) {
      setModels((prev) =>
        prev.map((model) =>
          model.id === editingModel.id
            ? {
                ...model,
                ...form,
                apiKey: form.apiKey.startsWith("sk-") ? "sk-********" : form.apiKey || "sk-********",
              }
            : model,
        ),
      );
    } else {
      setModels((prev) => [
        ...prev,
        {
          id: `M${String(Date.now()).slice(-4)}`,
          ...form,
          apiKey: form.apiKey ? "sk-********" : "sk-********",
          status: "未测试",
          latency: "-",
          rpm: 0,
        },
      ]);
    }
    closeForm();
  };

  const deleteModel = (id: string) => {
    setModels((prev) => prev.filter((model) => model.id !== id));
    if (editingModel?.id === id) closeForm();
  };

  const testConnection = async (id: string) => {
    setTestingId(id);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setModels((prev) =>
      prev.map((model) =>
        model.id === id
          ? {
              ...model,
              status: "运行中",
              latency: `${Math.floor(Math.random() * 90) + 80}ms`,
              rpm: Math.floor(Math.random() * 260) + 180,
            }
          : model,
      ),
    );
    setTestingId(null);
  };

  const formOpen = editingModel !== null || form.name || form.baseUrl || form.apiKey;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Cpu className="h-5 w-5 text-blue-600" />
            模型配置与监控
          </h3>
          <p className="mt-2 text-sm text-slate-500">大模型增删改查、连接测试、运行监控。</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          接入新模型
        </button>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          {formOpen && (
            <form onSubmit={saveModel} className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">{editingModel ? "编辑模型" : "新增模型"}</h4>
                <button type="button" onClick={closeForm} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">模型名称</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="DeepSeek V4"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">模型号</label>
                  <input
                    value={form.modelId}
                    onChange={(event) => setForm({ ...form, modelId: event.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                    placeholder="deepseek-v4-flash"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">供应商</label>
                  <select
                    value={form.provider}
                    onChange={(event) => setForm({ ...form, provider: event.target.value as ModelConfig["provider"] })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option>DeepSeek</option>
                    <option>通义千问</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">Base URL</label>
                  <input
                    value={form.baseUrl}
                    onChange={(event) => setForm({ ...form, baseUrl: event.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                    placeholder="https://api.deepseek.com/v1"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">API Key</label>
                  <input
                    value={form.apiKey}
                    onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
                    type="password"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
                    placeholder="sk-..."
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  取消
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  保存
                </button>
              </div>
            </form>
          )}

          {models.map((model) => (
            <div key={model.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900">{model.name}</h4>
                      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">{model.provider}</span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-bold",
                          model.status === "运行中" ? "bg-emerald-50 text-emerald-700" : model.status === "异常" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {model.status}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-xs font-bold text-slate-700">{model.modelId}</div>
                    <div className="mt-2 font-mono text-xs text-slate-500">{model.baseUrl}</div>
                    <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
                      <div>
                        <div className="text-slate-400">API Key</div>
                        <div className="mt-1 font-bold text-slate-700">{model.apiKey}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">延迟</div>
                        <div className="mt-1 font-bold text-slate-700">{model.latency}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">RPM</div>
                        <div className="mt-1 font-bold text-slate-700">{model.rpm}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => testConnection(model.id)} disabled={testingId === model.id} className="rounded border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-60" title="测试连接">
                    <RefreshCcw className={cn("h-4 w-4", testingId === model.id && "animate-spin")} />
                  </button>
                  <button onClick={() => openEdit(model)} className="rounded border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50" title="编辑">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteModel(model.id)} className="rounded border border-slate-200 bg-white p-2 text-rose-600 hover:bg-rose-50" title="删除">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-5 flex items-center gap-2 font-bold text-slate-900">
            <Activity className="h-4 w-4 text-blue-600" />
            运行监控
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">模型总数</span>
              <span className="text-lg font-bold text-slate-900">{monitor.total}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">运行中</span>
              <span className="text-lg font-bold text-emerald-700">{monitor.running}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">未测试</span>
              <span className="text-lg font-bold text-amber-700">{monitor.untested}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">异常</span>
              <span className="text-lg font-bold text-rose-700">{monitor.error}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">总 RPM</span>
              <span className="text-lg font-bold text-slate-900">{monitor.rpm}</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

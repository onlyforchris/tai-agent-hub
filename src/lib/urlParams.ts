export type AppViewMode = "business" | "admin";

export type WorkbenchUrlTab = "todo" | "confirm" | "list" | "progress" | "cases" | "compare";

export interface AppUrlParams {
  view: AppViewMode | null;
  workbenchTab: WorkbenchUrlTab | null;
  billNo: string | null;
}

const VALID_TABS = new Set<string>(["todo", "confirm", "list", "progress", "cases", "compare"]);

export function readAppUrlParams(): AppUrlParams {
  const params = new URLSearchParams(window.location.search);
  const viewRaw = params.get("view");
  const tabRaw = params.get("tab");
  const billNoRaw = params.get("billNo");

  return {
    view: viewRaw === "admin" ? "admin" : viewRaw === "business" ? "business" : null,
    workbenchTab: tabRaw && VALID_TABS.has(tabRaw) ? (tabRaw as WorkbenchUrlTab) : null,
    billNo: billNoRaw?.trim() || null,
  };
}

export function syncAppUrlParams(patch: {
  view?: AppViewMode;
  workbenchTab?: WorkbenchUrlTab | null;
  billNo?: string | null;
}) {
  const params = new URLSearchParams(window.location.search);

  if (patch.view !== undefined) {
    params.set("view", patch.view);
  }
  if (patch.workbenchTab !== undefined) {
    if (patch.workbenchTab) {
      params.set("tab", patch.workbenchTab);
    } else {
      params.delete("tab");
    }
  }
  if (patch.billNo !== undefined) {
    if (patch.billNo) {
      params.set("billNo", patch.billNo);
    } else {
      params.delete("billNo");
    }
  }

  const query = params.toString();
  const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", next);
}

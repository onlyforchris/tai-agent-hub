import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const mockNotifications = [
  { id: "1", title: "2026-04 月结批次新增 6 笔差异", time: "10 分钟前", unread: true },
  { id: "2", title: "TCH202604160002 归因完成，待复核", time: "1 小时前", unread: true },
  { id: "3", title: "DMS 负责人已确认 TCH202604160005", time: "2 小时前", unread: false },
];

interface NotificationBellProps {
  badge?: number;
  variant?: "inline" | "standalone";
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBell({ badge, variant = "standalone", onOpenChange }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [todoCount, setTodoCount] = useState(badge ?? 0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInline = variant === "inline";

  useEffect(() => {
    if (badge !== undefined) {
      setTodoCount(badge);
      return;
    }
    fetch("/api/differences")
      .then((res) => res.json())
      .then((data: Array<{ status: string }>) => {
        setTodoCount(data.filter((d) => d.status !== "COMPLETED").length);
      })
      .catch(() => {});
  }, [badge]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const unread = Math.min(todoCount, 9);

  const openTodo = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("workbench-tab-switch", { detail: { tab: "todo" } }));
  };

  const toggleOpen = () => setOpen((v) => !v);

  const panel =
    open && triggerRef.current
      ? createPortal(
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              position: "fixed",
              left: triggerRef.current.getBoundingClientRect().left,
              bottom: window.innerHeight - triggerRef.current.getBoundingClientRect().top + 8,
              zIndex: 9999,
            }}
            className="w-72 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2.5">
              <span className="text-xs font-bold text-slate-200">待办通知</span>
              {unread > 0 && (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  {unread} 条未读
                </span>
              )}
            </div>
            <div className="max-h-56 divide-y divide-slate-700/50 overflow-y-auto">
              {mockNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={openTodo}
                  className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-700/50"
                >
                  <div
                    className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-blue-400" : "bg-transparent")}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug text-slate-200">{n.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{n.time}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                </button>
              ))}
            </div>
          </motion.div>,
          document.body,
        )
      : null;

  return (
    <>
      {panel}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label="待办通知"
        aria-expanded={open}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={cn(
          "relative flex shrink-0 cursor-pointer items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          isInline
            ? cn("h-8 w-8 rounded-lg", open ? "bg-slate-700 text-blue-400" : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200")
            : cn(
                "h-[52px] w-[52px] rounded-lg border",
                open
                  ? "border-blue-500/50 bg-slate-800 text-blue-400"
                  : "border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200",
              ),
        )}
      >
        <Bell className={isInline ? "h-4 w-4" : "h-5 w-5"} />
        {unread > 0 && (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-rose-500 font-bold text-white",
              isInline
                ? "-right-0.5 -top-0.5 h-3.5 min-w-3.5 px-0.5 text-[8px]"
                : "-right-1 -top-1 h-4 min-w-4 border-2 border-slate-900 px-1 text-[9px]",
            )}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>
    </>
  );
}

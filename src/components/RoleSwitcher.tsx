import React, { useState } from "react";
import { Check, ChevronUp, Settings2, User } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { NotificationBell } from "./NotificationBell";

export type AppViewMode = "business" | "admin";

export interface AppRole {
  id: AppViewMode;
  name: string;
  title: string;
  avatar: string;
  icon: React.ElementType;
}

export const APP_ROLES: AppRole[] = [
  { id: "business", name: "张会计", title: "财务对账人员", avatar: "财", icon: User },
  { id: "admin", name: "管理员", title: "平台运营 / IT", avatar: "FT", icon: Settings2 },
];

interface RoleSwitcherProps {
  viewMode: AppViewMode;
  onSwitch: (mode: AppViewMode) => void;
}

export function RoleSwitcher({ viewMode, onSwitch }: RoleSwitcherProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const current = APP_ROLES.find((r) => r.id === viewMode) ?? APP_ROLES[0];

  const toggleRole = () => setRoleOpen((v) => !v);

  return (
    <div className="relative">
      {roleOpen && (
        <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
          <div className="border-b border-slate-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            切换角色
          </div>
          {APP_ROLES.map((role) => {
            const active = role.id === viewMode;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onSwitch(role.id);
                  setRoleOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-700/60",
                  active && "bg-slate-700/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    active ? "bg-blue-600" : "bg-slate-600",
                  )}
                >
                  {role.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{role.name}</p>
                  <p className="truncate text-[10px] text-slate-400">{role.title}</p>
                </div>
                {active && <Check className="h-4 w-4 shrink-0 text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}

      <div
        className={cn(
          "flex min-h-[52px] items-stretch overflow-hidden rounded-lg border transition-colors",
          roleOpen ? "border-blue-500/40 bg-slate-800" : "border-slate-700/50 bg-slate-800/50",
        )}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={roleOpen}
          onClick={toggleRole}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleRole();
            }
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left outline-none hover:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40"
          title="点击切换角色"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-inner">
            {current.avatar}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold leading-tight text-white">{current.name}</p>
            <p className="truncate text-[10px] font-medium text-slate-500">{current.title}</p>
          </div>
          <ChevronUp
            className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform", roleOpen && "rotate-180")}
          />
        </div>
        <div className="flex items-center border-l border-slate-700/50 px-2">
          <NotificationBell variant="inline" />
        </div>
      </div>
    </div>
  );
}

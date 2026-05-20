import React from "react";
import { RoleSwitcher, type AppViewMode } from "./RoleSwitcher";

interface SidebarFooterProps {
  viewMode: AppViewMode;
  onSwitchRole: (mode: AppViewMode) => void;
}

export function SidebarFooter({ viewMode, onSwitchRole }: SidebarFooterProps) {
  return (
    <div className="border-t border-slate-800 p-3">
      <RoleSwitcher viewMode={viewMode} onSwitch={onSwitchRole} />
    </div>
  );
}

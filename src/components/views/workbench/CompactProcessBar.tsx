import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CompactProcessBarProps {
  steps: string[];
  /** 演示时可高亮到第几步，默认 0 表示尚未开始 */
  activeIndex?: number;
}

export function CompactProcessBar({ steps, activeIndex = -1 }: CompactProcessBarProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-1">
        {steps.map((step, index) => {
          const done = activeIndex >= 0 && index <= activeIndex;
          const active = index === activeIndex;

          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                  done && !active && "bg-emerald-50 text-emerald-700",
                  active && "bg-blue-600 text-white shadow-sm",
                  !done && !active && "bg-slate-100 text-slate-500",
                )}
              >
                {done && !active && <CheckCircle2 className="h-3 w-3" />}
                <span>{step}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

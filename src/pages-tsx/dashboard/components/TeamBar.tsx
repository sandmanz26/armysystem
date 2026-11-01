import { Settings, Monitor, BookOpen, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Role chips — Figma "Data Display - Booking Team-Item" (node 5654:75643).
 * Each role maps to a hue: ADMIN danger, OPERATOR orange, INSTRUCTOR purple,
 * MAINTAINER warning. Fill = background/<hue>/invert/soft, outline =
 * border/invert/<hue>, icon + label + count = text/<hue>. (ADMIN is the one
 * mismatch Figma itself carries: danger fill with a border/invert/primary
 * outline — kept literal rather than "corrected" to border/invert/danger.)
 */
const ROLES = [
  { label: "ADMIN",      count: 3, Icon: Settings, tone: "bg-danger-invert-soft border-invert-primary text-danger" },
  { label: "OPERATOR",   count: 3, Icon: Monitor,  tone: "bg-orange-invert-soft border-invert-orange text-orange" },
  { label: "INSTRUCTOR", count: 3, Icon: BookOpen, tone: "bg-purple-invert-soft border-invert-purple text-purple" },
  { label: "MAINTAINER", count: 3, Icon: Wrench,   tone: "bg-warning-invert-soft border-invert-warning text-warning" },
] as const;

export function TeamBar() {
  return (
    <div className="bg-surface rounded-xl border border-invert-default px-5 py-3 mb-6 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-body">TEAM</span>
        <span className="text-sm font-bold text-default">12</span>
      </div>
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        {ROLES.map(({ label, count, Icon, tone }) => (
          <div
            key={label}
            className={cn("flex items-center justify-between gap-2 px-4 py-2 rounded-lg border", tone)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon size={14} className="flex-shrink-0" />
              <span className="text-xs font-bold truncate">{label}</span>
            </div>
            <span className="text-sm font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

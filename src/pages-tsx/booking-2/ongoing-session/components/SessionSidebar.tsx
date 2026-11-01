import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { formatDuration, resultOf, type OngoingSession } from "../session";

// Figma `Group` (240 wide) left of the Detail List: Duration card, the
// Marksman/Passed/Failed stack, and a collapsible Training Details section.
export function SessionSidebar({ session, now, onOpenResults }: { session: OngoingSession; now: number; onOpenResults?: () => void }) {
  const [open, setOpen] = useState(false);
  const total = session.trainees.length;
  const count = (k: "Marksman" | "Passed" | "Failed") => session.trainees.filter((t) => resultOf(t) === k).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const stats = [
    { label: "MARKSMAN", n: count("Marksman"), icon: "target" as const, box: "bg-info-invert-default", tone: "text-info" },
    { label: "PASSED", n: count("Passed"), icon: "circle-check" as const, box: "bg-success-invert-default", tone: "text-success" },
    { label: "FAILED", n: count("Failed"), icon: "circle-x" as const, box: "bg-danger-invert-default", tone: "text-danger" },
  ];

  return (
    <div className="flex w-[240px] flex-shrink-0 flex-col gap-4">
      <div className="flex items-center gap-4 rounded-xl border border-invert-default bg-surface-lv1 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-default">
          <Icon name="timer" size={16} className="text-body" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-caption">DURATION</span>
          <span className="text-xl font-bold text-default tabular-nums">{formatDuration((session.endedAt ?? now) - session.startedAt)}</span>
        </div>
      </div>

      {/* Figma `Session Results` card (5549:141192): title + "Based on each trainee's best result", then the
          Marksman / Passed / Failed rows, each with a trailing chevron. */}
      <div className="overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
        <div className="flex flex-col gap-0.5 px-4 pb-3 pt-4">
          <span className="text-sm font-semibold text-default">Session Results</span>
          <span className="text-xs text-body">Based on each trainee&apos;s best result</span>
        </div>
        {stats.map(({ label, n, icon, box, tone }) => (
          <button
            key={label}
            type="button"
            onClick={onOpenResults}
            className="flex w-full items-center gap-4 border-t border-invert-default bg-surface-lv2 px-4 py-3 text-left hover:bg-default-soft transition-colors"
          >
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", box)}>
              <Icon name={icon} size={16} className={tone} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={cn("text-xs font-semibold", tone)}>{label}</span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-default">{n}</span>
                <span className="text-xs text-body">({pct(n)}%)</span>
              </div>
            </div>
            <Icon name="chevron-right" size={16} className="flex-shrink-0 text-disabled" />
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-invert-default bg-surface-lv1">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-5 p-5 text-left">
          <span className="text-base font-semibold text-default">Training Details</span>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={18} className="text-primary" />
        </button>
        {open && (
          <div className="flex flex-col gap-5 px-5 pb-5">
            {[
              ["Booking Name", session.bookingName],
              ["Booking ID", `#${session.bookingCode}`],
              ["Courseware", session.courseware],
              ["Total Trainees", String(total)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="text-xs text-body">{k}</span>
                <span className="text-sm font-semibold text-default">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

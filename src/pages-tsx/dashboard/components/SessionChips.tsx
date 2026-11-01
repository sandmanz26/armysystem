import { cn } from "@/lib/utils";
import type { SessionType } from "../types";
import { sessionColors, SESSION_ORDER } from "../constants";

/**
 * Figma `Dashboard - Tab Inactive` (5654:76953, 5654:84526): all chips start
 * selected; clicking one shows ONLY that schedule type (the rest go grey);
 * clicking the sole selected chip again brings every type back.
 */
export function selectSession(prev: SessionType[], t: SessionType): SessionType[] {
  if (prev.length === 1 && prev[0] === t) return [...SESSION_ORDER];
  return [t];
}

/** "Status · AM" — plus the time window for Hourly and dated Ad-hoc bookings. */
export function blockMeta(status: string, type: SessionType, time?: string) {
  const window = type === "Hr" || (type === "Ad" && time && time !== "Ad-Hoc") ? time : undefined;
  return [status, sessionColors[type].short, window].filter(Boolean).join(" · ");
}

interface SessionChipsProps {
  counts: Record<SessionType, number>;
  active: SessionType[];
  onToggle: (type: SessionType) => void;
}

/**
 * Schedule-type filter chips — Figma "Tab Item/Box Tab Horizontal Colored".
 * Selected: hue-tinted fill + full-strength hue border + solid count bubble.
 * Unselected: surface fill, border/invert/default outline, text/body label and a
 * text/disabled bubble.
 */
export function SessionChips({ counts, active, onToggle }: SessionChipsProps) {
  return (
    <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
      {SESSION_ORDER.map((type) => {
        const c = sessionColors[type];
        const on = active.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            aria-pressed={on}
            className={cn(
              "h-9 px-3 rounded-lg border flex items-center gap-2 text-xs font-medium transition-colors",
              on
                ? cn(c.bg, c.chipBorder, c.text)
                : "bg-surface border-invert-default text-body hover:bg-main-background",
            )}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                "min-w-4 h-4 px-0.5 rounded-full flex items-center justify-center text-xs font-semibold text-invert-default ring-1 ring-base",
                on ? c.badge : "bg-disabled",
              )}
            >
              {counts[type] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

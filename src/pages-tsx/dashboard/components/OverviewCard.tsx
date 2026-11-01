import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { ViewMode } from "../types";

const VIEWS: ViewMode[] = ["Day", "Week", "Month", "Range"];

interface OverviewCardProps {
  /** Section header, e.g. "Day Overview" */
  title: string;
  /** Period label shown between the ‹ › buttons. Omit to hide the navigation (Range). */
  dateLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  /** Slot left of the date navigation — Month legend / Range date picker. */
  leading?: ReactNode;
  children: ReactNode;
}

/**
 * Card shell + header shared by the Day / Week / Month / Range overviews.
 * Matches Figma "Section Layout - Table" on node 5654:75643 — surface lv1 fill,
 * border/invert/default outline, 12px radius, 20px header padding.
 */
export function OverviewCard({
  title,
  dateLabel,
  onPrev,
  onNext,
  view,
  onViewChange,
  leading,
  children,
}: OverviewCardProps) {
  // overflow-visible, not hidden: the booking hover Tooltip hangs below its
  // block and would otherwise be clipped by this card.
  return (
    <div className="bg-surface rounded-xl border border-invert-default overflow-visible">
      <div className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
        <h2 className="text-base font-semibold text-default">{title}</h2>

        <div className="flex items-center gap-3">
          {leading}

          {dateLabel !== undefined && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous period"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-main-background transition-colors"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <span className="text-sm text-default whitespace-nowrap">{dateLabel}</span>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next period"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-main-background transition-colors"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          )}

          {/* Segmented picker — Figma "Segmented Picker sm" */}
          <div className="flex items-center gap-0 p-0.5 rounded-lg bg-default-default">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onViewChange(v)}
                className={cn(
                  "px-3 h-8 rounded text-sm font-medium transition-colors",
                  view === v
                    ? "bg-surface text-primary shadow-sm"
                    : "text-body hover:text-default",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

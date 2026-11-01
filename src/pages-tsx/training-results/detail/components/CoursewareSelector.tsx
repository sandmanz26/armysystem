import { cn } from "@/lib/utils";
import type { Courseware } from "../types";

/** A courseware whose session has not finished has no results to show yet. */
export const isCoursewareAvailable = (cw: Courseware) => cw.status === "Completed";

/**
 * Courseware list — Figma `Training Result Details (Multiple CW)` (5839:44920,
 * 8171:143270, 8171:144746). Replaces the earlier "Courseware 1 of 3" pager: a
 * card in a column left of the tabs, headed "Courseware" + the count, one row
 * per courseware — "Courseware #N", its name, booking date and session window.
 * The selected row takes the primary-soft fill and a primary left edge; a
 * courseware that has not been completed carries a "Not available yet" pill.
 */
interface CoursewareSelectorProps {
  coursewares: Courseware[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function CoursewareSelector({ coursewares, activeIndex, onSelect }: CoursewareSelectorProps) {
  return (
    <aside className="w-[240px] flex-shrink-0 overflow-hidden rounded-xl border border-invert-default bg-surface-lv1">
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="text-base font-semibold text-default">Courseware</span>
        <span className="text-base font-semibold text-body">{coursewares.length}</span>
      </div>
      <div role="listbox" aria-label="Courseware" className="flex flex-col">
        {coursewares.map((cw, i) => {
          const selected = i === activeIndex;
          const available = isCoursewareAvailable(cw);
          return (
            <button
              key={cw.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(i)}
              className={cn(
                "flex w-full flex-col gap-0.5 border-t border-invert-default px-5 py-3 text-left transition-colors",
                selected ? "bg-primary-invert-soft shadow-[inset_2px_0_0_rgb(var(--color-text-primary))]" : "bg-surface-lv1 hover:bg-default-hovered",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs text-body">Courseware #{i + 1}</span>
                {!available && (
                  <span className="rounded bg-surface-lv1 px-1.5 py-0.5 text-[10px] font-medium text-default border border-invert-default">{cw.status}</span>
                )}
              </span>
              <span className={cn("text-sm font-semibold", available ? "text-default" : "text-body")}>{cw.name}</span>
              <span className="text-xs text-body">{cw.bookingDate}</span>
              <span className="text-xs text-body">{cw.bookingSession}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

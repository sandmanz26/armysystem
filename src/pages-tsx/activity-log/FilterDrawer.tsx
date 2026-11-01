import { useEffect, useState } from "react";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { DateField } from "@/pages-tsx/site-management/modals/DateField";

/*
 * Activity Log → Filter drawer. Figma `Drawer - Filter` (6042:48455),
 * `Drawer - Filter - Selected` (6042:48459), `List - Filter Applied` (6042:48463).
 *
 * Content, sections 32 apart: Date (From · To, dd/mm/yyyy with calendar),
 * Programme (WPT MST TCT TH C/C) and Module (Booking · Reports & Data Exports ·
 * Settings · SHM · System Health · Training · User Management), the checkboxes
 * in rows of two. Footer: Clear Filter · Apply Filter. Selections are a draft
 * until Apply Filter; Clear Filter empties and applies at once. The title
 * carries a count badge once something is picked (Selected frame).
 */

export const ACTIVITY_PROGRAMMES = ["WPT", "MST", "TCT", "TH", "C/C"] as const;
export const ACTIVITY_MODULES = [
  "Booking",
  "Reports & Data Exports",
  "Settings",
  "SHM",
  "System Health",
  "Training",
  "User Management",
] as const;

export interface ActivityFilters {
  /** ISO yyyy-mm-dd or "" */
  from: string;
  to: string;
  programs: string[];
  modules: string[];
}

export const EMPTY_ACTIVITY_FILTERS: ActivityFilters = { from: "", to: "", programs: [], modules: [] };

/** The date range counts as one filter. */
export function countActivityFilters(f: ActivityFilters): number {
  return (f.from || f.to ? 1 : 0) + f.programs.length + f.modules.length;
}

interface Props {
  open: boolean;
  filters: ActivityFilters;
  onApply: (f: ActivityFilters) => void;
  onClose: () => void;
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function ActivityLogFilterDrawer({ open, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<ActivityFilters>(filters);

  // Re-seed the draft from the applied filters every time the drawer opens.
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const count = countActivityFilters(draft);

  const group = (title: string, prefix: string, options: readonly string[], key: "programs" | "modules") => (
    <section className="flex flex-col">
      <h3 className="text-sm font-semibold leading-5 text-default">{title}</h3>
      <div className="grid grid-cols-2 gap-x-5 pt-3">
        {options.map((o) => (
          <Checkbox
            key={o}
            id={`al-filter-${prefix}-${o}`}
            name={`al-filter-${prefix}-${o}`}
            size={18}
            label={o}
            checked={draft[key].includes(o)}
            onChange={() => setDraft((d) => ({ ...d, [key]: toggle(d[key], o) }))}
            wrapperClassName="min-h-9 h-auto py-1.5"
          />
        ))}
      </div>
    </section>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Filter
          {count > 0 && (
            <span className="inline-flex h-4 min-w-5 items-center justify-center rounded-full border border-base bg-primary-default px-0.5 text-xs font-semibold text-invert-default">
              {count}
            </span>
          )}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => { setDraft(EMPTY_ACTIVITY_FILTERS); onApply(EMPTY_ACTIVITY_FILTERS); onClose(); }}
            className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => { onApply(draft); onClose(); }}
            className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Apply Filter
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold leading-5 text-default">Date</h3>
          <div className="grid grid-cols-2 gap-x-5">
            <DateField label="From" name="al-filter-from" value={draft.from} onChange={(iso) => setDraft((d) => ({ ...d, from: iso }))} />
            <DateField label="To" name="al-filter-to" value={draft.to} onChange={(iso) => setDraft((d) => ({ ...d, to: iso }))} />
          </div>
        </section>
        {group("Programme", "programme", ACTIVITY_PROGRAMMES, "programs")}
        {group("Module", "module", ACTIVITY_MODULES, "modules")}
      </div>
    </Drawer>
  );
}

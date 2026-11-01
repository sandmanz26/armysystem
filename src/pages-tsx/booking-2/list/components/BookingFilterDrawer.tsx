import { useEffect, useState } from "react";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { ChipAdvanced } from "@/components/chip-advanced";
import { InputCustom } from "@/components/input";
import { Icon } from "@/components/icon";
import { DateField } from "@/pages-tsx/site-management/modals/DateField";
import { EMPTY_FILTERS, type BookingFilters } from "@/pages-tsx/booking/list/components/BookingFilterPanel";

/*
 * Booking 2.0 — Filter drawer. Figma `Drawer - Filter - Selected` (5029:30101,
 * Booking List page 5029:28299): shared Drawer 384px; header "Filter" + a
 * `Badge Number` with the active-filter count; sections 32px apart, each a
 * 14 Semi Bold sub-header with content 12px below:
 *   Booking Date — From / To date inputs side by side (20px gap)
 *   Training Type(s) — Chip Advanced (Group / Individual), selected chip carries a ✓, 14 Regular
 *   Training Slot, Briefing Room — checkboxes in two columns, 36px rows
 *   Courseware — Input - Search, then a checkbox list
 * Footer: Clear Filter (outline) · Apply Filter (primary), right-aligned.
 * Kept separate from the old booking module's BookingFilterPanel, which Booking
 * 2.0 must not modify (Working Agreements §5); the filter shape is shared.
 */

const TRAINING_TYPES = ["Group", "Individual"];
const TRAINING_SLOTS = ["AM Session", "PM Session", "Full Day", "Hourly", "Ad-hoc"];
/* Briefing room codes exactly as listed in 5029:30101 (the Settings → Briefing Room naming). */
const BRIEFING_ROOMS = ["L1BR-01", "L1BR-02", "L2BR-01", "L3BR-01", "L3BR-02", "L4BR-01", "L4BR-02"];
const COURSEWARES = [
  "Day Test For SAR21/M16 BTP",
  "Night Test For SAR21/M16 BTP",
  "SAR21/M16 ATP (M)",
  "SAR21 Target Exposure Timing ATP (M)",
  "Zeroing 100m",
  "BTP Day Test",
  "BTP Night Test",
  "APS Practice 1A - 1B",
  "Advanced SAR21 Training Module",
];

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const countActive = (f: BookingFilters) =>
  f.trainingTypes.length + f.trainingSlots.length + f.briefingRooms.length + f.coursewares.length +
  (f.dateFrom ? 1 : 0) + (f.dateTo ? 1 : 0);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold leading-5 text-default">{title}</p>
      <div className="pt-3">{children}</div>
    </div>
  );
}

function CheckGrid({ items, selected, onToggle, cols = 2 }: { items: string[]; selected: string[]; onToggle: (v: string) => void; cols?: 1 | 2 }) {
  return (
    <div className={cols === 2 ? "grid grid-cols-2 gap-x-4" : "flex flex-col"}>
      {items.map((v) => (
        <div key={v} className="h-9 flex items-center">
          <Checkbox label={v} checked={selected.includes(v)} onChange={() => onToggle(v)} />
        </div>
      ))}
    </div>
  );
}

interface Props {
  open: boolean;
  filters: BookingFilters;
  onApply: (f: BookingFilters) => void;
  onClose: () => void;
}

export function BookingFilterDrawer({ open, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<BookingFilters>(filters);
  const [cwSearch, setCwSearch] = useState("");

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const active = countActive(draft);
  const q = cwSearch.trim().toLowerCase();
  const visibleCw = q ? COURSEWARES.filter((c) => c.toLowerCase().includes(q)) : COURSEWARES;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Filter
          {active > 0 && (
            <span className="min-w-5 h-4 px-0.5 rounded-full ring-1 ring-base bg-primary-default text-invert-default text-xs font-semibold leading-4 flex items-center justify-center">
              {active}
            </span>
          )}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY_FILTERS })}
            className="h-10 px-4 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-soft transition-colors"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={() => { onApply(draft); onClose(); }}
            className="h-10 px-4 rounded-lg bg-primary-default text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Apply Filter
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <Section title="Booking Date">
          <div className="grid grid-cols-2 gap-5">
            <DateField label="From" value={draft.dateFrom} onChange={(v) => setDraft((d) => ({ ...d, dateFrom: v }))} />
            <DateField label="To" value={draft.dateTo} onChange={(v) => setDraft((d) => ({ ...d, dateTo: v }))} />
          </div>
        </Section>

        <Section title="Training Type(s)">
          <div className="flex gap-2">
            {TRAINING_TYPES.map((t) => (
              <ChipAdvanced
                key={t}
                multi
                checkIcon
                className="font-normal"
                label={t}
                selected={draft.trainingTypes.includes(t)}
                onSelect={() => setDraft((d) => ({ ...d, trainingTypes: toggle(d.trainingTypes, t) }))}
              />
            ))}
          </div>
        </Section>

        <Section title="Training Slot">
          <CheckGrid items={TRAINING_SLOTS} selected={draft.trainingSlots} onToggle={(v) => setDraft((d) => ({ ...d, trainingSlots: toggle(d.trainingSlots, v) }))} />
        </Section>

        <Section title="Briefing Room">
          <CheckGrid items={BRIEFING_ROOMS} selected={draft.briefingRooms} onToggle={(v) => setDraft((d) => ({ ...d, briefingRooms: toggle(d.briefingRooms, v) }))} />
        </Section>

        <Section title="Courseware">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none">
              <Icon name="search" size={18} />
            </span>
            <InputCustom
              type="text"
              placeholder="Search..."
              value={cwSearch}
              onChange={(e) => setCwSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="pt-3">
            <CheckGrid cols={1} items={visibleCw} selected={draft.coursewares} onToggle={(v) => setDraft((d) => ({ ...d, coursewares: toggle(d.coursewares, v) }))} />
            {visibleCw.length === 0 && <p className="py-2 text-sm text-body">No courseware found.</p>}
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

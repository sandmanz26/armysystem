import { X, Eraser, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { TRAINING_TYPES, TRAINING_SLOT_ROWS } from "../constants";
import type { FilterState } from "../types";

/**
 * Training Results filter — Figma `Drawer - Filter` (5029:101404) and
 * `Drawer - Filter - Selected` (5029:101408).
 *
 * Panel is 384 wide on `color/background/modal`, a 64-high header carrying the
 * title "Filter" and a `Badge Number` with the total count, then three sections
 * separated by `color/background/divider` rules, then an 80-high footer with
 * `Clear Filter` (secondary) and `Apply Filter` (primary), both 40 high, r8.
 *
 * The three sections are Figma's, and they are not what this panel used to
 * show. It had four accordion sections — Training Type, Training Slot,
 * Briefing Room, Courseware — and no date range at all. Briefing Room and
 * Courseware are not fields on `TrainingResult`, so they could never have
 * filtered anything; they are gone. Sections are flat here, as in Figma: no
 * chevrons, no collapsing.
 */
interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (key: string, value: string) => void;
  /** Booking Date is a range, not a multi-select, so it sets rather than toggles. */
  onSetRange: (key: "dateFrom" | "dateTo", value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function SubSectionHeader({ children }: { children: React.ReactNode }) {
  // Figma `Sub-Section Header`: 20 high, color/text/default at Semi Bold 14.
  return <h3 className="text-sm font-semibold leading-5 text-default">{children}</h3>;
}

export function FilterPanel({
  open,
  onClose,
  filters,
  onChange,
  onSetRange,
  onApply,
  onClear,
}: FilterPanelProps) {
  const selectedTypes = filters.trainingType ?? [];
  const selectedSlots = filters.trainingSlot ?? [];
  const dateFrom = filters.dateFrom?.[0] ?? "";
  const dateTo = filters.dateTo?.[0] ?? "";

  const totalSelected =
    selectedTypes.length + selectedSlots.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 w-96 bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Drawer Header (64) ───────────────────────────────────────────── */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between gap-6 px-5 border-b border-invert-default">
          <div className="flex items-center gap-2">
            {/* Figma says "Filter", singular. */}
            <span className="text-base font-semibold text-default">Filter</span>
            {totalSelected > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-4 px-1.5 rounded-full border border-base bg-primary-default text-invert-default text-xs font-semibold">
                {totalSelected}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-default hover:bg-default-hovered transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Booking Date — two date inputs side by side, 164 each in Figma. */}
          <section className="flex flex-col gap-2">
            <SubSectionHeader>Booking Date</SubSectionHeader>
            <div className="flex gap-4">
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => onSetRange("dateFrom", e.target.value)}
                wrapperClassName="flex-1 min-w-0"
              />
              <Input
                label="To"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onSetRange("dateTo", e.target.value)}
                wrapperClassName="flex-1 min-w-0"
              />
            </div>
          </section>

          <div className="h-px bg-divider" />

          {/* Training Type(s) — Figma uses `Chip Advanced`, not checkboxes. */}
          <section className="flex flex-col gap-2">
            <SubSectionHeader>Training Type(s)</SubSectionHeader>
            <div className="flex flex-wrap gap-2">
              {TRAINING_TYPES.map((type) => {
                const active = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange("trainingType", type)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-invert-soft border-primary text-primary"
                        : "bg-surface border-invert-default text-default hover:bg-default-hovered",
                    )}
                  >
                    {active && <Check size={14} />}
                    {type}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-px bg-divider" />

          {/* Training Slot — Figma lays these out two per row. */}
          <section className="flex flex-col gap-2">
            <SubSectionHeader>Training Slot</SubSectionHeader>
            <div className="flex flex-col">
              {TRAINING_SLOT_ROWS.map((row, i) => (
                <div key={i} className="flex gap-4">
                  {row.map((slot) => (
                    <div key={slot} className="flex-1 min-w-0">
                      <Checkbox
                        id={`slot-${slot}`}
                        name={`slot-${slot}`}
                        size={18}
                        checked={selectedSlots.includes(slot)}
                        onChange={() => onChange("trainingSlot", slot)}
                        label={slot}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer (80) ──────────────────────────────────────────────────── */}
        <div className="h-20 flex-shrink-0 flex items-center gap-3 px-5 border-t border-invert-default">
          <button
            onClick={onClear}
            className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
          >
            <Eraser size={18} />
            Clear Filter
          </button>
          <button
            onClick={onApply}
            className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
          >
            <Check size={18} />
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}

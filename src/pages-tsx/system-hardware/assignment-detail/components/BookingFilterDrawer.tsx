import { useState } from "react";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { Icon } from "@/components/icon";
import {
  COURSEWARE_OPTIONS,
  EMPTY_BOOKING_FILTERS,
  TRAINING_SLOT_OPTIONS,
  countBookingFilters,
} from "../constants";
import type { BookingFilters, TrainingSlot } from "../types";

/*
 * Assignment Details filter — Figma `Drawer - Filter` (6994:180846), opened
 * from the section's Filter button (6994:179741). Three sections in Figma's
 * order: Booking Date (From / To), Training Slot (2-column checkboxes),
 * Courseware (Search... + checkbox list). Footer Clear Filter · Apply Filter,
 * live-apply like the Assignment List drawer.
 */
function SubSectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold leading-5 text-default">{children}</h3>;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function BookingFilterDrawer({
  isOpen,
  filters,
  onApply,
  onClose,
}: {
  isOpen: boolean;
  filters: BookingFilters;
  onApply: (f: BookingFilters) => void;
  onClose: () => void;
}) {
  const [cwQuery, setCwQuery] = useState("");
  const total = countBookingFilters(filters);
  const cwOptions = COURSEWARE_OPTIONS.filter((c) =>
    c.toLowerCase().includes(cwQuery.trim().toLowerCase()),
  );

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Filter
          {total > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-4 px-1.5 rounded-full border border-base bg-primary-default text-invert-default text-xs font-semibold">
              {total}
            </span>
          )}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => onApply(EMPTY_BOOKING_FILTERS)}
            className="h-10 rounded-lg border border-invert-default bg-surface px-5 text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
          >
            Clear Filter
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg bg-primary-default px-5 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Apply Filter
          </button>
        </>
      }
    >
      <section className="flex flex-col gap-2">
        <SubSectionHeader>Booking Date</SubSectionHeader>
        <div className="flex gap-4">
          <Input
            label="From"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onApply({ ...filters, dateFrom: e.target.value })}
            wrapperClassName="flex-1 min-w-0"
          />
          <Input
            label="To"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => onApply({ ...filters, dateTo: e.target.value })}
            wrapperClassName="flex-1 min-w-0"
          />
        </div>
      </section>

      <div className="h-px bg-divider" />

      <section className="flex flex-col gap-2">
        <SubSectionHeader>Training Slot</SubSectionHeader>
        <div className="grid grid-cols-2">
          {TRAINING_SLOT_OPTIONS.map((slot: TrainingSlot) => (
            <Checkbox
              key={slot}
              id={`asgd-filter-slot-${slot}`}
              name={`asgd-filter-slot-${slot}`}
              size={18}
              label={slot}
              checked={filters.slots.includes(slot)}
              onChange={() => onApply({ ...filters, slots: toggle(filters.slots, slot) })}
            />
          ))}
        </div>
      </section>

      <div className="h-px bg-divider" />

      <section className="flex flex-col gap-2">
        <SubSectionHeader>Courseware</SubSectionHeader>
        <Input
          placeholder="Search..."
          value={cwQuery}
          onChange={(e) => setCwQuery(e.target.value)}
          prefixIcon={<Icon name="search" size={16} />}
        />
        <div className="flex flex-col">
          {cwOptions.map((cw) => (
            <Checkbox
              key={cw}
              id={`asgd-filter-cw-${cw}`}
              name={`asgd-filter-cw-${cw}`}
              size={18}
              label={cw}
              checked={filters.courseware.includes(cw)}
              onChange={() => onApply({ ...filters, courseware: toggle(filters.courseware, cw) })}
            />
          ))}
        </div>
      </section>
    </Drawer>
  );
}

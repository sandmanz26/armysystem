import { cn } from "@/lib/utils";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import type { AssignmentVariant } from "../../assignment-detail/types";

/*
 * Assignment List filter — Figma `Drawer - Filter` (5867:136698) and
 * `Drawer - Filter - Selected` (5867:136702). Drawer 384 wide (was 360),
 * built by hand instead of the shared `Drawer`.
 *
 * Three sections, in Figma's order — not what this drawer used to show
 * (a single flat "Assignment Type" checkbox list, no date range, no base
 * station filter at all):
 *   Issued Date        From / To, mm/dd/yyyy
 *   Assignment Type     a `Chip Advanced` RADIO group — single choice, not
 *                       checkboxes — of Booking / Administration /
 *                       Maintenance. (Figma's own chip literally reads
 *                       "Assignment", not "Administration" — the only chip
 *                       whose label doesn't match any real assignmentType or
 *                       column value anywhere else in this file; read as a
 *                       content typo for "Administration" and kept consistent
 *                       with `variantOf`'s already-established 3-way grouping.)
 *   Base Station        WPT-01…05, checkboxes (multi-select)
 * Footer: Clear Filter · Apply Filter, same as every other filter drawer in
 * this app.
 */

export const BASE_STATIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05"] as const;

export interface AssignmentFilters {
  /** Single choice — Figma's Assignment Type section is a radio group. */
  assignmentType: AssignmentVariant | "";
  baseStations: string[];
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_ASSIGNMENT_FILTERS: AssignmentFilters = {
  assignmentType: "",
  baseStations: [],
  dateFrom: "",
  dateTo: "",
};

export function countAssignmentFilters(f: AssignmentFilters): number {
  return (
    f.baseStations.length +
    (f.assignmentType ? 1 : 0) +
    (f.dateFrom ? 1 : 0) +
    (f.dateTo ? 1 : 0)
  );
}

interface AssignmentFilterDrawerProps {
  isOpen: boolean;
  filters: AssignmentFilters;
  onApply: (f: AssignmentFilters) => void;
  onClose: () => void;
}

function SubSectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold leading-5 text-default">{children}</h3>;
}

const ASSIGNMENT_TYPE_OPTIONS: { value: AssignmentVariant; label: string }[] = [
  { value: "Booking", label: "Booking" },
  { value: "Administration", label: "Administration" },
  { value: "Maintenance", label: "Maintenance" },
];

export function AssignmentFilterDrawer({
  isOpen,
  filters,
  onApply,
  onClose,
}: AssignmentFilterDrawerProps) {
  const totalSelected = countAssignmentFilters(filters);

  const toggleBaseStation = (station: string) => {
    const next = filters.baseStations.includes(station)
      ? filters.baseStations.filter((s) => s !== station)
      : [...filters.baseStations, station];
    onApply({ ...filters, baseStations: next });
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Filter
          {totalSelected > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-4 px-1.5 rounded-full border border-base bg-primary-default text-invert-default text-xs font-semibold">
              {totalSelected}
            </span>
          )}
        </span>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => onApply(EMPTY_ASSIGNMENT_FILTERS)}
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
      {/* Issued Date */}
      <section className="flex flex-col gap-2">
        <SubSectionHeader>Issued Date</SubSectionHeader>
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

      {/* Assignment Type — single-select chips */}
      <section className="flex flex-col gap-2">
        <SubSectionHeader>Assignment Type</SubSectionHeader>
        <div className="flex flex-wrap gap-2">
          {ASSIGNMENT_TYPE_OPTIONS.map(({ value, label }) => {
            const active = filters.assignmentType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onApply({ ...filters, assignmentType: active ? "" : value })}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center h-10 px-4 rounded-lg border text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-invert-soft border-primary text-primary"
                    : "bg-surface border-invert-default text-default hover:bg-default-hovered",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-divider" />

      {/* Base Station */}
      <section className="flex flex-col gap-2">
        <SubSectionHeader>Base Station</SubSectionHeader>
        <div className="flex flex-col">
          {BASE_STATIONS.map((station) => (
            <Checkbox
              key={station}
              id={`assignment-filter-station-${station}`}
              name={`assignment-filter-station-${station}`}
              size={18}
              label={station}
              checked={filters.baseStations.includes(station)}
              onChange={() => toggleBaseStation(station)}
            />
          ))}
        </div>
      </section>
    </Drawer>
  );
}

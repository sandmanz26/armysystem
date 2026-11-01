import { useEffect, useState } from "react";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";

/*
 * Operational Availability Details → Bookings tab filter.
 * Figma section `Filter` (8050:156460): `Drawer - Filter` (8050:156461),
 * `Drawer - Filter - Selected` (8050:156465), `List - Filter Applied`
 * (8050:156469), `List - Filter Applied - Empty` (8050:156484).
 *
 * Content (`Filter - WPT - Operational Availability`, 344 wide, sections 32 apart):
 *   Downtime       `Chip Advanced` single choice — With downtime · No downtime;
 *                  the selected chip carries `Icon / check`.
 *   Base Station   checkboxes WPT-01…05 in rows of two (164 + 16 + 164).
 * Footer: Clear Filter · Apply Filter. Selections are held as a draft and only
 * reach the table on Apply Filter; Clear Filter empties and applies at once.
 */

export const OA_BASE_STATIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05"] as const;

export type DowntimeFilter = "" | "with" | "without";

export interface OADetailFilters {
  downtime: DowntimeFilter;
  stations: string[];
}

export const EMPTY_OA_FILTERS: OADetailFilters = { downtime: "", stations: [] };

export function countOAFilters(f: OADetailFilters): number {
  return (f.downtime ? 1 : 0) + f.stations.length;
}

const DOWNTIME_OPTIONS: { value: Exclude<DowntimeFilter, "">; label: string }[] = [
  { value: "with", label: "With downtime" },
  { value: "without", label: "No downtime" },
];

interface FilterDrawerProps {
  open: boolean;
  filters: OADetailFilters;
  onApply: (f: OADetailFilters) => void;
  onClose: () => void;
}

export function FilterDrawer({ open, filters, onApply, onClose }: FilterDrawerProps) {
  const [draft, setDraft] = useState<OADetailFilters>(filters);

  // Re-seed the draft from the applied filters every time the drawer opens.
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const count = countOAFilters(draft);
  const toggleStation = (s: string) =>
    setDraft((d) => ({
      ...d,
      stations: d.stations.includes(s) ? d.stations.filter((x) => x !== s) : [...d.stations, s],
    }));

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
            onClick={() => { setDraft(EMPTY_OA_FILTERS); onApply(EMPTY_OA_FILTERS); onClose(); }}
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
        <section className="flex flex-col">
          <h3 className="text-sm font-semibold leading-5 text-default">Downtime</h3>
          <ChipAdvancedGroup className="pt-3">
            {DOWNTIME_OPTIONS.map(({ value, label }) => (
              <ChipAdvanced
                key={value}
                label={label}
                checkIcon
                selected={draft.downtime === value}
                onSelect={() => setDraft((d) => ({ ...d, downtime: d.downtime === value ? "" : value }))}
              />
            ))}
          </ChipAdvancedGroup>
        </section>

        <section className="flex flex-col">
          <h3 className="text-sm font-semibold leading-5 text-default">Base Station</h3>
          <div className="grid grid-cols-2 gap-x-4 pt-3">
            {OA_BASE_STATIONS.map((s) => (
              <Checkbox
                key={s}
                id={`oa-filter-station-${s}`}
                name={`oa-filter-station-${s}`}
                size={18}
                label={s}
                checked={draft.stations.includes(s)}
                onChange={() => toggleStation(s)}
              />
            ))}
          </div>
        </section>
      </div>
    </Drawer>
  );
}

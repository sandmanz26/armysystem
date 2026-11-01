import { useState } from "react";
import { Formik } from "formik";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";
import type { ResultKind, SessionStation } from "../session";

export interface ResultFilter {
  details: number[];
  lanes: string[];
  results: ResultKind[];
}

export const EMPTY_FILTER: ResultFilter = { details: [], lanes: [], results: [] };

export const filterCount = (f: ResultFilter) => f.details.length + f.lanes.length + f.results.length;

const laneKey = (station: string, lane: number) => `${station}|${lane}`;

// Figma chip copy is "Marksmanship" while the result badge reads "Marksman"
// (5752:71064 vs 5552:216821) — kept as drawn.
const RESULT_CHIPS: { label: string; value: ResultKind }[] = [
  { label: "Marksmanship", value: "Marksman" },
  { label: "Passed", value: "Passed" },
  { label: "Failed", value: "Failed" },
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/** Figma `Drawer - Filter` / `Drawer - Filter - Selected` (5752:71060/71064). */
export function FilterDrawer({
  open,
  value,
  detailNumbers,
  stations,
  onClose,
  onApply,
}: {
  open: boolean;
  value: ResultFilter;
  detailNumbers: number[];
  stations: SessionStation[];
  onClose: () => void;
  onApply: (f: ResultFilter) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  if (!open) return null;

  return (
    <Formik initialValues={value} enableReinitialize onSubmit={onApply}>
      {({ values, setValues, submitForm }) => {
        const n = filterCount(values);
        return (
          <Drawer
            open
            onClose={onClose}
            title={
              <span className="flex items-center gap-2">
                Filter
                {n > 0 && <span className="rounded-full bg-primary-default px-1.5 text-xs font-medium text-invert-default">{n}</span>}
              </span>
            }
            footer={
              <>
                <button type="button" onClick={() => setValues(EMPTY_FILTER)} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
                  Clear Filter
                </button>
                <button type="button" onClick={submitForm} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors">
                  Apply Filter
                </button>
              </>
            }
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-default">Detail List</span>
              <div className="grid grid-cols-2">
                {detailNumbers.map((d) => (
                  <Checkbox
                    key={d}
                    label={`Detail ${d}`}
                    checked={values.details.includes(d)}
                    onChange={() => setValues({ ...values, details: toggle(values.details, d) })}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-divider" />

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-default">Base Station &amp; Lane</span>
              {stations.map((st) => {
                const keys = st.activeLanes.map((l) => laneKey(st.label, l));
                const picked = keys.filter((k) => values.lanes.includes(k));
                const isOpen = expanded.has(st.label);
                return (
                  <div key={st.label} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => {
                        const next = new Set(prev);
                        next.has(st.label) ? next.delete(st.label) : next.add(st.label);
                        return next;
                      })}
                      className="flex h-9 items-center gap-2 text-sm font-medium text-default"
                    >
                      {isOpen ? <ChevronDown size={16} className="text-body" /> : <ChevronRight size={16} className="text-body" />}
                      {st.label}
                    </button>
                    {isOpen && (
                      <div className="flex flex-col pl-4">
                        <Checkbox
                          label={`All Lanes (${st.label})`}
                          checked={picked.length === keys.length}
                          indeterminate={picked.length > 0 && picked.length < keys.length}
                          onChange={() => setValues({
                            ...values,
                            lanes: picked.length === keys.length
                              ? values.lanes.filter((k) => !keys.includes(k))
                              : [...values.lanes.filter((k) => !keys.includes(k)), ...keys],
                          })}
                        />
                        <div className="grid grid-cols-2 pl-4">
                          {st.activeLanes.map((l) => (
                            <Checkbox
                              key={l}
                              label={`Lane ${l}`}
                              checked={values.lanes.includes(laneKey(st.label, l))}
                              onChange={() => setValues({ ...values, lanes: toggle(values.lanes, laneKey(st.label, l)) })}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-divider" />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-default">Result</span>
              <ChipAdvancedGroup multi>
                {RESULT_CHIPS.map((c) => (
                  <ChipAdvanced
                    key={c.value}
                    multi
                    label={c.label}
                    selected={values.results.includes(c.value)}
                    onSelect={() => setValues({ ...values, results: toggle(values.results, c.value) })}
                  />
                ))}
              </ChipAdvancedGroup>
            </div>
          </Drawer>
        );
      }}
    </Formik>
  );
}

export function matchesFilter(
  f: ResultFilter,
  t: { station: string; lane: number; attempts: { detailNumber: number }[] },
  result: ResultKind | null,
  detailsOfTrainee: number[],
): boolean {
  if (f.details.length && !f.details.some((d) => detailsOfTrainee.includes(d))) return false;
  if (f.lanes.length && !f.lanes.includes(laneKey(t.station, t.lane))) return false;
  if (f.results.length && (!result || !f.results.includes(result))) return false;
  return true;
}

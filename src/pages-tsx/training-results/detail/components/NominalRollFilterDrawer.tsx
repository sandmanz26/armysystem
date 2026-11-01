import { Formik } from "formik";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";

/*
 * Filter drawer for the Nominal Roll tab. Figma only draws one filter drawer
 * on the Training Result Details page — `Drawer - Filter` (5834:189809): a
 * single "Rank" section of checkboxes in two columns, "Clear Filter" /
 * "Apply Filter" in the footer. The Nominal Roll frame (5834:189825) shows
 * the same `Filter` button, so it reuses that drawer's content.
 */

/** Rank options exactly as listed in 5834:189809. */
export const RANK_OPTIONS = [
  "Mr", "Mrs", "Ms", "REC", "PFC", "LCP", "CPL", "CFC", "SCT", "3SG", "2SG", "1SG",
  "SSG", "MSG", "3WO", "2WO", "1WO", "MWO", "SWO", "CWO", "OCT", "2LT", "LTA", "CPT",
  "MAJ", "LTC", "SLTC", "COL", "BG", "MG", "LG",
];

export interface NominalRollFilter {
  ranks: string[];
}

export const EMPTY_NOMINAL_ROLL_FILTER: NominalRollFilter = { ranks: [] };

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function NominalRollFilterDrawer({
  open,
  value,
  onClose,
  onApply,
}: {
  open: boolean;
  value: NominalRollFilter;
  onClose: () => void;
  onApply: (f: NominalRollFilter) => void;
}) {
  if (!open) return null;

  return (
    <Formik initialValues={value} enableReinitialize onSubmit={(v) => { onApply(v); onClose(); }}>
      {({ values, setValues, submitForm }) => (
        <Drawer
          open
          onClose={onClose}
          title={
            <span className="flex items-center gap-2">
              Filter
              {values.ranks.length > 0 && (
                <span className="rounded-full bg-primary-default px-1.5 text-xs font-medium text-invert-default">
                  {values.ranks.length}
                </span>
              )}
            </span>
          }
          footer={
            <>
              <button
                type="button"
                onClick={() => setValues(EMPTY_NOMINAL_ROLL_FILTER)}
                className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors"
              >
                Clear Filter
              </button>
              <button
                type="button"
                onClick={submitForm}
                className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
              >
                Apply Filter
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-default">Rank</span>
            <div className="grid grid-cols-2">
              {RANK_OPTIONS.map((r) => (
                <Checkbox
                  key={r}
                  id={`nominal-roll-rank-${r}`}
                  label={r}
                  checked={values.ranks.includes(r)}
                  onChange={() => setValues({ ranks: toggle(values.ranks, r) })}
                />
              ))}
            </div>
          </div>
        </Drawer>
      )}
    </Formik>
  );
}

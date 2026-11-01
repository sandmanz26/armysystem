import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";
import { RadioGroup } from "@/components/radio";
import { Toast } from "@/components/toast";

/*
 * Data Export — Figma page `Data Export` (5103:61278).
 *   Data Export            5103:61562  (nothing selected)
 *   Data Export - Filled   5103:61590  (custom range + 8 types)
 *   Dropdown - Date Picker 5103:61621
 *
 * Sections, in Figma's order:
 *   Date Range *         Radio Group — Last month / Last 3 months /
 *                        Last 6 months / Custom date range
 *                        → Custom reveals Start Date * and End Date * side by side
 *   Data Type *          Chip Advanced, one horizontal row, ALPHABETICAL order
 *                        (Booking/HUMS/Leaderboard/Operation/SHM/Trainee/
 *                        Training result/User data), Select All / Deselect All
 *                        link on the right
 *   Export Format *      Radio Group — CSV (.csv) / Excel (.xlsx) / PDF (.pdf)
 *   Filename *           Input, caption "File will be exported as <name>.<ext>"
 *   Summary              "Select at least one data type to enable Export." with
 *                        Export disabled, or "N data types selected · CSV format"
 *
 * ⚠️ Re-verified 30 Sep 2026 — 4 mismatches found despite a prior, confident-
 * sounding pass (this same header comment previously claimed "Select Date
 * Range" and "JSON (.json)" as correct; neither was ever actually checked
 * against Figma's own text nodes — see figma-slicing PITFALLS.md #13/#20's
 * "unverified code comment" pattern, recurring here a further time):
 *   - Label is "Date Range", not "Select Date Range".
 *   - Data Type chips were NOT alphabetical in the code (User/Training
 *     result/Trainee/… — an arbitrary order); Figma's own order is strictly
 *     alphabetical.
 *   - Export Format's third option is "PDF (.pdf)", not "JSON (.json)".
 *   - `Body` SLOT's only child is `Section Layout` — there is no separate
 *     page-level heading above the card. The standalone `<h1>Data Export</h1>`
 *     this file had was an invented duplicate (the same bug class as
 *     PITFALLS.md #17, on a page that pass never swept to), removed — the
 *     card's own Section Header title is the only "Data Export" heading.
 *
 * The checkbox grid this file used to describe is gone: Figma replaced it with
 * a single horizontal Chip Advanced row (26 Sep 2026 developer note, "data type
 * from checkbox to selectable, and change display to horizontal").
 *
 * Colour, read off the frames rather than the screenshot (23 Sep 2026):
 *   Section Layout   fill `color/background/surface lv1` · stroke
 *                    `color/border/invert/default` · radius 12
 *   Summary          a FILLED card, not a divider — `color/background/default/soft`,
 *                    radius 8, padding 16, gap 16. Its text is
 *                    `color/text/default`, NOT text/body
 *   Export enabled   `color/background/primary/default` + `color/text/base`
 *   Export disabled  `color/background/disabled` + `color/text/disabled`
 *   Filename         the field carries a real VALUE in both frames
 *                    (`color/text/default`), not a placeholder — so the default
 *                    name is prefilled here rather than shown greyed out
 *   Caption          `color/text/caption` at 12
 */

const DATE_RANGES = [
  "Last month",
  "Last 3 months",
  "Last 6 months",
  "Custom date range",
] as const;

const DATA_TYPES = [
  "Booking data",
  "HUMS data",
  "Leaderboard data",
  "Operation data",
  "SHM data",
  "Trainee data",
  "Training result",
  "User data",
] as const;

const EXPORT_FORMATS = [
  { value: "CSV", label: "CSV (.csv)", ext: "csv" },
  { value: "Excel", label: "Excel (.xlsx)", ext: "xlsx" },
  { value: "PDF", label: "PDF (.pdf)", ext: "pdf" },
] as const;

export function DataExport() {
  const [dateRange, setDateRange] = useState<string>("Last month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<string>("CSV");
  /** `null` until the user types — Figma ships the default name as a real value. */
  const [filename, setFilename] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const ext = EXPORT_FORMATS.find((f) => f.value === format)?.ext ?? "csv";

  /** Figma's default filename is "<yyyy-mm-dd>-<ext>-data-export". */
  const defaultName = useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return `${d}-${ext}-data-export`;
  }, [ext]);

  const shownName = filename ?? defaultName;
  const effectiveName = shownName.trim() || defaultName;
  const allSelected = selected.size === DATA_TYPES.length;

  const toggleType = (t: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(DATA_TYPES));

  const canExport = selected.size > 0;


  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Section Layout — `Body` SLOT's only child; there is no separate
            page-level heading above the card in Figma. */}
        <div className="bg-surface rounded-xl border border-invert-default">
          <div className="p-5">
            <h2 className="text-base font-semibold text-default">Data Export</h2>
          </div>

          <div className="flex flex-col gap-6 px-5 pb-5">
            {/* Select Date Range */}
            <div className="flex flex-col gap-4">
              <RadioGroup
                name="date-range"
                label="Date Range"
                required
                options={DATE_RANGES}
                value={dateRange}
                onChange={setDateRange}
              />

              {/* Figma reveals the two date fields only for "Custom date range" */}
              {dateRange === "Custom date range" && (
                <div className="flex flex-wrap gap-4">
                  <Input
                    type="date"
                    label="Start Date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    wrapperClassName="w-[520px] max-w-full"
                  />
                  <Input
                    type="date"
                    label="End Date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    wrapperClassName="w-[520px] max-w-full"
                  />
                </div>
              )}
            </div>

            {/*
              Data Type — Figma redesigned this from a two-column checkbox grid
              into a horizontal `Chip Advanced` row (`Data Type` frame on
              `Data Export - Filled`, 5103:61590), with the Select All /
              Deselect All action as a `Link` on the right rather than a
              checkbox occupying the first grid slot. The label is "Data Type",
              not "Select Data Type".
            */}
            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-0.5 text-sm font-medium text-default">
                  Data Type
                  <span className="text-danger">*</span>
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </div>
              <ChipAdvancedGroup multi>
                {DATA_TYPES.map((t) => (
                  <ChipAdvanced
                    key={t}
                    multi
                    label={t}
                    selected={selected.has(t)}
                    onSelect={() => toggleType(t)}
                  />
                ))}
              </ChipAdvancedGroup>
            </div>

            {/* Export Format */}
            <RadioGroup
              name="export-format"
              label="Export Format"
              required
              options={EXPORT_FORMATS.map((f) => ({ value: f.value, label: f.label }))}
              value={format}
              onChange={setFormat}
            />

            {/* Filename */}
            <Input
              label="Filename"
              required
              value={shownName}
              onChange={(e) => setFilename(e.target.value)}
              caption={`File will be exported as ${effectiveName}.${ext}`}
              wrapperClassName="max-w-[1056px]"
            />

            {/* Summary — Figma swaps the hint for a count once something is picked */}
            <div className="flex items-center justify-between gap-4 rounded-lg bg-default-soft p-4">
              <span className="text-sm text-default">
                {canExport
                  ? `${selected.size} data type${selected.size === 1 ? "" : "s"} selected · ${format} format`
                  : "Select at least one data type to enable Export."}
              </span>
              <Button
                disabled={!canExport}
                onClick={() => setToast(`${effectiveName}.${ext} exported`)}
                className={
                  canExport
                    ? "w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
                    : "w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-disabled text-disabled text-sm font-semibold cursor-not-allowed"
                }
              >
                <Download size={18} />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

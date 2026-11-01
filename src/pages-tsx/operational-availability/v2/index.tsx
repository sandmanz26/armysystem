import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Icon } from "@/components/icon";
import { Pagination } from "@/components/ui/Pagination";
import {
  MonthRangePicker,
  formatMonthRange,
  isInMonthRange,
  type MonthRange,
} from "@/components/month-range-picker";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "./constants";
import { OA_MONTHS, type OAMonthRow } from "./data";
import { parseMonthLabel, formatHMS } from "./utils";
import { AOBadge } from "./components/AOBadge";
import { InfoHeader } from "./components/InfoHeader";

/*
 * Operational Availability — Figma page `Operational Availability`
 * (`5004:113419`): `List - Filled` (5119:297872), `List - Empty` (5119:297854),
 * `Tooltip` (6915:52426) and the `Select Date` section (5119:297890). This is
 * the page the sidebar links to (`/operational-availability-2`); the older
 * `/operational-availability` route is a separate page and is untouched.
 *
 * F-005 (19 Oct 2026):
 *   · OA-1 No page title outside the card — the card's Section Header holds the
 *     title + subtitle on the left and Search + Select Date on the right.
 *   · OA-2 Columns No. · Month · Total Activity UT ⓘ · Total Activity DT ⓘ ·
 *     Operational Availability (AO) · Actions (👁). The chevron expand is gone;
 *     the 👁 opens the month's detail page (./detail, 8033:293789), which now
 *     carries the per-booking / base-station / lane breakdown.
 *   · OA-3 Durations as "49h 52m 18s".
 *   · OA-4 AO cell = percentage (2 dp) + Compliant / Non-compliant pill.
 *
 * F-007 OA-7: Select Date is Figma's `Date Picker - Month Filter`
 * (5119:297891 / 297910 / 297929 / 297947) — a month-range grid, not a day
 * calendar. Applying keeps the months inside the range and the button reads
 * "Jan - Apr 2026"; Clear restores the full list. Months after the newest
 * (and before the oldest) month in the list are Inactive, as Figma greys
 * September–December 2026 when the list ends at August 2026.
 */

const MONTH_KEYS = OA_MONTHS.map((r) => parseMonthLabel(r.month));
const byKey = (a: { year: number; month: number }) => a.year * 12 + a.month;
const LATEST_MONTH = MONTH_KEYS.reduce((a, b) => (byKey(b) > byKey(a) ? b : a));
const EARLIEST_MONTH = MONTH_KEYS.reduce((a, b) => (byKey(b) < byKey(a) ? b : a));

export function OperationalAvailability2() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [selectedRange, setSelectedRange] = useState<MonthRange | null>(null);
  const [pickerOpen, setPickerOpen]     = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = OA_MONTHS.filter((r) => {
    if (search && !r.month.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedRange && !isInMonthRange(parseMonthLabel(r.month), selectedRange)) return false;
    return true;
  });

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Figma column widths (sum 1096): 56 · 296 · 200 · 200 · 240 (80 % + 160 pill) · 104.
  const columns: ColumnDef<OAMonthRow, any>[] = [
    {
      id: "no",
      width: 56,
      minWidth: 56,
      header: () => "No.",
      cell: (info: any) => (
        <span className="text-sm text-body">
          {(currentPage - 1) * PER_PAGE + info.row.index + 1}
        </span>
      ),
    } as ColumnDef<OAMonthRow, any>,
    {
      accessorKey: "month",
      width: 296,
      minWidth: 296,
      header: () => "Month",
      cell: (info: any) => <span className="text-sm text-default">{info.getValue()}</span>,
    } as ColumnDef<OAMonthRow, any>,
    {
      accessorKey: "utSeconds",
      width: 200,
      minWidth: 200,
      header: () => <InfoHeader label="Total Activity UT" tooltip="Total Activity Up Time" />,
      cell: (info: any) => <span className="text-sm text-default">{formatHMS(info.getValue())}</span>,
    } as ColumnDef<OAMonthRow, any>,
    {
      accessorKey: "dtSeconds",
      width: 200,
      minWidth: 200,
      header: () => <InfoHeader label="Total Activity DT" tooltip="Total Activity Down Time" />,
      cell: (info: any) => <span className="text-sm text-default">{formatHMS(info.getValue())}</span>,
    } as ColumnDef<OAMonthRow, any>,
    {
      accessorKey: "ao",
      width: 240,
      minWidth: 240,
      header: () => "Operational Availability (AO)",
      cell: (info: any) => (
        <div className="flex items-center gap-10">
          <span className="w-10 text-sm text-default">{info.getValue().toFixed(2)}%</span>
          <AOBadge value={info.getValue()} />
        </div>
      ),
    } as ColumnDef<OAMonthRow, any>,
    {
      id: "actions",
      width: 104,
      minWidth: 104,
      header: () => <span className="block w-full text-right">Actions</span>,
      cell: (info: any) => (
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={`View ${info.row.original.month}`}
            onClick={() => navigate(`/operational-availability-2/${info.row.original.id}`)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-body hover:bg-default-soft transition-colors"
          >
            <Icon name="eye" size={16} />
          </button>
        </div>
      ),
    } as ColumnDef<OAMonthRow, any>,
  ];

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6">
        {/* Figma `Section Layout - Table`: one card, no page title above it. */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          {/* Figma `Section Header` — padding 20, gap 20. */}
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-base font-semibold leading-6 text-default">Operational Availability</h1>
              <p className="text-xs leading-4 text-body">Monthly summary of system uptime and downtime</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative w-60">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none"
                />
                <InputCustom
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-body border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                />
              </div>

              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setPickerOpen((o) => !o)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
                    selectedRange ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
                  )}
                >
                  <Icon name="calendar" size={16} />
                  {selectedRange ? formatMonthRange(selectedRange) : "Select Date"}
                </button>

                {pickerOpen && (
                  <MonthRangePicker
                    value={selectedRange}
                    min={EARLIEST_MONTH}
                    max={LATEST_MONTH}
                    onApply={(r) => { setSelectedRange(r); setCurrentPage(1); }}
                    onClear={() => { setSelectedRange(null); setCurrentPage(1); }}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>

          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={false}
            actionSticky={false}
            tableFixed
          />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { Icon } from "@/components/icon";
import { SortIcon, type SortDir, nextSort, sortBy } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";
import { ActivityLogFilterDrawer, EMPTY_ACTIVITY_FILTERS, countActivityFilters, type ActivityFilters } from "./FilterDrawer";

const PER_PAGE = 10;

// This page lives under the outer MENU rail (not any one programme's own
// sidebar), so a single log stream mixes entries from every programme —
// hence the "Program" column/filter: without it there's no way to tell
// whether a given entry belongs to WPT, MST, or TCT.
type Program = "WPT" | "MST" | "TCT" | "TH" | "C/C";

interface LogEntry {
  id: string;
  name: string;
  role: string;
  program: Program;
  module: string;
  date: string;
  description: string;
}

/*
 * Sentences follow Figma `Activity Log` (5029:119114) and its per-module
 * sibling frames (7026:644329…650810): past tense, full stop, "<date>\n<time>"
 * without seconds. Figma's own rows carry `{booking_id}`-style placeholders;
 * the mock fills them with realistic ids.
 */
const activityLogs: LogEntry[] = [
  { id: "l1",  name: "System",        role: "System",       program: "WPT", module: "Booking",  date: "6 Jun 2026\n11:09 PM",  description: "Booking #260606-WPT001 was created." },
  { id: "l2",  name: "System",        role: "System",       program: "WPT", module: "Booking",  date: "25 May 2026\n03:45 PM", description: "Booking #260525-WPT002 status was changed to Ongoing." },
  { id: "l3",  name: "Olivia Carter", role: "System Admin", program: "MST", module: "Booking",  date: "20 May 2026\n11:30 AM", description: "Booking #260520-MST004 status was changed to Completed." },
  { id: "l4",  name: "Olivia Carter", role: "System Admin", program: "WPT", module: "Training", date: "15 May 2026\n07:15 PM", description: "Training results were generated for Unit 3SIR." },
  { id: "l5",  name: "Olivia Carter", role: "System Admin", program: "WPT", module: "SHM",      date: "1 May 2026\n09:00 AM",  description: "Assignment #ASN-001 was updated following an asset return." },
  { id: "l6",  name: "Olivia Carter", role: "System Admin", program: "TCT", module: "SHM",      date: "29 Apr 2026\n01:20 PM", description: "Reader ID - 250101-RFR001 : Siren notification has been acknowledge and turn off" },
  { id: "l7",  name: "Olivia Carter", role: "System Admin", program: "TCT", module: "SHM",      date: "28 Apr 2026\n05:55 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l8",  name: "Olivia Carter", role: "System Admin", program: "WPT", module: "SHM",      date: "27 Apr 2026\n10:05 AM", description: "3 assets issued to Unit SRN" },
  { id: "l9",  name: "System",        role: "System",       program: "TH",  module: "System Health",         date: "26 Apr 2026\n08:00 AM", description: "All system readiness tests passed." },
  { id: "l10", name: "Olivia Carter", role: "System Admin", program: "C/C", module: "User Management",       date: "25 Apr 2026\n02:10 PM", description: "User Mia Murphy was updated." },
  { id: "l11", name: "Olivia Carter", role: "System Admin", program: "WPT", module: "Reports & Data Exports", date: "24 Apr 2026\n04:30 PM", description: "Booking Summary Report was generated." },
  { id: "l12", name: "System",        role: "System",       program: "WPT", module: "Settings",              date: "23 Apr 2026\n09:15 AM", description: "Briefing Room settings were updated." },
];

function parseLogDate(value: string) {
  const datePart = value.split("\n")[0]?.trim();
  if (!datePart) return null;
  const parsed = new Date(datePart);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// ── Hidden: single-day date picker (activityLogSingleDayPicker) ───────────────
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatButtonDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function buildCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, monthIndex, 1 - offset);
  return Array.from({ length: 42 }, (_, idx) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + idx);
    return day;
  });
}

const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const isoKey = (iso: string) => Number(iso.replace(/-/g, ""));

const columnHelper = createColumnHelper<LogEntry>();

/*
 * Figma colours these per VALUE, not one colour for the whole column
 * (`Activity Log` 5029:119114): the programme and the module each get their
 * own Badge tone. The code painted every programme the same red and every
 * module the same pink — and `pink` is not a token in this project at all.
 */
const PROGRAM_TONE: Record<string, string> = {
  WPT: "bg-danger-invert-default text-danger",
  MST: "bg-info-invert-default text-info",
  TCT: "bg-success-invert-default text-success",
  TH: "bg-purple-invert-default text-purple",
  "C/C": "bg-warning-invert-default text-warning",
};
const MODULE_TONE: Record<string, string> = {
  Booking: "bg-info-invert-default text-info",
  Training: "bg-purple-invert-default text-purple",
  SHM: "bg-danger-invert-default text-danger",
  "System Health": "bg-success-invert-default text-success",
};
const NEUTRAL_TONE = "bg-default-default text-default";

export function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_ACTIVITY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount = countActivityFilters(filters);

  // Hidden features — only reachable when the matching flag is true.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [showExportDrop, setShowExportDrop] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExportDrop) return;
    const h = (e: MouseEvent) => { if (!exportRef.current?.contains(e.target as Node)) setShowExportDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showExportDrop]);

  useEffect(() => {
    if (!showDatePicker) return;
    const h = (e: MouseEvent) => { if (!datePickerRef.current?.contains(e.target as Node)) setShowDatePicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showDatePicker]);

  const calendarDays = useMemo(() => buildCalendarDays(pickerMonth), [pickerMonth]);
  const currentMonthTitle = pickerMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = activityLogs.filter((l) => {
    const matchSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Date range (Figma Filter → Date: From / To, both inclusive, either may be empty).
    const parsed = parseLogDate(l.date);
    const matchDate =
      (!filters.from && !filters.to) ||
      (!!parsed &&
        (!filters.from || dayKey(parsed) >= isoKey(filters.from)) &&
        (!filters.to || dayKey(parsed) <= isoKey(filters.to)));
    // Single-day picker (hidden feature) — ANDs with the drawer's range filter.
    const matchSingleDay =
      !HIDDEN_FEATURES.activityLogSingleDayPicker || !selectedDate || (!!parsed && sameCalendarDay(parsed, selectedDate));
    const matchProgram = filters.programs.length === 0 || filters.programs.includes(l.program);
    const matchModule = filters.modules.length === 0 || filters.modules.includes(l.module);

    return matchSearch && matchDate && matchSingleDay && matchProgram && matchModule;
  });

  const sorted = sortField ? sortBy(filtered, sortField as keyof LogEntry, sortDir) : filtered;
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const dateStamp = new Date().toISOString().slice(0, 10);

  // Hidden feature (activityLogCsvXlsExport): CSV + XLS exports.
  const handleExportCSV = () => {
    const headers = ["Name", "Role", "Program", "Module", "Date", "Description"];
    const rows = sorted.map((l) => [l.name, l.role, l.program, l.module, l.date.replace("\n", " "), l.description]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `activity-log-${dateStamp}.csv`);
    setShowExportDrop(false);
  };

  const handleExportXLS = () => {
    const rows = sorted
      .map(
        (l) =>
          `<tr><td>${l.name}</td><td>${l.role}</td><td>${l.program}</td><td>${l.module}</td>` +
          `<td>${l.date.replace("\n", " ")}</td><td>${l.description}</td></tr>`,
      )
      .join("");
    const html =
      `<table><thead><tr><th>Name</th><th>Role</th><th>Program</th><th>Module</th><th>Date</th><th>Description</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>`;
    triggerDownload(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }), `activity-log-${dateStamp}.xls`);
    setShowExportDrop(false);
  };

  /* Figma toolbar is `Export (PDF)` — a single-format button, so it goes straight to the PDF print view. */
  const handleExportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = sorted
      .map(
        (l) =>
          `<tr><td><strong>${l.name}</strong><br><span style="color:#667085;font-size:11px">${l.role}</span></td>` +
          `<td>${l.program}</td>` +
          `<td><span style="background:#fce7f3;color:#db2777;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${l.module}</span></td>` +
          `<td>${l.date.replace("\n", "<br>")}</td>` +
          `<td>${l.description}</td></tr>`,
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Activity Log</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#344054}
        h1{font-size:18px;font-weight:700;color:#115e59;margin-bottom:4px}
        .meta{font-size:11px;color:#667085;margin-bottom:20px}
        table{width:100%;border-collapse:collapse}
        th{background:#115e59;color:white;padding:8px 12px;text-align:left;font-size:11px;font-weight:600}
        td{padding:9px 12px;border-bottom:1px solid #EAECF0;font-size:12px;vertical-align:top}
        tr:nth-child(even) td{background:#F9FAFB}
        @media print{body{padding:0}}
      </style></head><body>
      <h1>Activity Log</h1>
      <div class="meta">Exported on ${new Date().toLocaleString("en-SG")} · ${sorted.length} record${sorted.length !== 1 ? "s" : ""}</div>
      <table><thead><tr><th>Name / Role</th><th>Program</th><th>Module</th><th>Date</th><th>Description</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=()=>{window.print();}<\/script>
      </body></html>`);
    win.document.close();
    setShowExportDrop(false);
  };

  const columns = [
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info: any) => (
        <div onClick={() => {}}>
          <div className="text-default font-medium">{info.getValue()}</div>
          <div className="text-disabled text-xs">{info.row.original.role}</div>
        </div>
      ),
      minWidth: "160px",
    } as any),
    columnHelper.accessor("program", {
      header: () => "Program",
      cell: (info: any) => (
        <div onClick={() => {}}>
          <span className={cn(
            "inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5",
            PROGRAM_TONE[info.getValue() as string] ?? NEUTRAL_TONE,
          )}>
            {info.getValue()}
          </span>
        </div>
      ),
      minWidth: "90px",
    } as any),
    columnHelper.accessor("module", {
      header: () => "Module",
      cell: (info: any) => (
        <div onClick={() => {}}>
          <span className={cn(
            "inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5",
            MODULE_TONE[info.getValue() as string] ?? NEUTRAL_TONE,
          )}>
            {info.getValue()}
          </span>
        </div>
      ),
      minWidth: "120px",
    } as any),
    columnHelper.accessor("date", {
      header: () => (
        <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-primary transition-colors">
          Date <SortIcon active={sortField === "date"} dir={sortDir} />
        </button>
      ),
      cell: (info: any) => <div className="text-sm text-default whitespace-pre-line">{info.getValue()}</div>,
      minWidth: "160px",
    } as any),
    columnHelper.accessor("description", {
      header: () => "Description",
      cell: (info: any) => <div className="text-sm text-default">{info.getValue()}</div>,
    }),
  ];

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Figma has BOTH a page header and a section header inside the card;
            the code only had one, inside the toolbar. */}
        <h1 className="text-xl font-semibold text-default">Activity Log</h1>

        <div className="bg-surface-lv1 rounded-xl border border-invert-default">
          {/* Section Header — Figma toolbar: Search... · Filter · Export (PDF) */}
          <div className="flex items-center justify-between gap-4 px-5 py-5 flex-wrap">
            <h2 className="text-base font-semibold text-default">Activity Log</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-60">
                <Icon name="search" size={22} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
                <InputCustom
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="h-9 w-full rounded-lg border border-invert-default bg-surface py-2 pl-[42px] pr-3 text-sm text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused transition-colors"
                />
              </div>

              {/* Hidden feature (activityLogSingleDayPicker): single-day date picker */}
              {HIDDEN_FEATURES.activityLogSingleDayPicker && (
                <div className="relative" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftDate(selectedDate);
                      setPickerMonth(selectedDate ?? new Date());
                      setShowDatePicker((prev) => !prev);
                    }}
                    className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                  >
                    <Icon name="calendar" size={16} />
                    {selectedDate ? formatButtonDate(selectedDate) : "Select Date"}
                  </button>

                  {showDatePicker && (
                    <div className="absolute right-0 top-[110%] z-50 w-[440px] bg-surface border border-invert-default rounded-xl shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-invert-default flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                          className="p-1.5 rounded-md hover:bg-default-default text-body"
                        >
                          <Icon name="chevron-left" size={16} />
                        </button>
                        <p className="text-lg font-semibold text-default">{currentMonthTitle}</p>
                        <button
                          type="button"
                          onClick={() => setPickerMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                          className="p-1.5 rounded-md hover:bg-default-default text-body"
                        >
                          <Icon name="chevron-right" size={16} />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {WEEKDAY_LABELS.map((label) => (
                            <div key={label} className="text-center text-sm font-medium text-caption">{label}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {calendarDays.map((day) => {
                            const inCurrentMonth = day.getMonth() === pickerMonth.getMonth();
                            const isActive = draftDate ? sameCalendarDay(day, draftDate) : false;
                            return (
                              <button
                                key={day.toISOString()}
                                type="button"
                                onClick={() => setDraftDate(day)}
                                className={
                                  isActive
                                    ? "h-10 rounded-full bg-primary-invert-default text-primary font-semibold"
                                    : inCurrentMonth
                                      ? "h-10 rounded-full text-default hover:bg-default-default"
                                      : "h-10 rounded-full text-disabled"
                                }
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-invert-default flex items-center justify-end gap-2 bg-surface">
                        <button
                          type="button"
                          onClick={() => { const today = new Date(); setDraftDate(today); setPickerMonth(today); }}
                          className="px-4 py-2 text-sm rounded-lg border border-invert-default text-default hover:bg-default-soft"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftDate(null)}
                          className="px-4 py-2 text-sm rounded-lg border border-invert-danger text-danger hover:bg-danger-invert-soft"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDraftDate(selectedDate); setShowDatePicker(false); }}
                          className="px-4 py-2 text-sm rounded-lg border border-invert-default text-default hover:bg-default-soft"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedDate(draftDate); setCurrentPage(1); setShowDatePicker(false); }}
                          className="px-4 py-2 text-sm rounded-lg bg-primary-default text-invert-default hover:bg-primary-hovered"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Figma `Filter Text (Section Header - Right Content)` — outlined 36px button, sliders-horizontal prefix, count suffix once applied. */}
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
                  filterCount > 0 ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
                )}
              >
                <Icon name="sliders-horizontal" size={16} />
                Filter
                {filterCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-base bg-primary-default px-0.5 text-xs font-semibold text-invert-default">
                    {filterCount}
                  </span>
                )}
              </button>

              {HIDDEN_FEATURES.activityLogCsvXlsExport ? (
                // Hidden feature: Export dropdown with CSV / XLS / PDF.
                <div className="relative" ref={exportRef}>
                  <button
                    type="button"
                    onClick={() => setShowExportDrop((prev) => !prev)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                  >
                    <Icon name="download" size={16} />
                    Export
                  </button>
                  {showExportDrop && (
                    <div className="absolute right-0 top-[110%] z-50 w-44 bg-surface border border-invert-default rounded-lg shadow-lg py-1 overflow-hidden">
                      <button type="button" onClick={handleExportCSV} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors">
                        <Icon name="file-text" size={14} className="text-success" />
                        Export as CSV
                      </button>
                      <button type="button" onClick={handleExportXLS} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors">
                        <Icon name="sheet" size={14} className="text-info" />
                        Export as XLS
                      </button>
                      <button type="button" onClick={handleExportPDF} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-default hover:bg-default-soft transition-colors">
                        <Icon name="file" size={14} className="text-danger" />
                        Export as PDF
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex h-9 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                >
                  <Icon name="download" size={16} />
                  Export (PDF)
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={sorted.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <ActivityLogFilterDrawer
        open={filterOpen}
        filters={filters}
        onApply={(f) => { setFilters(f); setCurrentPage(1); }}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}

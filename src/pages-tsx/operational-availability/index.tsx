import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Calendar, ChevronRight, X } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Pagination } from "@/components/ui/Pagination";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { SortIcon, type SortDir, nextSort } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
import { oaMonths, type OAMonth } from "@/data/operationalAvailability";

import type { DateRange, OperationalAvailabilityProps } from "./types";
import { PER_PAGE } from "./constants";
import { parseMonthLabel, monthToKey, formatRange } from "./utils";
import { AOBadge } from "./components/AOBadge";
import { MonthRangePicker } from "./components/MonthRangePicker";
import { SummaryCards } from "./components/SummaryCards";

// ── Column definition ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<OAMonth>();

// ── Component ──────────────────────────────────────────────────────────────────

export function OperationalAvailability({ onNavigate }: OperationalAvailabilityProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSort = (field: string) => {
    const next = nextSort(sortField, field, sortDir);
    setSortField(next.field);
    setSortDir(next.dir);
    setCurrentPage(1);
  };

  // Filter by search + date range
  const filtered = oaMonths.filter((r) => {
    const matchSearch = !search || r.month.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (dateRange) {
      const { year, month } = parseMonthLabel(r.month);
      const key = monthToKey(year, month);
      const from = monthToKey(dateRange.fromYear, dateRange.fromMonth);
      const to = monthToKey(dateRange.toYear, dateRange.toMonth);
      if (key < from || key > to) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const av = (a as unknown as Record<string, unknown>)[sortField];
    const bv = (b as unknown as Record<string, unknown>)[sortField];
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // ── TanStack columns ─────────────────────────────────────────────────────────
  // Row navigation: each cell wraps content in a clickable div (TRX pattern from BookingTable)
  const columns = useMemo(
    () => [
      {
        id: "no",
        compact: true,
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        header: () => "No",
        cell: (info: any) => (
          <div
            className="text-sm text-gray-500 cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            {(currentPage - 1) * PER_PAGE + info.row.index + 1}
          </div>
        ),
      } as ColumnDef<OAMonth, any>,
      columnHelper.accessor("month", {
        header: () => (
          <button
            onClick={() => handleSort("month")}
            className="flex items-center gap-1 hover:opacity-75 transition-opacity"
          >
            Month <SortIcon active={sortField === "month"} dir={sortDir} />
          </button>
        ),
        cell: (info) => (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            <span className="text-sm font-semibold text-gray-800 hover:text-brand-primary transition-colors">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("totalOT", {
        header: () => "Total Operation Time (OT)",
        cell: (info) => (
          <div
            className="text-sm text-gray-700 font-mono cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("totalDT", {
        header: () => "Total Down Time (DT)",
        cell: (info) => (
          <div
            className="text-sm text-gray-700 font-mono cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("availability", {
        header: () => (
          <button
            onClick={() => handleSort("availability")}
            className="flex items-center gap-1 hover:opacity-75 transition-opacity"
          >
            Operational Availability (AO){" "}
            <SortIcon active={sortField === "availability"} dir={sortDir} />
          </button>
        ),
        cell: (info) => (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            <AOBadge value={info.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("bookings", {
        id: "bookings",
        header: () => "Bookings",
        cell: (info) => (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              {info.getValue().length}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "action",
        header: () => null,
        cell: (info) => (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/operational-availability/${info.row.original.id}`)}
          >
            <ChevronRight size={15} className="text-gray-300 hover:text-brand-primary transition-colors" />
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, sortField, sortDir, onNavigate],
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">Operational Availability</h1>
            <p className="text-xs text-gray-400 mt-0.5">Monthly summary of system uptime and downtime</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
              <InputCustom
                type="text"
                placeholder="Search month..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
              />
            </div>

            {/* Date range toggle button + picker */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 text-sm bg-white border px-3 py-2 rounded-lg transition-colors",
                  dateRange
                    ? "text-brand-primary border-brand-primary bg-red-50/40 font-medium"
                    : "text-gray-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                <Calendar size={14} className={dateRange ? "text-brand-primary" : "text-gray-400"} />
                {dateRange ? formatRange(dateRange) : "Select Date"}
                {dateRange && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateRange(null);
                      setCurrentPage(1);
                    }}
                    className="ml-1 text-brand-primary/60 hover:text-brand-primary transition-colors"
                  >
                    <X size={12} />
                  </span>
                )}
              </button>

              {pickerOpen && (
                <MonthRangePicker
                  value={dateRange}
                  onChange={(r) => {
                    setDateRange(r);
                    setCurrentPage(1);
                  }}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Summary stat cards */}
        <SummaryCards />

        {/* Active filter chip */}
        {dateRange && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Showing results for:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-medium text-brand-primary">
              <Calendar size={11} />
              {formatRange(dateRange)}
              <button
                onClick={() => {
                  setDateRange(null);
                  setCurrentPage(1);
                }}
                className="ml-0.5 hover:text-red-600 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
            <span className="text-xs text-gray-400">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={false}
            classThead="bg-red-50"
            classTheadTh="bg-red-50 text-brand-primary font-semibold text-xs"
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

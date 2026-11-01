import { useState, useMemo, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Eye, ArrowUpDown, Calendar, X } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { trainingResults } from "@/data/mock";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "./constants";
import { FilterPanel } from "./components/FilterPanel";

const SYSTEM_TABS = ["WPT", "MST", "MST TCT"];

const TAB_COLORS = {
  WPT:     "bg-blue-50 text-blue-600",
  MST:     "bg-purple-50 text-purple-600",
  "MST TCT": "bg-orange-50 text-orange-600",
};

// ── Date Range Picker popover ─────────────────────────────────────────────────
function DateRangePicker({ value, onChange, onClear }) {
  return (
    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 w-72">
      <p className="text-xs font-semibold text-gray-600 mb-3">Filter by Booking Date</p>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">From</label>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">To</label>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          />
        </div>
      </div>
      {(value.from || value.to) && (
        <button
          onClick={onClear}
          className="mt-3 w-full text-xs text-gray-500 hover:text-brand-primary transition-colors flex items-center justify-center gap-1"
        >
          <X size={11} /> Clear date filter
        </button>
      )}
    </div>
  );
}

export function TrainingResults({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("WPT");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleFilterChange = (key, value) => {
    setPendingFilters((prev) => {
      const current = prev[key] ?? [];
      return { ...prev, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const handleApply = () => { setAppliedFilters(pendingFilters); setFilterOpen(false); setCurrentPage(1); };
  const handleClear = () => { setPendingFilters({}); setAppliedFilters({}); setCurrentPage(1); };
  const openFilter = () => { setPendingFilters(appliedFilters); setFilterOpen(true); };

  const activeFilterCount = Object.values(appliedFilters).flat().length;
  const hasDateFilter = dateRange.from || dateRange.to;

  // Tab counts
  const tabCounts = useMemo(() =>
    SYSTEM_TABS.reduce((acc, tab) => {
      acc[tab] = trainingResults.filter((r) => (r.systemType ?? "WPT") === tab).length;
      return acc;
    }, {}),
  []);

  const filtered = useMemo(() => {
    let result = trainingResults.filter((r) => {
      // Tab filter
      if ((r.systemType ?? "WPT") !== activeTab) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.program.toLowerCase().includes(q) && !r.bookingId.toLowerCase().includes(q)) return false;
      }

      // Training Type filter
      if (appliedFilters.trainingType?.length) {
        if (!appliedFilters.trainingType.includes(r.trainingType)) return false;
      }

      // Training Slot filter
      if (appliedFilters.trainingSlot?.length) {
        const dateStr = r.bookingDate ?? "";
        if (!appliedFilters.trainingSlot.some((slot) => dateStr.includes(slot))) return false;
      }

      return true;
    });

    result = [...result].sort((a, b) =>
      sortDir === "desc" ? b.bookingDate.localeCompare(a.bookingDate) : a.bookingDate.localeCompare(b.bookingDate)
    );

    return result;
  }, [searchQuery, sortDir, appliedFilters, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = useMemo(
    () => [
      {
        id: "no",
        compact: true,
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        header: () => "No",
        cell: (info) => (
          <span className="text-xs text-gray-400 font-medium">
            {(currentPage - 1) * PER_PAGE + info.row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "program",
        header: () => "Program",
        cell: (info) => (
          <div className="cursor-pointer group" onClick={() => onNavigate?.("/training-results/detail")}>
            <div className="font-semibold text-sm text-gray-800 group-hover:text-brand-primary transition-colors">
              {info.getValue()}
            </div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">{info.row.original.bookingId}</div>
          </div>
        ),
      },
      {
        accessorKey: "trainingType",
        header: () => "Type",
        cell: (info) => (
          <div className="cursor-pointer" onClick={() => onNavigate?.("/training-results/detail")}>
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold",
              info.getValue() === "Group" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
            )}>
              {info.getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "bookingDate",
        header: () => (
          <button onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Booking Date <ArrowUpDown size={11} className="text-gray-400" />
          </button>
        ),
        cell: (info) => (
          <div className="text-sm text-gray-600 whitespace-pre-line leading-snug cursor-pointer"
            onClick={() => onNavigate?.("/training-results/detail")}>
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "trainingMode",
        header: () => "Mode",
        cell: (info) => (
          <div className="text-sm text-gray-600 cursor-pointer" onClick={() => onNavigate?.("/training-results/detail")}>
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "ftmsFileId",
        header: () => "FTMS File ID",
        cell: (info) => (
          <div className="text-sm text-gray-500 font-mono cursor-pointer" onClick={() => onNavigate?.("/training-results/detail")}>
            {info.getValue() ?? "—"}
          </div>
        ),
      },
      {
        id: "action",
        header: () => null,
        cell: () => (
          <div className="text-right">
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate?.("/training-results/detail"); }}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-brand-primary transition-all"
              title="View Results"
            >
              <Eye size={15} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, sortDir, onNavigate]
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Training Results</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* System type tabs */}
          <div className="flex items-center border-b border-gray-100 px-1">
            {SYSTEM_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                  activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
                <span className={cn(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                  activeTab === tab ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {tabCounts[tab] ?? 0}
                </span>
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Toolbar row */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            {/* Left: result count + filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">
                {activeTab} Results
                <span className="ml-1.5 text-xs font-normal text-gray-400">({filtered.length} records)</span>
              </span>
              {Object.entries(appliedFilters).flatMap(([key, values]) =>
                values.map((v) => (
                  <span key={`${key}-${v}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                    {v}
                    <button onClick={() => {
                      const next = { ...appliedFilters, [key]: appliedFilters[key].filter((x) => x !== v) };
                      setAppliedFilters(next); setPendingFilters(next); setCurrentPage(1);
                    }} className="ml-0.5 hover:text-brand-primary-hover">×</button>
                  </span>
                ))
              )}
              {hasDateFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                  <Calendar size={10} />
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from} – ${dateRange.to}`
                    : dateRange.from ? `From ${dateRange.from}` : `To ${dateRange.to}`}
                  <button onClick={() => setDateRange({ from: "", to: "" })} className="ml-0.5 hover:text-brand-primary-hover">×</button>
                </span>
              )}
            </div>

            {/* Right: search + calendar + filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                <InputCustom
                  type="text"
                  placeholder="Search program or booking ID…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-60 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
              </div>

              {/* Calendar date range */}
              <div className="relative" ref={calRef}>
                <button
                  onClick={() => setCalOpen((v) => !v)}
                  title="Filter by date"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 border rounded-lg transition-colors",
                    hasDateFilter
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Calendar size={13} />
                </button>
                {calOpen && (
                  <DateRangePicker
                    value={dateRange}
                    onChange={(v) => { setDateRange(v); setCurrentPage(1); }}
                    onClear={() => { setDateRange({ from: "", to: "" }); setCurrentPage(1); }}
                  />
                )}
              </div>

              {/* Filters */}
              <button
                onClick={openFilter}
                title="Filters"
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 border rounded-lg transition-colors",
                  activeFilterCount > 0
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <SlidersHorizontal size={13} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={false}
            classThead="bg-red-50/70"
            classTheadTh="bg-red-50/70 text-brand-primary font-bold text-xs py-3 px-5"
            classTBodyTd="px-5 py-3.5"
          />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
      />
    </div>
  );
}

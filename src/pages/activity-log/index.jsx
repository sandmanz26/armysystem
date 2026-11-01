import { useState, useRef, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon, nextSort, sortBy } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";

const PER_PAGE = 10;

// Parse "23 Apr 2026\n02:28:36 AM" → Date object (date part only)
function parseLogDate(dateStr) {
  const datePart = dateStr.split("\n")[0].trim(); // "23 Apr 2026"
  return new Date(datePart);
}

// Format Date → "YYYY-MM-DD" for comparison
function toYMD(date) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

const activityLogs = [
  { id: "l1",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:36 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l2",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:31 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l3",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:26 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l4",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:21 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l5",  name: "Olivia Carter", role: "System Admin", module: "SHM", date: "23 Apr 2026\n02:28:18 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been acknowledge and turn off" },
  { id: "l6",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:16 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l7",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:11 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l8",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:06 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l9",  name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:28:01 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l10", name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:27:56 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l11", name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:27:50 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
  { id: "l12", name: "System",        role: "System",       module: "SHM", date: "23 Apr 2026\n02:27:44 AM", description: "Reader ID - 250101-RFR001 : Siren notification has been turn on" },
];

const TOTAL_ITEMS = 7783;
const columnHelper = createColumnHelper();

export function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  // Date filter state
  const [dateFrom, setDateFrom] = useState("");  // "YYYY-MM-DD"
  const [dateTo, setDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dateRef.current && !dateRef.current.contains(e.target)) setShowDatePicker(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSort = (field) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const hasDateFilter = !!(dateFrom || dateTo);

  const clearDate = () => { setDateFrom(""); setDateTo(""); setCurrentPage(1); };

  // Filter logic
  const filtered = activityLogs.filter((l) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
    }
    // Date filter
    if (hasDateFilter) {
      const logDate = toYMD(parseLogDate(l.date));
      if (dateFrom && logDate < dateFrom) return false;
      if (dateTo && logDate > dateTo) return false;
    }
    return true;
  });

  const sorted = sortField ? sortBy(filtered, sortField, sortDir) : filtered;
  const totalPages = Math.ceil(TOTAL_ITEMS / PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const columns = [
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => (
        <div>
          <div className="text-gray-800 font-medium">{info.getValue()}</div>
          <div className="text-gray-400 text-xs">{info.row.original.role}</div>
        </div>
      ),
      minWidth: "160px",
    }),
    columnHelper.accessor("module", {
      header: () => "Module",
      cell: (info) => (
        <span className="inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 bg-pink-100 text-pink-600">
          {info.getValue()}
        </span>
      ),
      minWidth: "120px",
    }),
    columnHelper.accessor("date", {
      header: () => (
        <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
          Date <SortIcon active={sortField === "date"} dir={sortDir} />
        </button>
      ),
      cell: (info) => <div className="text-sm text-gray-700 whitespace-pre-line">{info.getValue()}</div>,
      minWidth: "160px",
    }),
    columnHelper.accessor("description", {
      header: () => "Description",
      cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
    }),
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-brand-primary">Activity Log</h1>
            <div className="flex items-center gap-3">
              <InputCustom
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-3 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              />

              {/* Date filter with popover */}
              <div ref={dateRef} className="relative">
                <button
                  onClick={() => setShowDatePicker((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-md transition-colors",
                    hasDateFilter
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Calendar size={14} />
                  {hasDateFilter
                    ? `${dateFrom || "..."} → ${dateTo || "..."}`
                    : "Select Date"
                  }
                  {hasDateFilter && (
                    <span
                      onClick={(e) => { e.stopPropagation(); clearDate(); }}
                      className="ml-1 text-brand-primary hover:text-brand-primary-hover"
                    >
                      <X size={13} />
                    </span>
                  )}
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-4 space-y-4">
                    <p className="text-xs font-semibold text-gray-700">Filter by Date Range</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                          type="date"
                          value={dateTo}
                          min={dateFrom}
                          onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={clearDate}
                        className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 py-2 bg-brand-primary text-white rounded-lg text-xs font-medium hover:bg-brand-primary-hover transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active date chip */}
          {hasDateFilter && (
            <div className="flex items-center gap-2 px-5 py-2 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-500">Filtered by date:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                {dateFrom || "—"} → {dateTo || "—"}
                <button onClick={clearDate} className="ml-0.5 hover:text-brand-primary-hover">×</button>
              </span>
              <span className="text-xs text-gray-400">({filtered.length} results)</span>
            </div>
          )}

          {/* Table */}
          <TableCustom
            columns={columns}
            data={paginated}
            autoScrollTable={true}
            classThead="bg-red-50/70"
            classTheadTh="text-brand-primary text-xs font-semibold"
          />

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={hasDateFilter ? filtered.length : TOTAL_ITEMS}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

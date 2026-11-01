import { useState, useRef, useEffect } from "react";
import { Search, Calendar, X } from "lucide-react";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon, nextSort } from "@/lib/sortUtils";
import { cn } from "@/lib/utils";
import { oaMonths } from "@/data/operationalAvailability";
import { PER_PAGE } from "./constants";
import { parseMonthLabel, monthToKey, formatRange } from "./utils";
import { MonthRangePicker } from "./components/MonthRangePicker";
import { AOBadge } from "./components/AOBadge";
import { BookingRows } from "./components/BookingRows";
export function OperationalAvailability2() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [dateRange, setDateRange] = useState(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef(null);
    useEffect(() => {
        function handle(e) {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);
    const handleSort = (field) => {
        const next = nextSort(sortField, field, sortDir);
        setSortField(next.field);
        setSortDir(next.dir);
        setCurrentPage(1);
    };
    const filtered = oaMonths.filter((r) => {
        const matchSearch = !search || r.month.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch)
            return false;
        if (dateRange) {
            const { year, month } = parseMonthLabel(r.month);
            const key = monthToKey(year, month);
            const from = monthToKey(dateRange.fromYear, dateRange.fromMonth);
            const to = monthToKey(dateRange.toYear, dateRange.toMonth);
            if (key < from || key > to)
                return false;
        }
        return true;
    });
    const sorted = [...filtered].sort((a, b) => {
        if (!sortField)
            return 0;
        const av = a[sortField];
        const bv = b[sortField];
        const cmp = String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
    });
    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const columns = [
        {
            id: "no",
            header: () => "No",
            cell: (info) => (<span className="text-sm text-gray-500">
          {(currentPage - 1) * PER_PAGE + info.row.index + 1}
        </span>),
        },
        {
            accessorKey: "month",
            header: () => (<button onClick={() => handleSort("month")} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
          Month <SortIcon active={sortField === "month"} dir={sortDir}/>
        </button>),
            cell: (info) => (<span className="text-sm font-semibold text-gray-800">
          {info.getValue()}
        </span>),
        },
        {
            accessorKey: "totalOT",
            header: () => "Total Activity Operation Time (OT)",
            cell: (info) => (<span className="text-sm text-gray-700 font-mono">{info.getValue()}</span>),
        },
        {
            accessorKey: "totalDT",
            header: () => "Total Activity Down Time (DT)",
            cell: (info) => (<span className="text-sm text-gray-700 font-mono">{info.getValue()}</span>),
        },
        {
            accessorKey: "availability",
            header: () => (<button onClick={() => handleSort("availability")} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
          Operational Availability (AO) <SortIcon active={sortField === "availability"} dir={sortDir}/>
        </button>),
            cell: (info) => <AOBadge value={info.getValue()}/>,
        },
        {
            accessorKey: "action",
            header: () => "",
            cell: () => null,
        },
    ];
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">Operational Availability</h1>
            <p className="text-xs text-gray-400 mt-0.5">Monthly summary of system uptime and downtime</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"/>
              <InputCustom type="text" placeholder="Search month..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-52 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"/>
            </div>

            <div className="relative" ref={pickerRef}>
              <button onClick={() => setPickerOpen((o) => !o)} className={cn("flex items-center gap-1.5 text-sm bg-white border px-3 py-2 rounded-lg transition-colors", dateRange
            ? "text-brand-primary border-brand-primary bg-red-50/40 font-medium"
            : "text-gray-600 border-gray-200 hover:bg-gray-50")}>
                <Calendar size={14} className={dateRange ? "text-brand-primary" : "text-gray-400"}/>
                {dateRange ? formatRange(dateRange) : "Select Date"}
                {dateRange && (<span onClick={(e) => { e.stopPropagation(); setDateRange(null); setCurrentPage(1); }} className="ml-1 text-brand-primary/60 hover:text-brand-primary transition-colors">
                    <X size={12}/>
                  </span>)}
              </button>
              {pickerOpen && (<MonthRangePicker value={dateRange} onChange={(r) => { setDateRange(r); setCurrentPage(1); }} onClose={() => setPickerOpen(false)}/>)}
            </div>
          </div>
        </div>

        {/* Active filter chip */}
        {dateRange && (<div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Showing results for:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-medium text-brand-primary">
              <Calendar size={11}/>
              {formatRange(dateRange)}
              <button onClick={() => { setDateRange(null); setCurrentPage(1); }} className="ml-0.5 hover:text-red-600 transition-colors">
                <X size={11}/>
              </button>
            </span>
            <span className="text-xs text-gray-400">{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</span>
          </div>)}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <TableCustom columns={columns} data={paginated} autoScrollTable={false} classThead="bg-red-50" classTheadTh="bg-red-50 text-brand-primary font-semibold text-xs" getNestedComponent={(row) => <BookingRows record={row.original}/>} nestedComponentButtonCondition={() => ({})}/>

          <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
        </div>

      </div>
    </div>);
}

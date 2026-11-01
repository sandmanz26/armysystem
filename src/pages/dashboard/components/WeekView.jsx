import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";
import { STATIONS, weekData, sessionColors, statusDot, WEEK_DAYS, WEEK_DATES, TODAY_IDX, } from "../constants";
// ── Column helper ─────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper();
// ── Cell renderer for a day column ───────────────────────────────────────────
function DayCells({ cells }) {
    if (cells.length === 0) {
        return <div className="h-8 flex items-center justify-center text-gray-200 text-xs">–</div>;
    }
    return (<div className="flex flex-col gap-1 py-1">
      {cells.map((cell, ci) => {
            const c = sessionColors[cell.type];
            return (<div key={ci} className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold", c.bg, c.text)}>
            <span>{cell.type}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", statusDot[cell.status])}/>
          </div>);
        })}
    </div>);
}
// ── Daily totals footer row (rendered outside TableCustom) ────────────────────
function DailyTotalsRow({ activeFilters }) {
    // Recalculate per-day filtered counts
    const filteredCounts = WEEK_DAYS.map((day) => STATIONS.reduce((sum, station) => {
        const cells = (weekData[station]?.[day] ?? []).filter((c) => activeFilters.includes(c.type));
        return sum + cells.length;
    }, 0));
    return (<div className="flex border-t border-gray-100 bg-gray-50">
      <div className="px-7 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap" style={{ minWidth: 180 }}>
        Daily
      </div>
      {filteredCounts.map((count, i) => (<div key={i} className={cn("flex-1 py-2 text-center text-sm font-bold", i === TODAY_IDX ? "bg-blue-100/50 text-blue-600" : "text-gray-700")}>
          {count}
        </div>))}
    </div>);
}
// ── WeekView ──────────────────────────────────────────────────────────────────
export function WeekView() {
    const [activeFilters, setActiveFilters] = useState(["AM", "PM", "Full", "Hr", "Ad"]);
    const toggleFilter = (t) => setActiveFilters((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
    // Build rows from mock data
    const tableData = useMemo(() => STATIONS.map((station) => ({
        station,
        bookingCount: Object.values(weekData[station] ?? {}).flat().length,
        Mon: (weekData[station]?.Mon ?? []).filter((c) => activeFilters.includes(c.type)),
        Tue: (weekData[station]?.Tue ?? []).filter((c) => activeFilters.includes(c.type)),
        Wed: (weekData[station]?.Wed ?? []).filter((c) => activeFilters.includes(c.type)),
        Thu: (weekData[station]?.Thu ?? []).filter((c) => activeFilters.includes(c.type)),
        Fri: (weekData[station]?.Fri ?? []).filter((c) => activeFilters.includes(c.type)),
        Sat: (weekData[station]?.Sat ?? []).filter((c) => activeFilters.includes(c.type)),
        Sun: (weekData[station]?.Sun ?? []).filter((c) => activeFilters.includes(c.type)),
    })), [activeFilters]);
    const columns = useMemo(() => [
        columnHelper.accessor("station", {
            id: "station",
            header: () => null,
            cell: (info) => (<div>
            <div className="text-xs font-bold text-gray-700">{info.row.original.station}</div>
            <div className="text-[10px] text-gray-400">{info.row.original.bookingCount} bookings</div>
          </div>),
            minWidth: "180px",
        }),
        ...WEEK_DAYS.map((day, i) => columnHelper.accessor(day, {
            id: day,
            header: () => (<div className={cn("text-center", i === TODAY_IDX ? "text-blue-600" : "text-gray-500")}>
              <div className="text-xs font-medium">
                {day} {WEEK_DATES[i]}
              </div>
              {i === TODAY_IDX && <div className="text-[10px] text-blue-400">Today</div>}
            </div>),
            cell: (info) => (<div className={cn(i === TODAY_IDX ? "bg-blue-50/40" : "")}>
              <DayCells cells={info.getValue()}/>
            </div>),
        })),
    ], []);
    return (<div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Week Overview</span>
          <span className="text-xs text-gray-400">7–13 Apr 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {["Completed", "Ongoing", "Upcoming"].map((s) => (<div key={s} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-sm", s === "Completed" ? "bg-green-200" : s === "Ongoing" ? "bg-yellow-200" : "bg-blue-200")}/>
                <span>{s}</span>
              </div>))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
        {["AM", "PM", "Full", "Hr", "Ad"].map((t) => {
            const c = sessionColors[t];
            const active = activeFilters.includes(t);
            return (<button key={t} onClick={() => toggleFilter(t)} className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors", active ? `${c.bg} ${c.text} border-transparent` : "bg-white text-gray-400 border-gray-200")}>
              <div className={cn("w-2 h-2 rounded-full", active ? c.dot : "bg-gray-300")}/>
              {t}
            </button>);
        })}
      </div>

      {/* Table */}
      <TableCustom columns={columns} data={tableData} autoScrollTable={true} classThead="[&_th:first-child]:bg-white [&_th]:py-2 [&_th]:px-4" classTBody="[&_td]:py-1 [&_td]:px-1.5 [&_td]:align-top [&_td]:h-auto" classTBodyTd="!h-auto" outerClass="min-w-[800px]"/>

      {/* Daily totals row */}
      <DailyTotalsRow activeFilters={activeFilters}/>
    </div>);
}

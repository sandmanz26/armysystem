import { useState, useRef, useEffect } from "react";
import { Search, Calendar, SlidersHorizontal, X } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { tabs, PER_PAGE } from "../constants";
import { BookingTable } from "./BookingTable";
import { ViewToggle } from "./ViewToggle";

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

export function ListView({ activeTab, tabCounts, filtered, paginated, currentPage, totalPages, searchQuery, sortDir, activeFilterCount, onTabChange, onSearchChange, onPageChange, onToggleSort, onSetViewMode, onNavigate, onAssignBriefingRoom, onOpenFilter, dateRange, onDateChange, onDateClear }) {
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const hasDateFilter = dateRange?.from || dateRange?.to;

  return (<>
    {/* Tabs row */}
    <div className="flex items-center justify-between px-5 border-b border-gray-100">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const count = tabCounts[tab] ?? 0;
          return (<button key={tab} onClick={() => onTabChange(tab)} className={cn("flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative", activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700")}>
            {tab}
            {count > 0 && (<span className={cn("inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold", activeTab === tab ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500")}>
              {count}
            </span>)}
            {activeTab === tab && (<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"/>)}
          </button>);
        })}
      </div>
      <ViewToggle viewMode="list" onSetViewMode={onSetViewMode} className="flex-shrink-0 ml-2"/>
    </div>

    {/* Search/filter bar */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
      <span className="text-sm font-semibold text-gray-700">
        {activeTab} Bookings
        <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} records)</span>
      </span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <InputCustom type="text" placeholder="Search bookings…" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"/>
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
            <Calendar size={13}/>
          </button>
          {calOpen && (
            <DateRangePicker
              value={dateRange ?? { from: "", to: "" }}
              onChange={(v) => { onDateChange?.(v); }}
              onClear={() => { onDateClear?.(); setCalOpen(false); }}
            />
          )}
        </div>

        <button onClick={onOpenFilter} title="Filters" className={cn("relative flex items-center justify-center w-8 h-8 border rounded-lg transition-colors", activeFilterCount > 0 ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50")}>
          <SlidersHorizontal size={13}/>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <BookingTable paginated={paginated} currentPage={currentPage} sortDir={sortDir} onToggleSort={onToggleSort} onNavigate={onNavigate} onAssignBriefingRoom={onAssignBriefingRoom}/>
    </div>

    <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={onPageChange}/>
  </>);
}

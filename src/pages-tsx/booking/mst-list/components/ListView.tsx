import { Search, Calendar, SlidersHorizontal } from "lucide-react";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import type { Booking } from "@/data/mock";
import { cn } from "@/lib/utils";
import { tabs, PER_PAGE } from "../constants";
import type { TabType } from "../types";
import { BookingTable } from "./BookingTable";
import { ViewToggle } from "./ViewToggle";

interface ListViewProps {
  activeTab: TabType;
  tabCounts: Record<string, number>;
  filtered: Booking[];
  paginated: Booking[];
  currentPage: number;
  searchQuery: string;
  sortDir: "asc" | "desc";
  onTabChange: (tab: TabType) => void;
  onSearchChange: (q: string) => void;
  onPageChange: (page: number) => void;
  onToggleSort: () => void;
  onSetViewMode: (mode: "list" | "calendar") => void;
  onNavigate?: (path: string) => void;
}

export function ListView({
  activeTab,
  tabCounts,
  filtered,
  paginated,
  currentPage,
  searchQuery,
  sortDir,
  onTabChange,
  onSearchChange,
  onPageChange,
  onToggleSort,
  onSetViewMode,
  onNavigate,
}: ListViewProps) {
  return (
    <>
      {/* Tabs row */}
      <div className="flex items-center justify-between px-5 border-b border-gray-100">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const count = tabCounts[tab] ?? 0;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative",
                  activeTab === tab
                    ? "text-brand-primary"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
                {count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    activeTab === tab
                      ? "bg-brand-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {count}
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
        <ViewToggle viewMode="list" onSetViewMode={onSetViewMode} className="flex-shrink-0 ml-2" />
      </div>

      {/* Search/filter bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-semibold text-gray-700">
          {activeTab} Bookings
          <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length} records)</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <InputCustom
              type="text"
              placeholder="Search bookings…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <button title="Date Filter" className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all">
            <Calendar size={13} />
            <span className="text-xs font-medium">Date</span>
          </button>
          <button title="Filters" className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all">
            <SlidersHorizontal size={13} />
            <span className="text-xs font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <BookingTable
          paginated={paginated}
          activeTab={activeTab}
          currentPage={currentPage}
          sortDir={sortDir}
          onToggleSort={onToggleSort}
          onNavigate={onNavigate}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={filtered.length}
        setCurrentPage={onPageChange}
      />
    </>
  );
}

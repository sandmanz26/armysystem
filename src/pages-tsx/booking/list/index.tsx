import { useState, useMemo } from "react";
import { bookings } from "@/data/mock";
import type { BookingStatus } from "@/data/mock";
import { Button } from "@/components/button";
import { PER_PAGE } from "./constants";
import type { BookingListProps, TabType } from "./types";
import { CalendarView } from "./components/CalendarView";
import { ListView } from "./components/ListView";
import { BookingFilterPanel, EMPTY_FILTERS, type BookingFilters } from "./components/BookingFilterPanel";
import { expandBookingsByCourseware } from "./utils";

// Booking dates are stored as "22 Apr 2026" (or "22, 23 Apr 2026" for multi-day) —
// normalize to the first day so it's comparable against the native <input type="date"> value.
function parseBookingDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/^(\d+),\s*\d+/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

export function BookingList({ onNavigate, createPath = "/bookings/create" }: BookingListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);

  const activeFilterCount =
    filters.trainingTypes.length +
    filters.trainingSlots.length +
    filters.briefingRooms.length +
    filters.coursewares.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  // A booking with 2+ coursewares is 2+ sessions (Sec. 3.4 — 1 courseware = 1 session) —
  // split into one row per session so the list, tab counts, and pagination all operate at
  // session granularity instead of hiding extra coursewares behind a "+N" badge.
  const sessionRows = useMemo(() => expandBookingsByCourseware(bookings), []);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { Overall: sessionRows.length };
    for (const b of sessionRows) {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    return counts;
  }, [sessionRows]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let result = sessionRows.filter((b) => {
      const matchesTab = activeTab === "Overall" || b.status === (activeTab as BookingStatus);
      const matchesSearch =
        !searchQuery ||
        b.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.unitName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filters.trainingTypes.length === 0 || filters.trainingTypes.includes(b.trainingType);
      const matchesSlot =
        filters.trainingSlots.length === 0 ||
        filters.trainingSlots.some((s) => b.bookingTime.includes(s));
      const matchesRoom =
        filters.briefingRooms.length === 0 ||
        (b.briefingRoom != null && filters.briefingRooms.includes(b.briefingRoom));
      const matchesCw =
        filters.coursewares.length === 0 ||
        (b.courseware != null && filters.coursewares.includes(b.courseware));
      const matchesDate = (() => {
        if (!filters.dateFrom && !filters.dateTo) return true;
        const bookingDate = parseBookingDate(b.bookingDate);
        if (!bookingDate) return true;
        if (filters.dateFrom && bookingDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && bookingDate > new Date(filters.dateTo)) return false;
        return true;
      })();
      return matchesTab && matchesSearch && matchesType && matchesSlot && matchesRoom && matchesCw && matchesDate;
    });
    result = [...result].sort((a, b) => {
      const da = a.bookingDate;
      const db = b.bookingDate;
      return sortDir === "asc" ? da.localeCompare(db) : db.localeCompare(da);
    });
    return result;
  }, [sessionRows, activeTab, searchQuery, sortDir, filters]);

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleToggleSort = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-brand-primary">Booking List</h1>
          <Button
            onClick={() => onNavigate?.(createPath)}
            className="px-4 py-2 w-fit text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold shadow-sm transition-colors"
          >
            + Create Booking
          </Button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {viewMode === "calendar" ? (
            <CalendarView onSetViewMode={setViewMode} />
          ) : (
            <ListView
              activeTab={activeTab}
              tabCounts={tabCounts}
              filtered={filtered}
              paginated={paginated}
              currentPage={currentPage}
              searchQuery={searchQuery}
              sortDir={sortDir}
              activeFilterCount={activeFilterCount}
              onTabChange={handleTabChange}
              onSearchChange={handleSearchChange}
              onPageChange={setCurrentPage}
              onToggleSort={handleToggleSort}
              onSetViewMode={setViewMode}
              onOpenFilter={() => setFilterOpen(true)}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>

      <BookingFilterPanel
        open={filterOpen}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}

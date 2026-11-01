import { useState, useMemo } from "react";
import { bookings } from "@/data/mock";
import { Button } from "@/components/button";
import { PER_PAGE } from "./constants";
import { CalendarView } from "./components/CalendarView";
import { ListView } from "./components/ListView";
import { AssignBriefingRoomSidebar } from "./components/AssignBriefingRoomSidebar";
import { BookingFilterPanel } from "./components/BookingFilterPanel";
export function BookingList({ onNavigate, createPath = "/bookings/create" }) {
    const [activeTab, setActiveTab] = useState("Overall");
    const [viewMode, setViewMode] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [briefingRoomSidebar, setBriefingRoomSidebar] = useState({ open: false, booking: null });
    const [filterOpen, setFilterOpen] = useState(false);
    const [pendingFilters, setPendingFilters] = useState({});
    const [appliedFilters, setAppliedFilters] = useState({});
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const activeFilterCount = Object.values(appliedFilters).flat().length;
    const handleFilterChange = (key, value) => {
        setPendingFilters((prev) => {
            const current = prev[key] ?? [];
            return { ...prev, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
        });
    };
    const handleFilterApply = () => { setAppliedFilters(pendingFilters); setFilterOpen(false); setCurrentPage(1); };
    const handleFilterClear = () => { setPendingFilters({}); setAppliedFilters({}); setCurrentPage(1); };
    const openFilter = () => { setPendingFilters(appliedFilters); setFilterOpen(true); };
    // Tab counts
    const tabCounts = useMemo(() => {
        const counts = { Overall: bookings.length };
        for (const b of bookings) {
            counts[b.status] = (counts[b.status] ?? 0) + 1;
        }
        return counts;
    }, []);
    // Filtered + sorted list
    const filtered = useMemo(() => {
        const parseDate = (str) => { const d = new Date(str?.split("\n")[0]?.trim() ?? ""); return isNaN(d.getTime()) ? null : d; };
        let result = bookings.filter((b) => {
            const matchesTab = activeTab === "Overall" || b.status === activeTab;
            const matchesSearch = !searchQuery ||
                b.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.unitName.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesTab || !matchesSearch) return false;
            if (dateRange.from) { const d = parseDate(b.bookingDate); if (!d || d < new Date(dateRange.from)) return false; }
            if (dateRange.to)   { const d = parseDate(b.bookingDate); if (!d || d > new Date(dateRange.to + "T23:59:59")) return false; }
            return true;
        });
        result = [...result].sort((a, b) => {
            const da = a.bookingDate;
            const db = b.bookingDate;
            return sortDir === "asc" ? da.localeCompare(db) : db.localeCompare(da);
        });
        return result;
    }, [activeTab, searchQuery, sortDir, dateRange]);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };
    const handleSearchChange = (q) => {
        setSearchQuery(q);
        setCurrentPage(1);
    };
    const handleToggleSort = () => {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-brand-primary">Booking List</h1>
          <Button onClick={() => onNavigate?.(createPath)} className="px-4 py-2 w-fit text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold shadow-sm transition-colors">
            + Create Booking
          </Button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {viewMode === "calendar" ? (<CalendarView onSetViewMode={setViewMode}/>) : (<ListView activeTab={activeTab} tabCounts={tabCounts} filtered={filtered} paginated={paginated} currentPage={currentPage} totalPages={totalPages} searchQuery={searchQuery} sortDir={sortDir} activeFilterCount={activeFilterCount} onTabChange={handleTabChange} onSearchChange={handleSearchChange} onPageChange={setCurrentPage} onToggleSort={handleToggleSort} onSetViewMode={setViewMode} onNavigate={onNavigate} onAssignBriefingRoom={(booking) => setBriefingRoomSidebar({ open: true, booking })} onOpenFilter={openFilter} dateRange={dateRange} onDateChange={(v) => { setDateRange(v); setCurrentPage(1); }} onDateClear={() => { setDateRange({ from: "", to: "" }); setCurrentPage(1); }}/>)}
        </div>
      </div>

      <BookingFilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={pendingFilters}
        onChange={handleFilterChange}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
      />

      {/* Assign Briefing Room sidebar — rendered at page root to avoid overflow clipping */}
      <AssignBriefingRoomSidebar
        open={briefingRoomSidebar.open}
        booking={briefingRoomSidebar.booking}
        onClose={() => setBriefingRoomSidebar({ open: false, booking: null })}
        onConfirm={(room) => {
          console.log("Briefing room assigned:", room, "for booking:", briefingRoomSidebar.booking?.bookingId);
          setBriefingRoomSidebar({ open: false, booking: null });
        }}
      />
    </div>);
}

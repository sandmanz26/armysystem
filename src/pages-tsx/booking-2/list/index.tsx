// Booking 2.0 — WPT Booking List.
//
// Deliberately isolated from src/pages-tsx/booking/list: same underlying data
// (bookings array from @/data/mock, imported read-only) and the same
// BookingTable so the column order can differ without ever touching the
// original booking module. BookingFilterPanel is reused as-is (unchanged
// shared UI, not booking-2-specific); CalendarView used to be reused too, but
// it didn't match Figma's `Booking List - Calendar` section (`5029:30128`)
// structurally, so booking-2 now has its own (`./components/CalendarView`).
// That file has no List/Calendar toggle of its own — unlike the old one, it
// doesn't embed the page-level view switch — so the outer ViewModeToggle
// below is now shown in both modes, not just "list".
import { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/icon";
import { bookings } from "@/data/mock";
import type { BookingStatus } from "@/data/mock";
import { SegmentedPicker } from "@/components/segmented-picker";
import { PER_PAGE } from "@/pages-tsx/booking/list/constants";
import type { TabType } from "@/pages-tsx/booking/list/types";
import { CalendarView } from "./components/CalendarView";
import { EMPTY_FILTERS, type BookingFilters } from "@/pages-tsx/booking/list/components/BookingFilterPanel";
import { BookingFilterDrawer } from "./components/BookingFilterDrawer";
import { Toast } from "@/components/toast";
import { getCreatedBookings, peekJustCreated, clearJustCreated } from "@/pages-tsx/booking-2/create/createdBookings";

/*
 * The shared mock (read-only for Booking 2.0) still names rooms "Briefing Room 1/2"; the filter
 * lists the Figma codes (5029:30101), so map the legacy names onto codes when matching.
 */
const LEGACY_ROOM_CODE: Record<string, string> = { "Briefing Room 1": "L1BR-01", "Briefing Room 2": "L1BR-02" };
import { ListView } from "./components/ListView";
import { DEFAULT_VISIBLE_COLUMNS, COLUMN_OPTIONS } from "./components/ColumnCustomizer";

function parseBookingDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/^(\d+),\s*\d+/, "$1");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

export interface BookingList2Props {
  onNavigate?: (path: string) => void;
  createPath?: string;
}

export function BookingList2({ onNavigate, createPath = "/bookings-2/create" }: BookingList2Props) {
  const [activeTab, setActiveTab] = useState<TabType>("Overall");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);
  // Figma's default for the column customizer: only the seven locked columns.
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => ({ ...DEFAULT_VISIBLE_COLUMNS }),
  );
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  // C-1 / C-28 (Figma `Toast - Booking Created`, 6183:504775): back from Create Booking's Confirm,
  // the new booking leads the list and a top-right toast confirms it.
  const [createdToast, setCreatedToast] = useState(peekJustCreated);
  useEffect(() => clearJustCreated(), []);

  const toggleColumn = (id: string) => {
    if (COLUMN_OPTIONS.find((c) => c.id === id)?.locked) return;
    setVisibleColumns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeFilterCount =
    filters.trainingTypes.length +
    filters.trainingSlots.length +
    filters.briefingRooms.length +
    filters.coursewares.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  /*
   * One row per booking — NOT one row per courseware.
   *
   * **v0.23**. That version was reversed in **v0.43**: Sec. 12.2 now reads
   * "Booking List works entirely at booking level: 1 booking = 1 row… A
   * multi-courseware booking is **not** split into per-courseware rows", and
   * the PRD even names this function as the debt left to unwind. Figma agrees —
   * its rows carry "Blockforce Training +1 more" with "Multiple Courseware"
   * under the time, which only exists because a booking stays one row.
   *
   * Consequence to expect: tab counts drop, because they now count bookings
   * rather than sessions. That is what Sec. 12.2 asks for ("a tab showing 24
   * means 24 distinct bookings").
   */
  const createdRows = useMemo(() => getCreatedBookings(), []);
  const sessionRows = useMemo(() => [...createdRows, ...bookings], [createdRows]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { Overall: sessionRows.length };
    for (const b of sessionRows) {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    return counts;
  }, [sessionRows]);

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
        filters.trainingSlots.some((s) => b.bookingTime.toLowerCase().includes(s.toLowerCase()));
      const matchesRoom =
        filters.briefingRooms.length === 0 ||
        (b.briefingRoom != null && filters.briefingRooms.includes(LEGACY_ROOM_CODE[b.briefingRoom] ?? b.briefingRoom));
      /*
       * Sec. 12.2: "must match a booking if ANY of its coursewares matches —
       * matching against the whole comma-joined string is what made this
       * unreliable before". With rows no longer split, that string can hold
       * several names, so the comparison has to be per courseware.
       */
      const matchesCw =
        filters.coursewares.length === 0 ||
        String(b.courseware ?? "")
          .split(",")
          .map((c) => c.trim())
          .some((c) => c && filters.coursewares.includes(c));
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
    // Bookings created this session stay on top (Figma 6183:504775 shows the new one as row 1).
    const created = new Set(createdRows.map((b) => b.id));
    return [...result.filter((b) => created.has(b.id)), ...result.filter((b) => !created.has(b.id))];
  }, [sessionRows, createdRows, activeTab, searchQuery, sortDir, filters]);

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
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="flex flex-col gap-6 p-6">
        {/* Figma `Page Header` (5331:428546): title left; `Segmented Picker md`
            (List / Calendar, 20px icons, 16 Medium) and `Button Primary`
            (Create Booking, 40 tall, 18px plus) 12px apart on the right. */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="whitespace-nowrap text-xl font-semibold text-default">Booking List</h1>
          <div className="flex items-center gap-3">
            <SegmentedPicker
              size="md"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "list", label: "List", icon: <Icon name="list" size={20} /> },
                { value: "calendar", label: "Calendar", icon: <Icon name="calendar-days" size={20} /> },
              ]}
            />
            <button
              type="button"
              onClick={() => onNavigate?.(createPath)}
              className="flex h-10 items-center gap-2 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
            >
              <Icon name="plus" size={16} />
              Create Booking
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <CalendarView onNavigate={onNavigate} />
        ) : (
          <div className="overflow-visible rounded-xl border border-invert-default bg-surface-lv1">
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
              onOpenFilter={() => setFilterOpen(true)}
              onNavigate={onNavigate}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              columnMenuOpen={columnMenuOpen}
              onColumnMenuToggle={() => setColumnMenuOpen((o) => !o)}
              onColumnMenuClose={() => setColumnMenuOpen(false)}
            />
          </div>
        )}
      </div>

      <BookingFilterDrawer
        open={filterOpen}
        filters={filters}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />

      <Toast message="Booking created successfully" open={createdToast} onDismiss={() => setCreatedToast(false)} placement="top-right" />
    </div>
  );
}

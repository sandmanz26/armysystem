// Booking 2.0 — shell around the reordered BookingTable. Structurally a copy
// of booking/list/components/ListView.tsx (tabs/search/pagination unchanged
// from the current WPT Booking List), but pointed at the new BookingTable
// instead of the old one, which is hardcoded there and can't be swapped in.
import { Icon } from "@/components/icon";
import { InputCustom } from "@/components/input";
import { Pagination } from "@/components/ui/Pagination";
import type { Booking } from "@/data/mock";
import { cn } from "@/lib/utils";
import { tabs, PER_PAGE } from "@/pages-tsx/booking/list/constants";
import type { TabType } from "@/pages-tsx/booking/list/types";
import { BookingTable } from "./BookingTable";
import { ColumnCustomizer } from "./ColumnCustomizer";

/**
 * Tab captions follow Figma's `Tab Group v2` on 5029:30026, which shortens the
 * long status to "Completed | Missing Assets". Only the CAPTION differs — the
 * underlying BookingStatus value is untouched, since mock data, StatusBadge and
 * the detail pages all key off the full string.
 */
const TAB_LABELS: Partial<Record<TabType, string>> = {
  "Completed with Missing Assets": "Completed | Missing Assets",
};

interface ListViewProps {
  activeTab: TabType;
  tabCounts: Record<string, number>;
  filtered: Booking[];
  paginated: Booking[];
  currentPage: number;
  searchQuery: string;
  sortDir: "asc" | "desc";
  activeFilterCount?: number;
  onTabChange: (tab: TabType) => void;
  onSearchChange: (q: string) => void;
  onPageChange: (page: number) => void;
  onToggleSort: () => void;
  onOpenFilter?: () => void;
  onNavigate?: (path: string) => void;
  /** Column id → shown, and the toggle that flips one. */
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (id: string) => void;
  columnMenuOpen: boolean;
  onColumnMenuToggle: () => void;
  onColumnMenuClose: () => void;
}

export function ListView({
  activeTab,
  tabCounts,
  filtered,
  paginated,
  currentPage,
  searchQuery,
  sortDir,
  activeFilterCount = 0,
  onTabChange,
  onSearchChange,
  onPageChange,
  onToggleSort,
  onOpenFilter,
  onNavigate,
  visibleColumns,
  onToggleColumn,
  columnMenuOpen,
  onColumnMenuToggle,
  onColumnMenuClose,
}: ListViewProps) {
  return (
    <>
      {/* Figma `Tab Group v2` (5331:428546): 44 tall, 20px side padding, items
          12/16 padding with a 6px gap to a 16px `Badge Number` (12 Semi Bold;
          active `background/primary/default` + `text/base`, else
          `background/disabled` + `text/body`), 2px underline on the active tab. */}
      <div className="relative flex items-center px-5">
        <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
        <div className="relative flex overflow-x-auto">
          {tabs.map((tab) => {
            const count = tabCounts[tab] ?? 0;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-body hover:text-default",
                )}
              >
                {TAB_LABELS[tab] ?? tab}
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-xs font-semibold",
                      active ? "bg-primary-default text-invert-default" : "bg-disabled text-body",
                    )}
                  >
                    {count}
                  </span>
                )}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Figma `Section Header` 76 tall, padding 20: title 16 Semi Bold +
          bare count `text/body` (no "(N records)"); Search 240×36, Filter
          36 tall, then the 36×36 column-customizer icon button, 12px apart. */}
      <div className="flex items-center justify-between gap-5 p-5">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="text-default">{TAB_LABELS[activeTab] ?? activeTab} Bookings</span>
          <span className="text-body">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
            <InputCustom
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-invert-default bg-surface py-0 pl-10 pr-3 text-sm text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused transition-colors"
            />
          </div>
          <button
            title="Filter"
            onClick={onOpenFilter}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
              activeFilterCount > 0 ? "border-primary text-primary" : "border-invert-default text-default hover:bg-default-soft",
            )}
          >
            <Icon name="sliders-horizontal" size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-default px-0.5 text-xs font-semibold text-invert-default">
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* Figma `Button Icon` 36×36 + the `Dropdown - Column Customizer`
              it anchors (5331:411422). */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              title="Manage Columns"
              aria-haspopup="menu"
              aria-expanded={columnMenuOpen}
              onClick={onColumnMenuToggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-invert-default bg-surface text-default hover:bg-default-soft transition-colors"
            >
              <Icon name="columns-3-cog" size={16} />
            </button>
            <ColumnCustomizer
              open={columnMenuOpen}
              visible={visibleColumns}
              onToggle={onToggleColumn}
              onClose={onColumnMenuClose}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <BookingTable
          paginated={paginated}
          currentPage={currentPage}
          sortDir={sortDir}
          onToggleSort={onToggleSort}
          onNavigate={onNavigate}
          visibleColumns={visibleColumns}
          searchQuery={searchQuery}
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

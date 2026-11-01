import { useState, useMemo } from "react";
import { bookings } from "@/data/mock";
import type { BookingStatus } from "@/data/mock";
import {
  Eye, ArrowUpDown, PackageCheck, PlayCircle, RefreshCw,
  Search, Calendar, SlidersHorizontal, List, CalendarRange,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { BookingFilterPanel, EMPTY_FILTERS, type BookingFilters } from "@/pages-tsx/booking/list/components/BookingFilterPanel";
import { CoursewareCell } from "@/pages-tsx/booking/list/components/CoursewareCell";
import { BookingRowMenu } from "@/pages-tsx/booking/list/components/BookingRowMenu";
import { parseBookingTime } from "@/pages-tsx/booking/list/utils";
import { cn } from "@/lib/utils";
import type { Booking } from "@/data/mock";

const PER_PAGE = 10;

// Fix 1: "Completed with Missing Assets" shortened to "Missing Assets" to prevent tab overflow
const TABS = [
  "Overall",
  "Upcoming",
  "Ongoing",
  "Return Assets",
  "Completed",
  "Missing Assets",
  "Cancelled",
  "Overdue",
] as const;

type RevTabType = (typeof TABS)[number];

// Map the shortened label back to actual booking status
const TAB_STATUS_MAP: Partial<Record<RevTabType, BookingStatus>> = {
  "Missing Assets": "Completed with Missing Assets",
};

interface Props {
  onNavigate?: (path: string) => void;
}

const columnHelper = createColumnHelper<Booking>();

function RevBookingTable({
  paginated,
  currentPage,
  onToggleSort,
  onNavigate,
}: {
  paginated: Booking[];
  currentPage: number;
  sortDir: "asc" | "desc";
  onToggleSort: () => void;
  onNavigate?: (path: string) => void;
}) {
  const columns = useMemo(
    () => [
      ({
        id: "rowNum",
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        header: () => "No",
        cell: (info: any) => (
          <div
            className="text-sm text-gray-500 font-medium cursor-pointer"
            onClick={() => onNavigate?.(`/bookings/detail?id=${info.row.original.id}`)}
          >
            {(currentPage - 1) * PER_PAGE + info.row.index + 1}
          </div>
        ),
      } as unknown as import("@tanstack/react-table").ColumnDef<Booking>),

      columnHelper.display({
        id: "booking",
        size: 220,
        minSize: 220,
        header: () => "Booking ID",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="cursor-pointer min-w-[200px]"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              <div className="font-semibold text-sm text-gray-800 hover:text-brand-primary transition-colors leading-snug line-clamp-2">
                {booking.program}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                Booking ID - {booking.bookingId}
              </div>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "trainingType",
        header: () => "Training Type",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.trainingType}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "bookingTime",
        header: () => (
          <button
            onClick={onToggleSort}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          >
            Booking Time
            <ArrowUpDown size={11} className="text-gray-400" />
          </button>
        ),
        cell: (info) => {
          const booking = info.row.original;
          const { date, timeRange, label } = parseBookingTime(booking.bookingTime);
          return (
            <div
              className="cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              <div className="text-sm font-semibold text-gray-700">{date}</div>
              {timeRange && <div className="text-xs text-gray-500 mt-0.5">{timeRange}</div>}
              {label && <div className="text-[10px] text-gray-400 mt-0.5 italic">{label}</div>}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "status",
        header: () => "Status",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              <StatusBadge status={booking.status} />
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "trainingMode",
        header: () => "Training Mode",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.trainingMode}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "courseware",
        size: 180,
        minSize: 180,
        header: () => "Courseware",
        cell: (info) => <CoursewareCell text={info.row.original.courseware} />,
      }),

      columnHelper.display({
        id: "assignmentId",
        header: () => "Assignment ID",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.assignmentId || "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "unitName",
        header: () => "Unit Name",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.unitName}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "weaponTypes",
        header: () => "Weapon Type(s)",
        cell: (info) => {
          const booking = info.row.original;
          const types = booking.weaponTypes?.join(", ") ?? booking.weapon ?? "-";
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {types}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "weaponCount",
        header: () => "Weapon(s)",
        cell: (info) => {
          const booking = info.row.original;
          const count = booking.weaponCount;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {count != null ? `${count} Weapon(s)` : "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "briefingRoom",
        header: () => "Briefing Room",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.briefingRoom ?? "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "baseStationQty",
        header: () => "Base Station Qty",
        cell: (info) => {
          const booking = info.row.original;
          const qty = booking.baseStationQty;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {qty != null ? `${qty} Station(s)` : "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "traineesCount",
        header: () => "Trainee(s)",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.traineesCount ?? "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "instructorName",
        header: () => "Instructor Name",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.instructorName ?? "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "ftmsFileId",
        header: () => "FTMS File ID",
        cell: (info) => {
          const booking = info.row.original;
          return (
            <div
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
            >
              {booking.ftmsFileId ?? "-"}
            </div>
          );
        },
      }),

      columnHelper.display({
        id: "action",
        header: () => "Actions",
        cell: (info) => {
          const booking = info.row.original;
          const isGroup = booking.trainingType === "Group";
          let flowIcon: React.ReactNode = null;
          if (isGroup && booking.status === "Upcoming" && !booking.assetIssued) {
            flowIcon = (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(`/system-hardware/assignments/new?bookingId=${booking.id}&fromBooking=true`);
                }}
                title="Issue Assets"
                // Fix 3: larger touch target (p-2 instead of p-1.5)
                className="p-2 rounded-md text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors"
              >
                <PackageCheck size={14} />
              </button>
            );
          } else if (isGroup && booking.status === "Upcoming" && booking.assetIssued) {
            flowIcon = (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(`/bookings/detail?id=${booking.id}`);
                }}
                title="Start Onboarding"
                className="p-2 rounded-md text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors"
              >
                <PlayCircle size={14} />
              </button>
            );
          } else if (isGroup && booking.status === "Ongoing") {
            flowIcon = (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(`/bookings/detail?id=${booking.id}`);
                }}
                title="Continue Session"
                className="p-2 rounded-md text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            );
          }
          return (
            <div className="flex items-center gap-0.5">
              {flowIcon}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(`/bookings/detail?id=${booking.id}`);
                }}
                className="p-2 rounded-md text-gray-400 hover:text-brand-primary hover:bg-gray-100 transition-colors"
                title="View Details"
              >
                <Eye size={14} />
              </button>
              <BookingRowMenu
                status={booking.status}
                assetIssued={booking.assetIssued}
                onView={() => onNavigate?.(`/bookings/detail?id=${booking.id}`)}
              />
            </div>
          );
        },
      }),
    ],
    [currentPage, onNavigate, onToggleSort],
  );

  return (
    <TableCustom
      columns={columns}
      data={paginated}
      autoScrollTable={true}
      // Fix 2: neutral gray header instead of red
      classThead="bg-gray-50"
      classTheadTh="text-[#667085] text-xs font-semibold"
    />
  );
}

export function BookingListRev1({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<RevTabType>("Upcoming");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const activeFilterCount =
    filters.trainingTypes.length +
    filters.trainingSlots.length +
    filters.briefingRooms.length +
    filters.coursewares.length;

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { Overall: bookings.length };
    for (const b of bookings) {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    // Map "Completed with Missing Assets" count → "Missing Assets" display key
    counts["Missing Assets"] = counts["Completed with Missing Assets"] ?? 0;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const statusFilter = TAB_STATUS_MAP[activeTab] ?? (activeTab as BookingStatus);
    let result = bookings.filter((b) => {
      const matchesTab = activeTab === "Overall" || b.status === statusFilter;
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
      return matchesTab && matchesSearch && matchesType && matchesSlot && matchesRoom && matchesCw;
    });
    result = [...result].sort((a, b) => {
      const da = a.bookingDate;
      const db = b.bookingDate;
      return sortDir === "asc" ? da.localeCompare(db) : db.localeCompare(da);
    });
    return result;
  }, [activeTab, searchQuery, sortDir, filters]);

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleTabChange = (tab: RevTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#344054]">Booking List</h1>
            <p className="text-xs text-gray-400 mt-0.5">Rev 1.0 — UI/UX improvements</p>
          </div>
          <Button
            onClick={() => onNavigate?.("/bookings/create")}
            className="px-4 py-2 w-fit text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold shadow-sm transition-colors"
          >
            + Create Booking
          </Button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Fix 4: Tab bar with shortened labels — no overflow on 8 tabs */}
          <div className="flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const count = tabCounts[tab] ?? 0;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors whitespace-nowrap relative",
                      activeTab === tab ? "text-brand-primary" : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {tab}
                    {count > 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                          activeTab === tab ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-500",
                        )}
                      >
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
            {/* View toggle */}
            <div className="flex-shrink-0 ml-2 flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list" ? "bg-white shadow-sm text-gray-700" : "text-gray-400 hover:text-gray-600",
                )}
                title="List view"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "calendar" ? "bg-white shadow-sm text-gray-700" : "text-gray-400 hover:text-gray-600",
                )}
                title="Calendar view"
              >
                <CalendarRange size={14} />
              </button>
            </div>
          </div>

          {/* Fix 5: Removed redundant subtitle. Search bar is now cleaner. */}
          <div className="flex items-center justify-end px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <InputCustom
                  type="text"
                  placeholder="Search bookings…"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-52 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                />
              </div>
              <button
                title="Date Filter"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <Calendar size={13} />
                <span className="text-xs font-medium">Date</span>
              </button>
              <button
                title="Filters"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-all",
                  activeFilterCount > 0
                    ? "border-brand-primary bg-red-50 text-brand-primary"
                    : "border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm",
                )}
              >
                <SlidersHorizontal size={13} />
                <span className="text-xs font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary text-white text-[9px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <RevBookingTable
              paginated={paginated}
              currentPage={currentPage}
              sortDir={sortDir}
              onToggleSort={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              onNavigate={onNavigate}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
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

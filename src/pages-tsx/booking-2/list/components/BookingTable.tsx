// Booking 2.0 — Booking List table with a reordered column set (Training
// Mode + Courseware moved up, ahead of Booking Time/Status). Cell renderers
// (StatusBadge, StationQtyCell) and the
// parseBookingTime helper are reused as-is from the current booking module —
// they're generic presentational pieces, not booking-2-specific, and none of
// them are modified here.
import { useMemo } from "react";
import { Icon } from "@/components/icon";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { StatusBadge } from "@/components/status-badge";
import { BOOKING_STATUS_TONE } from "../statusTone";
import type { Booking } from "@/data/mock";
import { PER_PAGE } from "@/pages-tsx/booking/list/constants";
import { parseBookingTime } from "@/pages-tsx/booking/list/utils";
import { BookingRowMenu } from "./BookingRowMenu";
import { MultiValueCell } from "./MultiValueCell";
import { StationQtyCell } from "@/pages-tsx/booking/list/components/StationQtyCell";

// Multi-value cell (e.g. Weapon Type(s)) — shows the first 3 values, then a
// "+N" pill for the rest with the full list on hover, instead of letting a
// long comma-joined string run on or silently truncate with no way to see
// what's hidden. New, local to booking-2's table — not shared.

interface BookingTableProps {
  paginated: Booking[];
  currentPage: number;
  sortDir: "asc" | "desc";
  onToggleSort: () => void;
  onNavigate?: (path: string) => void;
  /** Column id → shown. Driven by ColumnCustomizer; undefined keeps every column. */
  visibleColumns?: Record<string, boolean>;
  /** Overrides the Eye button: Today's Booking opens a quick-preview drawer
   *  here (Figma `Drawer - Booking Details`, 6761:61157) instead of
   *  navigating straight to the full page. Booking List doesn't pass this,
   *  so its Eye button keeps navigating directly. */
  onViewBooking?: (booking: Booking) => void;
  /** Active search text — when the table is empty because of it, Figma's
   *  `Search - Empty Result` (5029:30073) copy replaces the generic empty state. */
  searchQuery?: string;
}

const columnHelper = createColumnHelper<Booking>();

const COLUMN_WIDTHS: Record<string, number> = {
  rowNum: 64, booking: 320, trainingType: 160, trainingMode: 160, courseware: 240,
  bookingTime: 400, status: 160, assignmentId: 160, unitName: 160, weaponTypes: 240,
  briefingRoom: 240, baseStationQty: 240, traineesCount: 160, instructorName: 160,
  ftmsFileId: 160, action: 104,
};

/** How many coursewares a booking carries — drives Figma's "Multiple Courseware". */
function countCourseware(raw: string | undefined | null) {
  return String(raw ?? "").split(",").map((x) => x.trim()).filter(Boolean).length;
}

export function BookingTable({
  paginated,
  currentPage,
  sortDir: _sortDir,
  onToggleSort,
  onNavigate,
  visibleColumns,
  onViewBooking,
  searchQuery,
}: BookingTableProps) {
  const columns = useMemo(() => [
    ({
      id: "rowNum",
      header: () => "No.",
      cell: (info: any) => (
        <div
          className="text-sm text-body cursor-pointer"
          onClick={() => onNavigate?.(`/bookings-2/detail?id=${info.row.original.id}`)}
        >
          {(currentPage - 1) * PER_PAGE + info.row.index + 1}
        </div>
      ),
    } as unknown as import("@tanstack/react-table").ColumnDef<Booking>),

    columnHelper.display({
      id: "booking",
      size: 200,
      header: () => "Booking ID",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer max-w-[280px]"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <div className="font-semibold text-sm text-default hover:text-primary transition-colors leading-snug line-clamp-2">
              {booking.program}
            </div>
            {/* Figma: the code alone, 12 Regular `text/body` — no "Booking ID -"
                prefix and no monospace. */}
            <div className="mt-0.5 truncate text-xs text-body">{booking.bookingId}</div>
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            {booking.trainingType}
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            {booking.trainingMode}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "courseware",
      header: () => "Courseware",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <MultiValueCell
            value={booking.courseware}
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          />
        );
      },
    }),

    columnHelper.display({
      id: "bookingTime",
      header: () => (
        <button
          onClick={onToggleSort}
          className="flex items-center gap-1 hover:text-primaryhover transition-colors"
        >
          Booking Time
          <Icon name="arrow-up-down" size={14} className="text-disabled" />
        </button>
      ),
      /*
       * Figma writes this cell two ways, and the code only had one of them:
       *
       *   single courseware   "1 Dec 2025"                      14 Regular text/default
       *                       "AM Session (08:00 AM - 12:00 PM)" 12 Regular text/body
       *
       *   multiple courseware "30 Nov 2025 08:00 AM - 05:00 PM" 14 Regular text/default
       *                       "Multiple Courseware"             12 Medium  text/primary
       *
       * So a booking that spans several coursewares shows the whole span on one
       * line and says so underneath, instead of a session label that would only
       * describe one of them. The date was also Semi Bold here; Figma has it
       * Regular, with only the Booking ID cell bolded.
       */
      cell: (info) => {
        const booking = info.row.original;
        const { date, timeRange, label } = parseBookingTime(booking.bookingTime);
        const multi = countCourseware(booking.courseware) > 1;

        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <div className="text-sm text-default">
              {multi && timeRange ? `${date} ${timeRange}` : date}
            </div>
            {multi ? (
              <div className="mt-0.5 text-xs font-medium text-primary">Multiple Courseware</div>
            ) : (
              (label || timeRange) && (
                <div className="mt-0.5 text-xs text-body">
                  {label && timeRange ? `${label} (${timeRange})` : label || timeRange}
                </div>
              )
            )}
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
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <StatusBadge tone={BOOKING_STATUS_TONE[booking.status]}>{booking.status}</StatusBadge>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "assignmentId",
      header: () => "Assignment ID",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <MultiValueCell
            value={booking.assignmentId}
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          />
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
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
        const list = booking.weaponTypes && booking.weaponTypes.length > 0 ? booking.weaponTypes : booking.weapon ? [booking.weapon] : [];
        return (
          <MultiValueCell
            value={list}
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          />
        );
      },
    }),

    columnHelper.display({
      id: "briefingRoom",
      header: () => "Briefing Room",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <MultiValueCell
            value={booking.briefingRoom}
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          />
        );
      },
    }),

    columnHelper.display({
      id: "baseStationQty",
      header: () => "Base Station Quantity",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <StationQtyCell
              flatQty={booking.baseStationQty}
              cShapedQty={booking.cShapedStationQty}
              flatStations={booking.assignedStations}
              cShapedStations={booking.assignedCShapedStations}
            />
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
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
            className="text-sm text-default cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            {booking.ftmsFileId ?? "-"}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "createdAt",
      header: () => "Created at",
      cell: (info) => {
        const booking = info.row.original;
        const [date, time] = String(booking.createdOn ?? "").split("\n");
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <div className="text-sm text-default">{date || "\u2014"}</div>
            {time && <div className="mt-0.5 text-xs text-body">{time}</div>}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "createdBy",
      header: () => "Created by",
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div
            className="cursor-pointer"
            onClick={() => onNavigate?.(`/bookings-2/detail?id=${booking.id}`)}
          >
            <div className="text-sm text-default">{booking.createdBy ?? "\u2014"}</div>
            {booking.createdByRole && (
              <div className="mt-0.5 text-xs text-body">{booking.createdByRole}</div>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "action",
      header: () => "Actions",
      /*
       * Figma's Actions cell holds exactly two controls: View and the 3-dot
       * menu. The flow shortcut that used to sit first — Issue Assets /
       * Start Onboarding / Continue Session, picked from the booking's status —
       * is not in the frame. Those routes are still reachable from the 3-dot
       * menu and from the booking detail page, so nothing became unreachable.
       */
      cell: (info) => {
        const booking = info.row.original;
        return (
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewBooking) onViewBooking(booking);
                else onNavigate?.(`/bookings-2/detail?id=${booking.id}`);
              }}
              className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
              title="View Details"
            >
              <Icon name="eye" size={16} />
            </button>
            <BookingRowMenu booking={booking} onNavigate={onNavigate} />
          </div>
        );
      },
    }),
  ], [currentPage, onNavigate, onToggleSort, onViewBooking]);

  // Figma `Table - Header Cell` widths (5331:428546).
  const shownColumns = useMemo(
    () =>
      (visibleColumns ? columns.filter((c: any) => visibleColumns[c.id] !== false) : columns).map((c: any) =>
        COLUMN_WIDTHS[c.id] ? { ...c, width: COLUMN_WIDTHS[c.id], minWidth: COLUMN_WIDTHS[c.id] } : c,
      ),
    [columns, visibleColumns],
  );

  return (
    <TableCustom
      columns={shownColumns}
      data={paginated}
      autoScrollTable={true}
      // Figma `Table Header`: fill color/background/danger/invert/soft on a
      // color/border/invert/default rule, labels in color/text/primary.
      classThead="bg-danger-invert-soft"
      frozenColumns={2}
      {...(searchQuery?.trim()
        ? {
            emptyIcon: <Icon name="search" size={24} className="text-disabled" />,
            emptyTitle: `No result for \u201c${searchQuery.trim()}\u201d`,
            emptySubtitle: "Try a different keyword.",
          }
        : {})}
    />
  );
}

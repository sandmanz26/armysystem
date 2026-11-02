/*
 * Booking 2.0 — Today's Booking.
 *
 * Figma page `↪ Today's Booking` (`5029:21093`), section `Today's Booking`
 * (`5029:22855`), frames `List` (`6315:38290`) and `List - Expand`
 * (`6214:246975`).
 *
 * Rebuilt 27 Sep 2026, Bookings by Station rebuilt again 29 Sep 2026. The page
 * used to be four static summary cards above one base-station table. Figma
 * has **five `Advanced Tab Item` cards that are the navigation**: picking one
 * swaps both the section header and the table below.
 *
 *   Total Bookings        the Booking List's own 9-column table
 *   Group Bookings        the same, Training Type: Group
 *   Individual Bookings   the same, Training Type: Individual
 *   Bookings by Station   Base Stations · Active Lanes · Booking ID ·
 *                         Booking Time · Status · Assignments
 *   Issued Assignments    No. · Assignment ID · Assignment Type · Booking ID ·
 *                         Assignment Status · Base Station(s) · Asset Qty ·
 *                         Issued Date · Returned Date · Actions
 *
 * Tab item, read off the frame — unselected `color/background/default/default`
 * with `color/text/placeholder` label and `color/text/caption` figure;
 * selected drops the fill, turns the label `color/text/default`, the icon and
 * figure `color/text/primary`, and adds a 2px `color/background/primary/default`
 * bar along the bottom.
 *
 * The first three tabs reuse `BookingTable` rather than redrawing nine columns:
 * Figma's `Table - Today's Booking - Bookings` is the Booking List table.
 *
 * Bookings by Station (`Table - Today's Booking - Bookings By Station`,
 * 6214:246975) is NOT a collapsible summary-with-expand table — verified via
 * figma_execute on 29 Sep 2026 after the previous pass built exactly that
 * wrong shape. It's a flat table where every booking at a station is its own
 * always-visible row; the station's own name/"N booking(s)" and active-lanes
 * cells are drawn ONCE per station and visually span every row of that
 * station's group (here: rendered on the first flattened row only, blank on
 * the rest — `stationRows`/`StationTableRow`). Each booking row also carries
 * a 6px accent bar at the true left edge of the Booking ID column, coloured
 * to match that row's status badge (`ACCENT_BG`) — confirmed via the node's
 * own `layoutPositioning: "ABSOLUTE"` geometry, not a border. A station with
 * zero bookings (WPT-05) draws a single "No bookings" cell in the Booking ID
 * column instead of a Group of Rows.
 *
 * Known deviation: Figma's border lives only on the grouped-columns "Row"
 * wrapper (no divider under a station/active-lanes blank-continuation cell),
 * but `TableCustom` draws its `border-b` per physical `<tr>` across every
 * column uniformly. Flattening into TanStack rows means the blank
 * station/active-lanes cells get that same full-width divider too — a shared
 * primitive limitation, not missed data. Not worth forking `TableCustom` for
 * one page; flagged here and in CHANGES.md instead of silently forking it or
 * silently claiming a pixel match.
 */
import { useMemo, useState } from "react";
import { BookOpen, UsersRound, UserRound, MapPin, PackageCheck } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { bookings, type Booking } from "@/data/mock";
import { BookingTable } from "@/pages-tsx/booking-2/list/components/BookingTable";
import { DEFAULT_VISIBLE_COLUMNS } from "@/pages-tsx/booking-2/list/components/ColumnCustomizer";
import { BookingPreviewDrawer } from "./components/BookingPreviewDrawer";
import { BASE_STATIONS, TAB_META, TODAY_ASSIGNMENTS } from "./constants";
import type {
  StationBookingRow,
  TodayAssignment,
  TodayTab,
  TodaysBookingProps,
} from "./types";

/** One flattened row of the Bookings by Station table — see the file header
 *  comment. `stationName`/`stationBookingCount`/`activeLanes` are only set on
 *  the first flattened row of each station's group; `booking` is absent only
 *  for a zero-booking station's single placeholder row. */
interface StationTableRow {
  key: string;
  stationName?: string;
  stationBookingCount?: number;
  activeLanes?: string;
  booking?: StationBookingRow;
}

function bookingCountLabel(n: number) {
  if (n === 1) return "1 booking";
  return `${n} booking${n === 0 ? "" : "s"}`;
}

const stationRowHelper = createColumnHelper<StationTableRow>();

/**
 * The full booking behind a station row, for `BookingPreviewDrawer` (Figma `Drawer - Booking Details`,
 * 6761:61157). Station rows carry Figma's sample identity (name, ID, status, assignment); every other
 * field — courseware, weapon types, roles, instructor, dates — comes from the linked booking record.
 */
function stationBookingToBooking(row: StationBookingRow): Booking | null {
  const base = bookings.find((b) => b.id === row.bookingRef);
  if (!base) return null;
  const unit = row.program.replace(/^.* for (?:Unit )?/, "");
  return {
    ...base,
    program: row.program,
    bookingId: row.bookingId,
    status: row.status,
    trainingType: row.program.startsWith("Individual") ? "Individual" : "Group",
    unitName: unit,
    assignmentId: row.assignmentId ?? "-",
    assetIssued: !!row.assignmentId,
  };
}

/** Figma's `Badge` tones, not hand-rolled Tailwind shades — re-verified
 *  29 Sep 2026 against the Bookings by Station accent bars (6214:246975):
 *  Completed is `success` and Ongoing is `orange`, the reverse of what this
 *  map had before. */
const STATUS_TONE: Record<string, "info" | "success" | "neutral" | "danger" | "orange" | "purple"> = {
  Upcoming: "info",
  Ongoing: "orange",
  Completed: "success",
  Overdue: "danger",
  "Return Assets": "orange",
  Cancelled: "neutral",
  Issued: "purple",
  "Pending Return": "orange",
  Returned: "success",
  Missing: "danger",
  "Ownership Transferred": "success",
  "Ownership Received": "purple",
};

/** Solid `background/<hue>/default` classes for the Bookings by Station accent
 *  bar — a different token family than `StatusBadge`'s own soft/invert fill,
 *  resolved from the indicator RECTANGLE's own bound variable (a different
 *  variable id than the badge text, same hex per hue). */
const TONE_ACCENT_BG: Record<string, string> = {
  success: "bg-success-default",
  info: "bg-info-default",
  orange: "bg-orange-default",
  danger: "bg-danger-default",
  purple: "bg-purple-default",
  warning: "bg-warning-default",
  neutral: "bg-default-default",
};

const TABS: { id: TodayTab; icon: typeof BookOpen }[] = [
  { id: "Total Bookings", icon: BookOpen },
  { id: "Group Bookings", icon: UsersRound },
  { id: "Individual Bookings", icon: UserRound },
  { id: "Bookings by Station", icon: MapPin },
  { id: "Issued Assignments", icon: PackageCheck },
];

const assignmentHelper = createColumnHelper<TodayAssignment>();

export function TodaysBooking2({ onNavigate }: TodaysBookingProps) {
  const [tab, setTab] = useState<TodayTab>("Total Bookings");
  const [previewBooking, setPreviewBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /*
   * The mock data carries no "is it today" flag, so these are the same
   * bookings the Booking List shows. Filtering by date needs a real feed, not
   * an invented one — noted rather than faked.
   */
  const groupBookings = useMemo(() => bookings.filter((b) => b.trainingType === "Group"), []);
  const individualBookings = useMemo(
    () => bookings.filter((b) => b.trainingType === "Individual"),
    [],
  );

  const counts: Record<TodayTab, number> = {
    "Total Bookings": bookings.length,
    "Group Bookings": groupBookings.length,
    "Individual Bookings": individualBookings.length,
    "Bookings by Station": BASE_STATIONS.reduce((n, st) => n + st.bookings.length, 0),
    "Issued Assignments": TODAY_ASSIGNMENTS.length,
  };

  const stationRows = useMemo<StationTableRow[]>(() => {
    const rows: StationTableRow[] = [];
    BASE_STATIONS.forEach((station) => {
      if (station.bookings.length === 0) {
        rows.push({ key: `${station.name}-empty`, stationName: station.name, stationBookingCount: 0, activeLanes: station.activeLanes });
        return;
      }
      station.bookings.forEach((booking, i) => {
        rows.push({
          key: `${station.name}-${i}`,
          stationName: i === 0 ? station.name : undefined,
          stationBookingCount: i === 0 ? station.bookings.length : undefined,
          activeLanes: i === 0 ? station.activeLanes : undefined,
          booking,
        });
      });
    });
    return rows;
  }, []);

  const stationColumns = useMemo<ColumnDef<StationTableRow, any>[]>(() => [
    stationRowHelper.display({
      id: "station",
      // Figma 6214:246975 column width
      width: "120px", minWidth: "120px",
      header: () => "Base Stations",
      cell: ({ row }: { row: { original: StationTableRow } }) => {
        const r = row.original;
        if (r.stationName === undefined) return null;
        return (
          <div>
            <div className="text-sm font-semibold text-default">{r.stationName}</div>
            <div className="mt-0.5 text-xs text-body">{bookingCountLabel(r.stationBookingCount ?? 0)}</div>
          </div>
        );
      },
    } as any),
    stationRowHelper.display({
      id: "activeLanes",
      // Figma 6214:246975 column width
      width: "120px", minWidth: "120px",
      header: () => "Active Lanes",
      cell: ({ row }: { row: { original: StationTableRow } }) => (
        row.original.activeLanes ? <span className="text-sm text-default">{row.original.activeLanes}</span> : null
      ),
    } as any),
    stationRowHelper.display({
      id: "booking",
      // Figma 6214:246975 column width
      width: "336px", minWidth: "336px",
      header: () => "Booking ID",
      cell: ({ row }: { row: { original: StationTableRow } }) => {
        const b = row.original.booking;
        if (!b) return <span className="text-sm text-body">No bookings</span>;
        const accent = TONE_ACCENT_BG[STATUS_TONE[b.status] ?? "neutral"];
        return (
          <div className="relative -ml-5 -my-3 flex h-14 items-center">
            <span className={cn("absolute inset-y-0 left-0 w-1.5", accent)} />
            {/* Figma: clicking the Booking ID opens the Booking Details drawer (dev feedback #1). */}
            <button
              type="button"
              onClick={() => { const full = stationBookingToBooking(b); if (full) setPreviewBooking(full); }}
              className="min-w-0 pl-5 pr-2 text-left"
            >
              <div className="truncate text-sm font-semibold text-default hover:text-primary transition-colors">{b.program}</div>
              <div className="mt-0.5 truncate text-xs text-body">
                {b.bookingId}{b.alsoAt?.length ? ` · also at ${b.alsoAt.join(", ")}` : ""}
              </div>
            </button>
          </div>
        );
      },
    } as any),
    stationRowHelper.display({
      id: "time",
      // Figma 6214:246975 column width
      width: "200px", minWidth: "200px",
      header: () => "Booking Time",
      cell: ({ row }: { row: { original: StationTableRow } }) => {
        const b = row.original.booking;
        if (!b) return null;
        return (
          <div>
            <div className="text-sm text-default">{b.timeRange}</div>
            <div className="mt-0.5 text-xs text-body">{b.session}</div>
          </div>
        );
      },
    } as any),
    stationRowHelper.display({
      id: "status",
      // Figma 6214:246975 column width
      width: "160px", minWidth: "160px",
      header: () => "Status",
      cell: ({ row }: { row: { original: StationTableRow } }) => {
        const b = row.original.booking;
        if (!b) return null;
        return <StatusBadge tone={STATUS_TONE[b.status] ?? "neutral"}>{b.status}</StatusBadge>;
      },
    } as any),
    stationRowHelper.display({
      id: "assignments",
      // Figma 6214:246975 column width
      width: "160px", minWidth: "160px",
      header: () => "Assignments",
      cell: ({ row }: { row: { original: StationTableRow } }) => {
        const b = row.original.booking;
        if (!b) return null;
        return <span className="text-sm text-default">{b.assignmentId ?? <span className="text-body">{"—"}</span>}</span>;
      },
    } as any),
  ], []);

  const assignmentColumns = useMemo<ColumnDef<TodayAssignment, any>[]>(() => [
    assignmentHelper.display({
      id: "no",
      header: () => "No.",
      cell: (info) => <span className="text-sm text-body">{info.row.index + 1}</span>,
    }),
    assignmentHelper.accessor("assignmentId", {
      header: () => "Assignment ID",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    assignmentHelper.accessor("assignmentType", {
      header: () => "Assignment Type",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    assignmentHelper.display({
      id: "booking",
      header: () => "Booking ID",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-semibold text-default">{row.original?.bookingName ?? "\u2014"}</div>
          {row.original?.bookingId && (
            <div className="mt-0.5 text-xs text-body">
              {row.original.bookingId}
              {typeof row.original.coursewareCount === "number" ? ` \u00b7 ${row.original.coursewareCount} CW` : ""}
            </div>
          )}
        </div>
      ),
    }),
    assignmentHelper.accessor("status", {
      header: () => "Assignment Status",
      cell: (info) => (
        info.getValue() ? (
          <StatusBadge tone={STATUS_TONE[info.getValue() as string] ?? "neutral"}>
            {info.getValue() as string}
          </StatusBadge>
        ) : (
          <span className="text-sm text-body">{"\u2014"}</span>
        )
      ),
    }),
    assignmentHelper.display({
      id: "baseStations",
      header: () => "Base Station(s)",
      cell: ({ row }) => (
        <span className="text-sm text-default">
          {(row.original?.baseStations ?? []).join(", ") || "\u2014"}
        </span>
      ),
    }),
    assignmentHelper.accessor("assetQty", {
      header: () => "Asset Qty",
      cell: (info) => (
        <span className="text-sm text-default">
          {info.getValue() == null ? "\u2014" : `${info.getValue()} Assets`}
        </span>
      ),
    }),
    assignmentHelper.display({
      id: "issuedDate",
      header: () => "Issued Date",
      cell: ({ row }) => <DateCell value={row.original?.issuedDate} />,
    }),
    assignmentHelper.display({
      id: "returnedDate",
      header: () => "Returned Date",
      cell: ({ row }) => <DateCell value={row.original?.returnedDate} />,
    }),
    assignmentHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: () => null,
    }),
  ], []);

  const meta = TAB_META[tab];

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-4">
        {/* Page Header — title + View All Bookings / Issue Assets */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold text-default">Today&rsquo;s Booking</h1>
          <div className="flex gap-3">
            <Button
              type="outline"
              onClick={() => onNavigate("/bookings/list")}
              className="w-auto h-10 px-4 py-0 text-sm font-semibold rounded-lg bg-surface border border-invert-default text-default hover:bg-default-hovered"
            >
              View All Bookings
            </Button>
            <Button
              onClick={() => onNavigate("/bookings/assignments/new")}
              className="w-auto h-10 px-4 py-0 text-sm font-semibold rounded-lg bg-primary-default text-invert-default hover:bg-primary-hovered"
            >
              Issue Assets
            </Button>
          </div>
        </div>

        <div className="bg-surface-lv1 rounded-xl border border-invert-default overflow-hidden">
          {/* Advanced Tab Group — five cards that ARE the navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-b border-invert-default">
            {TABS.map(({ id, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    setPage(1);
                  }}
                  className={cn(
                    "relative flex h-[72px] items-center gap-3 border-r border-invert-default px-4 text-left last:border-r-0 transition-colors",
                    active ? "bg-surface" : "bg-default-default hover:bg-default-hovered",
                  )}
                >
                  <Icon size={24} className={active ? "text-primary" : "text-body"} />
                  <span className="flex flex-col">
                    <span className={cn("text-xs", active ? "text-default" : "text-placeholder")}>
                      {id}
                    </span>
                    <span className={cn("text-base font-bold", active ? "text-primary" : "text-caption")}>
                      {counts[id]}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Header — title + the sentence explaining how the tab counts */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-default">{meta.title}</h2>
            <p className="mt-1 text-xs text-body">{meta.subtitle}</p>
          </div>

          {tab === "Bookings by Station" ? (
            <TableCustom
              columns={stationColumns}
              data={stationRows}
              autoScrollTable={false}
            />
          ) : tab === "Issued Assignments" ? (
            <TableCustom
              columns={assignmentColumns}
              data={TODAY_ASSIGNMENTS}
              autoScrollTable={true}
            />
          ) : (
            <BookingTable
              paginated={
                tab === "Group Bookings"
                  ? groupBookings
                  : tab === "Individual Bookings"
                    ? individualBookings
                    : bookings
              }
              currentPage={page}
              sortDir={sortDir}
              onToggleSort={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              onNavigate={onNavigate}
              visibleColumns={DEFAULT_VISIBLE_COLUMNS}
              onViewBooking={setPreviewBooking}
            />
          )}
        </div>
      </div>

      {previewBooking && (
        <BookingPreviewDrawer
          booking={previewBooking}
          onClose={() => setPreviewBooking(null)}
          onViewFull={() => onNavigate(`/bookings/detail?id=${previewBooking.id}`)}
        />
      )}
    </div>
  );
}

/** "6 Jun 2026\n11:09:00 PM" → date over time; absent renders Figma's em dash. */
function DateCell({ value }: { value?: string }) {
  if (!value) return <span className="text-sm text-body">{"\u2014"}</span>;
  const [date, time] = value.split("\n");
  return (
    <div>
      <div className="text-sm text-default">{date}</div>
      {time && <div className="mt-0.5 text-xs text-body">{time}</div>}
    </div>
  );
}

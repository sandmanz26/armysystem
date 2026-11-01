import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Icon, type IconName } from "@/components/icon";
import { Pagination } from "@/components/ui/Pagination";
import { Link } from "@/components/link";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "../constants";
import {
  OA_MONTHS,
  OA_DETAIL_BOOKINGS,
  OA_DETAIL_STATIONS,
  type OADetailBooking,
  type OADetailStation,
  type OABookingStation,
  type OALaneDowntime,
} from "../data";
import { formatHMS, isCompliant, parseHMS } from "../utils";
import { AOBadge } from "../components/AOBadge";
import { InfoHeader } from "../components/InfoHeader";
import { FilterDrawer, EMPTY_OA_FILTERS, countOAFilters, type OADetailFilters } from "./FilterDrawer";

/*
 * Operational Availability Details — Figma section `Operational Availability
 * Details` on page 5004:113419: `List - Filled` Bookings tab (8033:293789),
 * Base Stations tab (8050:145443), `List - Tooltip` (8033:293791) and
 * `Empty-Search` (8050:139044). Opened from the 👁 on the month list.
 *
 * Built for F-005 OA-2 (the 👁 needed a destination). The month list's old
 * chevron expand (booking → device → lane) lives here now as Figma's nested
 * tables: booking → base station → lane downtime.
 *
 * F-007 OA-6:
 *   · Bookings tab: `Filter` button (sliders-horizontal, outlined sm; primary
 *     border/text + count badge once applied) opening the Filter drawer
 *     (8050:156460, ./FilterDrawer). Downtime narrows to bookings with / without
 *     downtime; Base Station keeps bookings that had downtime on any picked
 *     station. With a filter applied the heading count is the filtered count
 *     (Figma "Bookings 3"); a filter with no match shows the table's default
 *     "No data to show right now" (8050:156484). Search shows a clear ✕ (8050:139044).
 *   · Base Stations tab: "Bookings Affected" = count over a `Link` "View ›"
 *     (12 Medium, chevron-right 16). Figma's `View Affected Bookings`
 *     (8051:160573) is an empty link placeholder (PRD-GAPS P-13), so "View"
 *     opens the Bookings tab filtered to that station + With downtime — the
 *     bookings that station's downtime affected, using Figma's own filter.
 *   · Chevrons only on rows that have a breakdown: TableCustom spreads the
 *     condition's props onto a `flex` button, so `hidden` alone never hid it.
 */

/* Hides the expand chevron but keeps its 40px slot so the columns stay put. */
const NO_CHEVRON = { style: { visibility: "hidden" as const }, tabIndex: -1, "aria-hidden": true };

/* TableCustom draws a drop shadow on its sticky "action" (expand) column;
 * Figma's tables have none. Descendant selector out-specifies the cell class. */
const NO_ACTION_SHADOW = "[&_th]:shadow-none [&_td]:shadow-none";

function KpiCard({ icon, well, label, value, valueClass }: {
  icon: IconName; well: string; label: string; value: ReactNode; valueClass?: string;
}) {
  // Figma `Data Display - Training Result, System Health`: 262×84, padding 16,
  // gap 16, 48×48 icon well r8, label 12 text/body over value Bold 24.
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-xl border border-invert-default bg-surface p-4">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-lg", well)}>
        <Icon name={icon} size={24} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs leading-4 text-body">{label}</span>
        <span className={cn("text-2xl font-bold leading-8 text-default", valueClass)}>{value}</span>
      </span>
    </div>
  );
}

/* Figma greys a zero downtime ("0m 0s", "0/15") and its "—" share. */
const muted = (v: string) =>
  v === "—" || v.startsWith("0/") || (/\d[hms]/.test(v) && parseHMS(v) === 0) ? "text-body" : "text-default";

function LaneTable({ lanes }: { lanes: OALaneDowntime[] }) {
  const columns: ColumnDef<OALaneDowntime, any>[] = ([
    { accessorKey: "lane",   width: 348, header: () => "Lane",  cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "start",  width: 160, header: () => "Start", cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "end",    width: 160, header: () => "End",   cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "dt",     width: 160, header: () => <InfoHeader label="Activity DT" tooltip="Activity Down Time" />, cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "reason", width: 200, header: () => "Reason", cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
  ] as any[]);
  return (
    <div className="border-t border-invert-default bg-main-background p-4">
      <div className="overflow-hidden rounded-lg border border-invert-default bg-surface">
        <TableCustom columns={columns} data={lanes} autoScrollTable={false} actionSticky={false} />
      </div>
    </div>
  );
}

function StationTable({ stations }: { stations: OABookingStation[] }) {
  const columns: ColumnDef<OABookingStation, any>[] = ([
    { accessorKey: "station", width: 662, header: () => "Base Station", cell: (i: any) => <span className="text-sm font-semibold text-default">{i.getValue()}</span> },
    { accessorKey: "dt", width: 160, header: () => <InfoHeader label="Activity DT" tooltip="Activity Down Time" />, cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    { accessorKey: "lanesAffected", width: 160, header: () => "Lanes Affected", cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    { id: "action", width: 80, minWidth: 80, header: () => "", cell: () => null },
  ] as any[]);
  return (
    <div className="border-t border-invert-default bg-main-background p-4">
      <div className="overflow-hidden rounded-lg border border-invert-default bg-surface">
        <TableCustom
          columns={columns}
          data={stations}
          autoScrollTable={false}
          className={NO_ACTION_SHADOW}
          nestedComponentButtonCondition={(row: any) => (row.original.lanes.length === 0 ? NO_CHEVRON : {})}
          getNestedComponent={(row: any) => <LaneTable lanes={row.original.lanes} />}
        />
      </div>
    </div>
  );
}

export function OperationalAvailability2Detail() {
  const { monthId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"bookings" | "stations">("bookings");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OADetailFilters>(EMPTY_OA_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterCount = countOAFilters(filters);

  const index = OA_MONTHS.findIndex((m) => m.id === monthId);
  const month = OA_MONTHS[index];
  // OA_MONTHS is newest first: the previous month is the next array item.
  const prev = OA_MONTHS[index + 1];
  const next = index > 0 ? OA_MONTHS[index - 1] : undefined;

  const bookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Kept in Figma's row order: the frame's own sample (45m 30s, 32m 10s,
    // 57m 30s …) is not strictly "highest first" as the subtitle says.
    return OA_DETAIL_BOOKINGS.filter((b) => {
      if (q && !b.name.toLowerCase().includes(q) && !b.ref.toLowerCase().includes(q)) return false;
      const hasDowntime = parseHMS(b.dt) > 0;
      if (filters.downtime === "with" && !hasDowntime) return false;
      if (filters.downtime === "without" && hasDowntime) return false;
      if (
        filters.stations.length > 0 &&
        !b.stations.some((s) => filters.stations.includes(s.station) && parseHMS(s.dt) > 0)
      ) {
        return false;
      }
      return true;
    });
  }, [search, filters]);

  /* "View" on a Base Stations row → that station's affected bookings. */
  const viewAffectedBookings = (station: string) => {
    setFilters({ downtime: "with", stations: [station] });
    setSearch("");
    setTab("bookings");
    setPage(1);
  };
  const stations = useMemo(
    () => [...OA_DETAIL_STATIONS].sort((a, c) => parseHMS(c.dt) - parseHMS(a.dt)),
    [],
  );

  if (!month) {
    return (
      <div className="flex-1 overflow-auto bg-main-background p-6 text-sm text-body">
        Month not found.
      </div>
    );
  }

  const rows = tab === "bookings" ? bookings : stations;
  const paged = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const no = (i: number) => (page - 1) * PER_PAGE + i + 1;

  const bookingColumns: ColumnDef<OADetailBooking, any>[] = ([
    { id: "no", width: 64, minWidth: 64, header: () => "No.", cell: (i: any) => <span className="text-sm text-body">{no(i.row.index)}</span> },
    {
      accessorKey: "name", width: 472, header: () => "Booking ID",
      cell: (i: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-default">{i.row.original.name}</span>
          <span className="text-xs text-body">{i.row.original.ref}</span>
        </div>
      ),
    },
    { accessorKey: "ut", width: 160, header: () => <InfoHeader label="Activity UT" tooltip="Activity Up Time" />, cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "dt", width: 160, header: () => <InfoHeader label="Activity DT" tooltip="Activity Down Time" />, cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    { accessorKey: "share", width: 160, header: () => "Share of month DT", cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    { id: "action", width: 80, minWidth: 80, header: () => "", cell: () => null },
  ] as any[]);

  const stationColumns: ColumnDef<OADetailStation, any>[] = ([
    { id: "no", width: 64, minWidth: 64, header: () => "No.", cell: (i: any) => <span className="text-sm text-body">{no(i.row.index)}</span> },
    { accessorKey: "station", width: 392, header: () => "Station", cell: (i: any) => <span className="text-sm font-semibold text-default">{i.getValue()}</span> },
    { accessorKey: "ut", width: 160, header: () => <InfoHeader label="Activity UT" tooltip="Activity Up Time" />, cell: (i: any) => <span className="text-sm text-default">{i.getValue()}</span> },
    { accessorKey: "dt", width: 160, header: () => <InfoHeader label="Activity DT" tooltip="Activity Down Time" />, cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    { accessorKey: "share", width: 160, header: () => "Share of month DT", cell: (i: any) => <span className={cn("text-sm", muted(i.getValue()))}>{i.getValue()}</span> },
    {
      accessorKey: "bookingsAffected", width: 160, header: () => "Bookings Affected",
      // Figma: the count over a `Link` "View ›" (12 Medium, chevron-right 16, gap 6).
      cell: (i: any) => (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm text-default">{i.getValue()}</span>
          {i.getValue() !== "—" && (
            <Link
              onClick={() => viewAffectedBookings(i.row.original.station)}
              className="gap-1.5 text-xs leading-4"
              aria-label={`View affected bookings for ${i.row.original.station}`}
            >
              View
              <Icon name="chevron-right" size={16} />
            </Link>
          )}
        </div>
      ),
    },
  ] as any[]);

  const navButton = (label: string, to: string, dir: "prev" | "next") => (
    <button
      type="button"
      onClick={() => { setPage(1); navigate(`/operational-availability-2/${to}`); }}
      className="flex h-10 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
    >
      {dir === "prev" && <Icon name="arrow-left" size={18} />}
      {label}
      {dir === "next" && <Icon name="arrow-right" size={18} />}
    </button>
  );

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="flex flex-col gap-6 p-6">
        {/* Figma `Page Header` */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold leading-7 text-default">{month.month}</h1>
              <AOBadge value={month.ao} />
            </div>
            <p className="text-xs leading-4 text-body">1-{month.days} {month.month}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {prev && navButton(prev.month, prev.id, "prev")}
            {next && navButton(next.month, next.id, "next")}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon="shield" well="bg-info-invert-default text-info" label="Operational Availability (AO)"
            value={`${month.ao.toFixed(2)}%`} valueClass={isCompliant(month.ao) ? "text-success" : "text-danger"} />
          <KpiCard icon="arrow-up" well="bg-success-invert-default text-success" label="Total Activity Up Time" value={formatHMS(month.utSeconds)} />
          <KpiCard icon="arrow-down" well="bg-danger-invert-default text-danger" label="Total Activity Down Time" value={formatHMS(month.dtSeconds)} />
          <KpiCard icon="book-open" well="bg-warning-invert-default text-warning" label="Total Bookings" value={month.totalBookings} />
        </div>

        <div className="overflow-hidden rounded-xl border border-invert-default bg-surface">
          {/* Figma `Tab Group v2` */}
          <div className="relative flex px-5">
            <div className="absolute inset-x-0 bottom-0 h-px bg-divider" />
            {([["bookings", "Bookings"], ["stations", "Base Stations"]] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setPage(1); }}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  tab === key ? "text-primary" : "text-body hover:text-default",
                )}
              >
                {label}
                {tab === key && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />}
              </button>
            ))}
          </div>

          {/* Figma `Section Header` */}
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2 text-base font-semibold leading-6">
                <h2 className="text-default">{tab === "bookings" ? "Bookings" : "Base Stations"}</h2>
                <span className="text-body">
                  {tab === "bookings" ? (filterCount > 0 ? bookings.length : month.totalBookings) : stations.length}
                </span>
              </div>
              <p className="text-xs leading-4 text-body">
                {tab === "bookings"
                  ? "Activity uptime and downtime for each booking this month, sorted by downtime, highest first."
                  : "Activity uptime and downtime for each base station this month, sorted by downtime, highest first."}
              </p>
            </div>
            {tab === "bookings" && (
              <div className="flex shrink-0 items-center gap-3">
                <div className="relative w-60">
                  <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
                  <InputCustom
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="h-9 w-full rounded-lg border border-invert-default bg-surface py-2 pl-10 pr-9 text-sm text-default placeholder:text-body focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => { setSearch(""); setPage(1); }}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-default"
                    >
                      <Icon name="x" size={18} />
                    </button>
                  )}
                </div>
                {/* Figma `Filter Text (Section Header - Right Content)` — outlined sm button. */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border bg-surface px-4 text-sm font-semibold transition-colors",
                    filterCount > 0 ? "border-primary text-primary" : "border-invert-default text-default hover:bg-main-background",
                  )}
                >
                  <Icon name="sliders-horizontal" size={16} />
                  Filter
                  {filterCount > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-base bg-primary-default px-0.5 text-xs font-semibold text-invert-default">
                      {filterCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {tab === "bookings" ? (
            // Keyed per tab: TableCustom keeps its own copy of `data`, so without a
            // remount the first render after Base Stations → Bookings pairs the
            // booking columns with station rows (and crashed on `.stations`).
            <TableCustom
              key="bookings"
              columns={bookingColumns}
              data={paged as OADetailBooking[]}
              autoScrollTable={false}
              className={NO_ACTION_SHADOW}
              nestedComponentButtonCondition={(row: any) => (!row.original.stations?.length ? NO_CHEVRON : {})}
              getNestedComponent={(row: any) => <StationTable stations={row.original.stations} />}
              {...(search.trim()
                ? {
                    emptyIcon: <Icon name="search" size={24} className="text-disabled" />,
                    emptyTitle: `No result for “${search}”`,
                    emptySubtitle: "Try a different keyword.",
                  }
                : {})}
            />
          ) : (
            <TableCustom
              key="stations"
              columns={stationColumns}
              data={paged as OADetailStation[]}
              autoScrollTable={false}
              actionSticky={false}
            />
          )}

          <Pagination currentPage={page} itemsPerPage={PER_PAGE} totalItems={rows.length} setCurrentPage={setPage} />

          <FilterDrawer
            open={filterOpen}
            filters={filters}
            onApply={(f) => { setFilters(f); setPage(1); }}
            onClose={() => setFilterOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

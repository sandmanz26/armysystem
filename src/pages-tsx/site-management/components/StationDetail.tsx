import { useState, useMemo, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { Checkbox } from "@/components/checkbox";
import { Tooltip } from "@/components/tooltip";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { Icon, type IconName } from "@/components/icon";
import { Link } from "@/components/link";
import { bookings } from "@/data/mock";
import type { BaseStation, BlackoutDate, Lane } from "../types";
import { LANE_PER_PAGE, BLACKOUT_PER_PAGE, type DetailTab, type BlackoutSubTab } from "../constants";
import { AddLaneDrawer } from "../modals/AddLaneDrawer";
import { AddBlackoutDrawer } from "../modals/AddBlackoutDrawer";
import {
  buildBlackoutRecord,
  isBlackoutActive,
  isLaneBlackedOut,
  nextLaneBlackout,
  type BlackoutFormValues,
} from "../blackoutRules";
import { BaseStationDrawer } from "../modals/BaseStationDrawer";
import { nextOfRecord, type NextOfRecord } from "../nextBlackout";

/*
 * Base Station Details — Figma page `Site Management Details` (5112:111649).
 *   Lane tab             5115:207624 (filled) · 5112:206989 (empty)
 *   Blackout Dates tab   5115:214445 (filled) · 5115:214443 (empty)
 *   Add Lane             5115:209861 + errors · toast 209866
 *   Delete Lane          5115:209905 · blocked 209903 · toast 209907
 *   Notes                6921:238015 — lane status comes from its blackout dates
 *   Add Blackout Date    5116:216632 / 5117:268113 + errors · toast 216634
 *   Delete Blackout      5116:217642 · toast 217644
 *   Delete Recurring     5117:261840 · toast 261842
 *
 * Page shape: (header breadcrumb Site Management › Base Station Details) →
 * station name + Delete/Edit Base Station → a "Base Station Details"
 * key-value card → a free-standing tab row Lanes | Blackout Dates → one card
 * per tab with its own table.
 *
 * Lanes tab columns:     ☐ 58 · Lane 120 · Status 120 · Next Blackout Date 518 ·
 *                        Last Updated on 160 · Actions 120 (eye, trash; right-aligned)
 * Lane Status is a pill only — Available / Unavailable, derived from the lane's
 * blackout windows (Notes 6921:238015). The old manual toggle is gone.
 * Blackout tab columns:  Status 120 · Blackout Date 854 · Actions 120 (trash)
 *
 * Blackout status is Active / **Passed**, and Passed is NEUTRAL, not danger.
 */

const upcomingBookingsForLane = (station: BaseStation, lane: Lane | null) =>
  lane
    ? bookings.filter(
        (b) => b.status === "Upcoming" && (b.assignedStations ?? []).includes(station.name),
      ).length
    : 0;

interface KeyValueProps {
  title: string;
  children: React.ReactNode;
}

/** Figma `Key Value`: 12 Regular title over a 14 Semi Bold value, 252 wide. */
function KeyValue({ title, children }: KeyValueProps) {
  return (
    <div className="flex min-w-[252px] flex-col gap-1">
      <span className="text-xs text-body">{title}</span>
      <div className="text-sm font-semibold text-default">{children}</div>
    </div>
  );
}

/*
 * Figma `Blackout Dates - Filled` (`5115:214445`, and the same cell in Lane Details
 * `5118:283747`) renders the Blackout Date cell as up to three lines, 4px apart, each with
 * its own 16px icon 8px before the text:
 *   calendar-sync  "Daily" / "Weekly on Sat, Sun"          (recurring only)
 *   calendar-x     "5 – 16 Oct 2026"                       → library has no `calendar-x`,
 *                                                            `calendar-days` stays (open question)
 *   clock-3        "06:00 PM – 11:00 PM" / "All day"
 * All three are 14 Regular `color/text/default`; the icons are `text/body` (107,114,128).
 * (It used to be repeat → clock → calendar, i.e. time above date.)
 *
 * Records created before the structured fields existed only carry the joined
 * `label`, so those fall back to splitting it — without icons, because a
 * joined string cannot say which line is which.
 */
export function BlackoutDateCell({ row }: { row: any }) {
  const lines: { icon: IconName; text: string }[] = [];
  if (row.recurrence) lines.push({ icon: "calendar-sync", text: row.recurrence });
  if (row.dateRange) lines.push({ icon: "calendar-days", text: row.dateRange });
  if (row.timeRange) lines.push({ icon: "clock-3", text: row.timeRange });

  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-0.5">
        {String(row.label || "")
          .split("\n")
          .filter(Boolean)
          .map((line: string, i: number) => (
            <span key={i} className="text-sm text-default">{line}</span>
          ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {lines.map(({ icon, text }, i) => (
        <span key={i} className="flex items-center gap-2 text-sm text-default">
          <Icon name={icon} size={16} className="flex-shrink-0 text-body" />
          {text}
        </span>
      ))}
    </div>
  );
}

/**
 * "View upcoming (n)" — Figma `Link` (12 Medium `text/primary`) that opens the dark
 * `Tooltip - Blackout Dates - Upcoming` (`7980:81954`, 192 wide, bold "Upcoming blackouts"
 * then one date per line) below it on hover / focus; click toggles it for touch.
 *
 * Portalled to `document.body` and positioned from the trigger's rect: the table sits inside a
 * card with `overflow-hidden` (and TableCustom's own scroller), which would clip an absolutely
 * positioned tooltip on the last rows — same reason BlackoutTooltip does it.
 */
function UpcomingLink({ upcoming }: { upcoming: string[] }) {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const place = useCallback(() => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setAnchor({ x: r.left + r.width / 2, y: r.bottom + 6 });
  }, []);

  useLayoutEffect(() => {
    if (!show) return;
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [show, place]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow((v) => !v)}
        className="self-start text-xs font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
      >
        View upcoming ({upcoming.length})
      </button>
      {show &&
        createPortal(
          <div className="pointer-events-none fixed z-[1113]" style={{ left: anchor.x, top: anchor.y }}>
            <Tooltip visible width={192} title="Upcoming blackouts" lines={upcoming} />
          </div>,
          document.body,
        )}
    </>
  );
}

/** Figma `Table - Body Cell - Blackout Dates` (Next Blackout Date): date, relative text, optional link. */
function NextBlackoutCell({ next }: { next: NextOfRecord | null }) {
  if (!next) return <span className="text-sm text-body">&mdash;</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-default">{next.date}</span>
        {next.relative && <span className="text-xs text-body">{next.relative}</span>}
      </div>
      {next.upcoming.length > 0 && <UpcomingLink upcoming={next.upcoming} />}
    </div>
  );
}

export function StationDetail({
  station,
  onBack,
  onViewLane,
}: {
  station: BaseStation;
  onBack: () => void;
  onViewLane: (lane: Lane) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("details");
  const [name, setName] = useState(station.name);
  const [lanes, setLanes] = useState<Lane[]>(station.lanes);
  const [blackoutDates, setBlackoutDates] = useState(station.blackoutDates);
  const [laneSearch, setLaneSearch] = useState("");
  const [lanePage, setLanePage] = useState(1);
  const [laneSelected, setLaneSelected] = useState<Set<string>>(new Set());
  const [showAddLane, setShowAddLane] = useState(false);
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [showEditStation, setShowEditStation] = useState(false);
  const [laneDeleteConfirm, setLaneDeleteConfirm] = useState<Lane | null>(null);
  /** Blackout row awaiting delete confirmation (the record itself — the table is filtered and paged). */
  const [blackoutDelete, setBlackoutDelete] = useState<BlackoutDate | null>(null);
  const [blackoutSubTab, setBlackoutSubTab] = useState<BlackoutSubTab>("overall");
  const [blackoutPage, setBlackoutPage] = useState(1);
  /** Bulk lane delete: the confirm, or the blocked list when selected lanes have upcoming bookings. */
  const [bulkDelete, setBulkDelete] = useState<"confirm" | "blocked" | null>(null);
  const [stationDelete, setStationDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredLanes = useMemo(
    () => lanes.filter((l) => !laneSearch || l.name.toLowerCase().includes(laneSearch.toLowerCase())),
    [lanes, laneSearch],
  );
  // Deleting lanes can leave the current page empty (bulk delete of the last page): clamp it.
  const safeLanePage = Math.min(lanePage, Math.max(1, Math.ceil(filteredLanes.length / LANE_PER_PAGE)));
  const paginatedLanes = filteredLanes.slice((safeLanePage - 1) * LANE_PER_PAGE, safeLanePage * LANE_PER_PAGE);

  const allLanesSelected =
    paginatedLanes.length > 0 && paginatedLanes.every((l) => laneSelected.has(l.id));
  const someLanesSelected = paginatedLanes.some((l) => laneSelected.has(l.id));

  const toggleAllLanes = () =>
    setLaneSelected((prev) => {
      const next = new Set(prev);
      if (allLanesSelected) paginatedLanes.forEach((l) => next.delete(l.id));
      else paginatedLanes.forEach((l) => next.add(l.id));
      return next;
    });

  const toggleLane = (id: string) =>
    setLaneSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /** Figma writes Last Updated on as "6 Jun 2026" over "11:09 PM" — no seconds. */
  const stamp = () => {
    const now = new Date();
    const d = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const t = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${d}\n${t}`;
  };

  /*
   * Lane availability is derived, never set by hand (Notes 6921:238015): a lane is
   * Unavailable while one of its blackouts is running. Lane Details still reads the
   * stored Active / Inactive, so the lane handed to it carries the derived value.
   */
  const now = new Date();
  const withDerivedStatus = (lane: Lane): Lane => ({
    ...lane,
    status: isLaneBlackedOut(lane, now) ? "Inactive" : "Active",
  });
  const openLane = (lane: Lane) => onViewLane(withDerivedStatus(lane));

  /** Figma card "Active Blackout Dates": blackouts (station + its lanes) that have not ended. */
  const activeBlackoutCount =
    blackoutDates.filter((d) => isBlackoutActive(d, now)).length +
    lanes.flatMap((l) => l.blackoutDates ?? []).filter((d) => isBlackoutActive(d, now)).length;

  /*
   * Blackout Dates tab — Overall / Active / Passed (Figma `7980:114689`, `7980:115614`).
   * A row is Active while any of its dates has not ended, Passed after (isBlackoutActive reads
   * the dates; old rows without dates fall back to their stored status). The count badge on the
   * Active tab and the section title count follow the sub-tab.
   */
  const blackoutActive = blackoutDates.filter((d) => isBlackoutActive(d, now));
  const blackoutPassed = blackoutDates.filter((d) => !isBlackoutActive(d, now));
  const blackoutRows =
    blackoutSubTab === "active" ? blackoutActive : blackoutSubTab === "passed" ? blackoutPassed : blackoutDates;
  const safeBlackoutPage = Math.min(blackoutPage, Math.max(1, Math.ceil(blackoutRows.length / BLACKOUT_PER_PAGE)));
  const pagedBlackouts = blackoutRows.slice((safeBlackoutPage - 1) * BLACKOUT_PER_PAGE, safeBlackoutPage * BLACKOUT_PER_PAGE);
  const BLACKOUT_SUB_TABS: { key: BlackoutSubTab; label: string; badge?: number }[] = [
    { key: "overall", label: "Overall" },
    { key: "active", label: "Active", badge: blackoutActive.length || undefined },
    { key: "passed", label: "Passed" },
  ];

  const handleAddLane = ({ name: laneName }: { name: string }) => {
    setLanes((prev) => [
      ...prev,
      { id: `lane-${Date.now()}`, name: laneName, status: "Active", blackoutDates: [], lastUpdatedOn: stamp() },
    ]);
    setToast(`${laneName} added`);
    setShowAddLane(false);
  };

  const handleDeleteLane = (lane: Lane) => {
    setLanes((prev) => prev.filter((l) => l.id !== lane.id));
    setLaneSelected((prev) => {
      const next = new Set(prev);
      next.delete(lane.id);
      return next;
    });
    setToast(`${lane.name} deleted`);
  };

  /*
   * Bulk delete — Figma `Action - Bulk Select` (6957:83073): the floating bar → Delete opens
   * "Delete 3 lanes?" (6957:101098) → toast "{n} lanes deleted" (6957:101100); when selected
   * lanes are tied to upcoming bookings it opens "Can't delete 3 lanes" (6957:83079) instead
   * and nothing is deleted. The "tied to bookings" rule is the one the single-lane delete
   * already uses (upcomingBookingsForLane).
   */
  const selectedLanes = lanes.filter((l) => laneSelected.has(l.id));
  const blockedLanes = selectedLanes
    .map((lane) => ({ lane, count: upcomingBookingsForLane(station, lane) }))
    .filter((b) => b.count > 0);

  const startBulkDelete = () => {
    // One blocked lane is the single-lane case: reuse its own dialog (5115:209903).
    if (blockedLanes.length === 1) setLaneDeleteConfirm(blockedLanes[0].lane);
    else setBulkDelete(blockedLanes.length > 1 ? "blocked" : "confirm");
  };

  const handleBulkDelete = () => {
    const n = selectedLanes.length;
    setLanes((prev) => prev.filter((l) => !laneSelected.has(l.id)));
    setLaneSelected(new Set());
    setBulkDelete(null);
    setToast(`${n} ${n === 1 ? "lane" : "lanes"} deleted`);
  };

  const handleAddBlackout = (v: BlackoutFormValues) => {
    setBlackoutDates((prev) => [...prev, buildBlackoutRecord(v)]);
    setToast("Blackout date added");
    setShowAddBlackout(false);
  };

  const laneColumns = useMemo<ColumnDef<Lane, any>[]>(
    () => [
      {
        id: "select",
        width: 58,
        minWidth: 58,
        maxWidth: 58,
        header: () => (
          <Checkbox
            id="lane-select-all"
            name="lane-select-all"
            size={18}
            checked={allLanesSelected}
            indeterminate={someLanesSelected && !allLanesSelected}
            onChange={toggleAllLanes}
          />
        ),
        cell: ({ row }: any) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={`lane-select-${row.original.id}`}
              name={`lane-select-${row.original.id}`}
              size={18}
              checked={laneSelected.has(row.original.id)}
              onChange={() => toggleLane(row.original.id)}
            />
          </div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Lane",
        cell: ({ row, getValue }: any) => (
          <button
            onClick={() => openLane(row.original)}
            className="text-sm text-default hover:text-primary transition-colors"
          >
            {getValue()}
          </button>
        ),
      },
      {
        id: "status",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Status",
        // Pill only (Figma 5115:207624) — derived from the lane's blackouts.
        cell: ({ row }: any) =>
          isLaneBlackedOut(row.original, now) ? (
            <StatusBadge tone="danger">Unavailable</StatusBadge>
          ) : (
            <StatusBadge tone="success">Available</StatusBadge>
          ),
      },
      {
        id: "nextBlackoutDate",
        width: 518,
        header: () => "Next Blackout Date",
        cell: ({ row }: any) => {
          const next = nextLaneBlackout(row.original, now);
          if (!next) return <span className="text-sm text-body">—</span>;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-default">{next.primary}</span>
              {next.relative && <span className="text-xs text-body">{next.relative}</span>}
              {next.total && (
                <Link
                  className="self-start text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLane(row.original);
                  }}
                >
                  View all ({next.total})
                </Link>
              )}
            </div>
          );
        },
      },
      {
        id: "lastUpdatedOn",
        width: 160,
        minWidth: 160,
        maxWidth: 160,
        header: () => "Last Updated on",
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.lastUpdatedOn).split("\n");
          return (
            <div className="flex flex-col">
              <span className="text-sm text-default whitespace-nowrap">{date}</span>
              {time && <span className="text-xs text-body whitespace-nowrap">{time}</span>}
            </div>
          );
        },
      },
      {
        id: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: ({ row }: any) => (
          <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => openLane(row.original)}
              aria-label="View"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-default hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Icon name="eye" size={16} />
            </button>
            <button
              onClick={() => setLaneDeleteConfirm(row.original)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-default hover:text-danger hover:bg-primary-invert-soft transition-colors"
            >
              <Icon name="trash-2" size={16} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLanesSelected, someLanesSelected, laneSelected, onViewLane, lanes],
  );

  const blackoutColumns = useMemo<ColumnDef<BlackoutDate, any>[]>(
    () => [
      {
        id: "status",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Status",
        cell: ({ row }: any) => {
          // Figma shows Active / Passed; Passed is the NEUTRAL tone. Derived from the dates.
          const passed = !isBlackoutActive(row.original, new Date());
          return (
            <StatusBadge tone={passed ? "neutral" : "success"}>
              {passed ? "Passed" : "Active"}
            </StatusBadge>
          );
        },
      },
      {
        id: "type",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Type",
        cell: ({ row }: any) => (
          <span className="text-sm text-default">
            {row.original.recurring ? "Recurring" : "One-time"}
          </span>
        ),
      },
      {
        id: "label",
        width: 367,
        minWidth: 367,
        maxWidth: 367,
        header: () => "Blackout Date",
        cell: ({ row }: any) => <BlackoutDateCell row={row.original} />,
      },
      {
        id: "nextDate",
        width: 367,
        minWidth: 367,
        maxWidth: 367,
        header: () => "Next Blackout Date",
        cell: ({ row }: any) => <NextBlackoutCell next={nextOfRecord(row.original, new Date())} />,
      },
      {
        id: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: ({ row }: any) => (
          <div className="flex items-center justify-end">
            <button
              onClick={() => setBlackoutDelete(row.original)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-caption hover:text-danger hover:bg-primary-invert-soft transition-colors"
            >
              <Icon name="trash-2" size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const blockedLane = upcomingBookingsForLane(station, laneDeleteConfirm);
  const deletingRecurring = blackoutDelete !== null && !!blackoutDelete.recurring;

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/*
          The in-page breadcrumb that stood here has been removed: the app
          shell already renders "Site Management › Base Station Details" in the
          header, so the page showed it twice.
        */}
        {/* Page header — Delete Base Station (191x40 outline) + Edit (173x40 brand) */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-xl font-semibold text-default whitespace-nowrap">{name}</h1>
            {/* Figma puts Status next to the title, not inside the card below. */}
            <StatusBadge tone={station.status === "Active" ? "success" : "danger"}>
              {station.status}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              onClick={() => setStationDelete(true)}
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg border border-invert-default bg-surface text-default text-sm font-semibold hover:bg-main-background transition-colors"
            >
              <Icon name="trash-2" size={18} />
              Delete Base Station
            </Button>
            <Button
              onClick={() => setShowEditStation(true)}
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
            >
              <Icon name="pencil" size={18} />
              Edit Base Station
            </Button>
          </div>
        </div>

        {/* Section Layout — Base Station Details key-value card */}
        <div className="bg-surface rounded-xl border border-invert-default p-5 space-y-5">
          <h2 className="text-base font-semibold text-default">Base Station Details</h2>
          <div className="flex flex-wrap gap-4">
            <KeyValue title="Last Updated on">
              {String(station.lastUpdatedOn).split("\n").join(" ")}
            </KeyValue>
            {/* Figma 5115:207624: "Active Blackout Dates" — a bare count of the
                station's and its lanes' blackouts that have not ended yet. */}
            <KeyValue title="Active Blackout Dates">{activeBlackoutCount}</KeyValue>
          </div>
        </div>

        {/* Tab Group v2 — Figma: its own row on the page background (Lanes | Blackout
            Dates, 44 tall, 16/12 padding), then one card per tab below it. */}
        <div className="flex border-b border-invert-default">
            {(
              [
                { key: "details" as DetailTab, label: "Lanes" },
                { key: "blackout" as DetailTab, label: "Blackout Dates" },
              ]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "h-11 px-4 text-sm font-medium border-b-2 transition-colors -mb-px",
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-body hover:text-default",
                )}
              >
                {label}
              </button>
            ))}
        </div>

        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          {activeTab === "details" && (
            <>
              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-base font-semibold text-default">Lanes</h2>
                  {/* Same "Section Header" component as every other list's card header
                      — bare number, not a "(N lanes)" parenthetical. Re-verified
                      29 Sep 2026 alongside the same bug on the Site Management list. */}
                  <span className="text-base font-semibold text-body">{filteredLanes.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-60">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={laneSearch}
                      onChange={(e) => {
                        setLaneSearch(e.target.value);
                        setLanePage(1);
                      }}
                      className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                    />
                  </div>
                  <Button
                    type="outline"
                    className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg border border-invert-default bg-surface text-default text-sm font-semibold hover:bg-main-background transition-colors"
                  >
                    <Icon name="download" size={16} />
                    Export
                  </Button>
                  <Button
                    onClick={() => setShowAddLane(true)}
                    className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
                  >
                    <Icon name="plus" size={16} />
                    Add Lane
                  </Button>
                </div>
              </div>

              <TableCustom
                columns={laneColumns}
                data={paginatedLanes}
                autoScrollTable={true}
                actionSticky={false}
              />
              <Pagination
                currentPage={safeLanePage}
                itemsPerPage={LANE_PER_PAGE}
                totalItems={filteredLanes.length}
                setCurrentPage={setLanePage}
              />
            </>
          )}

          {activeTab === "blackout" && (
            <>
              {/* Figma `Tab Group v2` inside the card (5115:214445): 44px, 20px side padding,
                  Overall · Active (count badge) · Passed. Same markup as Nominal Roll's. */}
              <div className="flex border-b border-invert-default px-5">
                {BLACKOUT_SUB_TABS.map(({ key, label, badge }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setBlackoutSubTab(key);
                      setBlackoutPage(1);
                    }}
                    className={cn(
                      "relative -mb-px flex h-11 items-center gap-1.5 px-4 text-sm font-medium leading-5 transition-colors",
                      blackoutSubTab === key ? "text-primary" : "text-body hover:text-default",
                    )}
                  >
                    {label}
                    {badge !== undefined && (
                      <span
                        className={cn(
                          "flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-xs font-semibold leading-4",
                          blackoutSubTab === key ? "bg-primary-default text-invert-default" : "bg-disabled text-body",
                        )}
                      >
                        {badge}
                      </span>
                    )}
                    {blackoutSubTab === key && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-default" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-5 p-5">
                <div className="flex items-baseline gap-2">
                  {/* Section Header title follows the sub-tab: "Overall / Active / Passed Blackout
                      Dates" + bare count (7980:114689, 7980:115614). */}
                  <h2 className="text-base font-semibold text-default">
                    {blackoutSubTab === "active" ? "Active" : blackoutSubTab === "passed" ? "Passed" : "Overall"} Blackout Dates
                  </h2>
                  <span className="text-base font-semibold text-body">{blackoutRows.length}</span>
                </div>
                <Button
                  onClick={() => setShowAddBlackout(true)}
                  className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
                >
                  <Icon name="plus" size={16} />
                  Add Blackout Date
                </Button>
              </div>

              <TableCustom columns={blackoutColumns} data={pagedBlackouts} autoScrollTable={true} actionSticky={false} />
              <Pagination
                currentPage={safeBlackoutPage}
                itemsPerPage={BLACKOUT_PER_PAGE}
                totalItems={blackoutRows.length}
                setCurrentPage={setBlackoutPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Figma `Table - Bulk Action Bar` (6957:83137): "3 selected · Select All 15 Lanes · Delete". */}
      <BulkActionBar
        open={activeTab === "details" && laneSelected.size > 0}
        cells
        count={laneSelected.size}
        onDismiss={() => setLaneSelected(new Set())}
        actions={
          <>
            {laneSelected.size < filteredLanes.length && (
              <BulkActionButton onClick={() => setLaneSelected(new Set(filteredLanes.map((l) => l.id)))}>
                Select All {filteredLanes.length} {filteredLanes.length === 1 ? "Lane" : "Lanes"}
              </BulkActionButton>
            )}
            <BulkActionButton tone="danger" onClick={startBulkDelete}>
              <Icon name="trash-2" size={16} />
              Delete
            </BulkActionButton>
          </>
        }
      />

      <AddLaneDrawer
        open={showAddLane}
        existingNames={lanes.map((l) => l.name)}
        onClose={() => setShowAddLane(false)}
        onSubmit={handleAddLane}
      />

      <AddBlackoutDrawer
        open={showAddBlackout}
        onClose={() => setShowAddBlackout(false)}
        onSubmit={handleAddBlackout}
        stationName={station.name}
      />

      <BaseStationDrawer
        open={showEditStation}
        initial={{ ...station, name }}
        existingNames={[]}
        onClose={() => setShowEditStation(false)}
        onSubmit={({ name: next }) => {
          setName(next);
          setToast("Base station updated");
          setShowEditStation(false);
        }}
      />

      {/* Lane — delete, and its blocked variant */}
      <ConfirmDialog
        open={!!laneDeleteConfirm && blockedLane === 0}
        tone="warning"
        title={<>Delete &ldquo;{laneDeleteConfirm?.name}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setLaneDeleteConfirm(null)}
        onConfirm={() => {
          if (laneDeleteConfirm) handleDeleteLane(laneDeleteConfirm);
          setLaneDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!laneDeleteConfirm && blockedLane > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{laneDeleteConfirm?.name}&rdquo;</>}
        subtitle={`This lane is linked to ${blockedLane} upcoming booking${blockedLane === 1 ? "" : "s"}. Reassign or cancel these bookings before deleting it.`}
        cancelLabel="Close"
        confirmLabel="View Bookings"
        onCancel={() => setLaneDeleteConfirm(null)}
        onConfirm={() => {
          setLaneDeleteConfirm(null);
          window.location.href = "/bookings/list";
        }}
      />

      {/* Bulk delete — Figma `Action - Bulk Select`: confirm 6957:101098, blocked 6957:83079 (512 wide,
          bullet list, one "Got It" button, no Cancel). */}
      <ConfirmDialog
        open={bulkDelete === "confirm"}
        tone="warning"
        title={`Delete ${selectedLanes.length} ${selectedLanes.length === 1 ? "lane" : "lanes"}?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setBulkDelete(null)}
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        open={bulkDelete === "blocked"}
        tone="danger"
        className="w-[512px]"
        title={`Can't delete ${blockedLanes.length} lanes`}
        subtitle="These lanes are linked to upcoming bookings and can't be deleted:"
        hideCancel
        confirmLabel="Got It"
        onCancel={() => setBulkDelete(null)}
      >
        <ul className="list-disc pl-5">
          {blockedLanes.map(({ lane, count }) => (
            <li key={lane.id}>
              {lane.name} &mdash; linked to {count} upcoming {count === 1 ? "booking" : "bookings"}
            </li>
          ))}
        </ul>
        <p>Reassign or cancel these bookings before deleting them.</p>
      </ConfirmDialog>

      {/* Deactivate Lane dialog removed with the status toggle — availability is derived (Notes 6921:238015). */}

      {/* Blackout date — one-off and recurring have different copy in Figma */}
      <ConfirmDialog
        open={blackoutDelete !== null && !deletingRecurring}
        tone="warning"
        title="Delete this blackout date?"
        subtitle="This can't be undone. The base station will be available for booking on this date again."
        confirmLabel="Delete"
        onCancel={() => setBlackoutDelete(null)}
        onConfirm={() => {
          setBlackoutDates((prev) => prev.filter((d) => d !== blackoutDelete));
          setBlackoutDelete(null);
          setToast("Blackout date deleted");
        }}
      />

      <ConfirmDialog
        open={blackoutDelete !== null && deletingRecurring}
        tone="warning"
        title="Delete this recurring blackout date?"
        subtitle="This can't be undone. All occurrences of this recurring blackout will be removed, and the base station will be available for booking on those dates again."
        confirmLabel="Delete"
        onCancel={() => setBlackoutDelete(null)}
        onConfirm={() => {
          setBlackoutDates((prev) => prev.filter((d) => d !== blackoutDelete));
          setBlackoutDelete(null);
          setToast("Recurring blackout date deleted");
        }}
      />

      <ConfirmDialog
        open={stationDelete}
        tone="warning"
        title={<>Delete &ldquo;{name}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setStationDelete(false)}
        onConfirm={() => {
          setStationDelete(false);
          onBack();
        }}
      />

      {/* Every Figma toast on this page (209866, 209907, 216634, 217644, 261842, 101100) sits top-right, 24px
          from the edge and 72px down — not the shared bottom-centre default. */}
      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} placement="top-right" offsetTop={72} />
    </div>
  );
}

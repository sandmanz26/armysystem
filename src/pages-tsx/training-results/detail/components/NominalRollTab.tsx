import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { Pagination } from "@/components/ui/Pagination";
import {
  NominalRollFilterDrawer,
  EMPTY_NOMINAL_ROLL_FILTER,
  type NominalRollFilter,
} from "./NominalRollFilterDrawer";
import { NOMINAL_ROLL_PER_PAGE } from "../constants";
import type { Courseware } from "../types";

/*
 * Figma `Training Result Details - Tab - Nominal Roll` (5834:189825, full
 * table 7886:117889): the courseware's ATTENDANCE list — who was on the roll,
 * whether they were registered, and whether they showed up. Scores live
 * elsewhere: Training Performance ("All Trainee Results") and Detail List →
 * View Details (per base station, with Best Attempt / Course Results).
 */

interface NominalRollTabProps {
  /** The active courseware. Everything on this tab is scoped to it. */
  courseware: Courseware;
}

interface NominalRollRow {
  no: number;
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
  role: string;
  weapons: string[];
  registration: "Registered" | "Non-Registered";
  attendance: "Present" | "Absent";
  lastUpdatedOn: string;
}

/*
 * Mock roll data. The courseware's trainee model has no platoon / role /
 * registration / attendance fields yet, so they are derived here from the
 * sample rows Figma draws (role → weapon types pairs are copied from 7886:117889).
 */
const ROLE_WEAPONS: { role: string; weapons: string[] }[] = [
  { role: "F.O/OC", weapons: ["Comd Bino", "MATADOR", "SPIKE LR"] },
  { role: "GPMG Team (STEELNET)", weapons: ["GPMG", "SAR21"] },
  { role: "MATADOR", weapons: ["MATADOR"] },
  { role: "M203", weapons: ["M203"] },
  { role: "M203", weapons: ["M203"] },
  { role: "SECTION Commander", weapons: ["Drone"] },
  { role: "SECTION Commander", weapons: ["Claymore"] },
  { role: "SPIKE LR (ATGM)", weapons: ["SPIKE LR"] },
  { role: "SPIKE LR (ATGM)", weapons: ["SPIKE LR"] },
  { role: "SPIKE LR (ATGM)", weapons: ["SPIKE LR"] },
];

/** "10 Nov 2025" → "10 November 2025" (Figma `Last Updated On` format). */
function longDate(short: string): string {
  const d = new Date(short);
  if (Number.isNaN(d.getTime())) return short;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function toRows(courseware: Courseware): NominalRollRow[] {
  const updated = longDate(courseware.bookingDate);
  return courseware.trainees.map((t, i) => {
    const rw = ROLE_WEAPONS[i % ROLE_WEAPONS.length];
    return {
      no: t.no,
      rank: t.rank,
      name: t.name,
      svcId: t.svcId,
      platoon: `Platoon ${Math.floor(i / 10) + 1}`,
      role: rw.role,
      weapons: rw.weapons,
      registration: i % 10 === 0 ? "Non-Registered" : "Registered",
      attendance: i % 10 === 9 ? "Absent" : "Present",
      lastUpdatedOn: updated,
    };
  });
}

const text = "text-sm text-default";
type Info = CellContext<NominalRollRow, any>;

export function NominalRollTab({ courseware }: NominalRollTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<NominalRollFilter>(EMPTY_NOMINAL_ROLL_FILTER);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => toRows(courseware), [courseware]);
  const activeFilterCount = filter.ranks.length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.svcId.toLowerCase().includes(q) ||
      r.rank.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q);
    const matchesRank = filter.ranks.length === 0 || filter.ranks.includes(r.rank);
    return matchesSearch && matchesRank;
  });
  const paginated = filtered.slice((page - 1) * NOMINAL_ROLL_PER_PAGE, page * NOMINAL_ROLL_PER_PAGE);

  // Column widths are Figma's header-cell widths (7886:117889); 1464 px in
  // total, so the table scrolls horizontally inside the 1096 px card.
  const columns = useMemo<ColumnDef<NominalRollRow, any>[]>(() => [
    { header: "No.", accessorKey: "no", minWidth: "56px", cell: (info: Info) => <span className="text-sm text-body">{info.getValue()}</span> },
    { header: "Rank", accessorKey: "rank", minWidth: "80px", cell: (info: Info) => <span className={text}>{info.getValue()}</span> },
    { header: "Name", accessorKey: "name", minWidth: "200px", cell: (info: Info) => <span className="text-sm font-semibold text-default">{info.getValue()}</span> },
    { header: "Service ID", accessorKey: "svcId", minWidth: "120px", cell: (info: Info) => <span className={text}>{info.getValue()}</span> },
    { header: "Platoon Number", accessorKey: "platoon", minWidth: "160px", cell: (info: Info) => <span className={text}>{info.getValue()}</span> },
    { header: "Role", accessorKey: "role", minWidth: "200px", cell: (info: Info) => <span className={text}>{info.getValue()}</span> },
    {
      header: "Weapon Type(s)",
      accessorKey: "weapons",
      minWidth: "200px",
      cell: (info: Info) => <span className={cn(text, "block max-w-[160px] whitespace-normal")}>{(info.getValue() as string[]).join(", ")}</span>,
    },
    {
      header: "Registration",
      accessorKey: "registration",
      minWidth: "160px",
      cell: (info: Info) => {
        const v = info.getValue() as NominalRollRow["registration"];
        return <StatusBadge tone={v === "Registered" ? "neutral" : "info"}>{v}</StatusBadge>;
      },
    },
    {
      header: "Attendance",
      accessorKey: "attendance",
      minWidth: "128px",
      cell: (info: Info) => {
        const v = info.getValue() as NominalRollRow["attendance"];
        return <StatusBadge tone={v === "Present" ? "success" : "danger"}>{v}</StatusBadge>;
      },
    },
    { header: "Last Updated On", accessorKey: "lastUpdatedOn", minWidth: "160px", cell: (info: Info) => <span className={text}>{info.getValue()}</span> },
  ] as unknown as ColumnDef<NominalRollRow, any>[], []);

  return (
    // Figma `Section Layout - Table`: white card, 1px border, radius 12,
    // sits 16px under the tab bar (no extra page padding around it).
    <div className="overflow-hidden rounded-xl border border-invert-default bg-surface">
      {/* Figma `Section Header` (76 tall, padding 20): "Nominal Roll" + bare
          count in text/body; Search 240×36 and Filter 36 tall, 12px apart. */}
      <div className="flex items-center justify-between gap-5 p-5">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="text-default">Nominal Roll</span>
          <span className="text-body">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body" />
            <InputCustom
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-lg border border-invert-default bg-surface py-0 pl-10 pr-3 text-sm text-default placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused transition-colors"
            />
          </div>
          <button
            type="button"
            title="Filter"
            onClick={() => setFilterOpen(true)}
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
        </div>
      </div>

      <TableCustom
        data={paginated}
        columns={columns}
        autoScrollTable={true}
        classTBodyTd="px-5 py-3 h-auto"
        emptyIcon={q ? <Icon name="search" size={24} className="text-disabled" /> : undefined}
        emptyTitle={q ? `No result for “${searchQuery.trim()}”` : undefined}
        emptySubtitle={q ? "Try a different keyword." : undefined}
      />
      <Pagination currentPage={page} itemsPerPage={NOMINAL_ROLL_PER_PAGE} totalItems={filtered.length} setCurrentPage={setPage} />

      <NominalRollFilterDrawer
        open={filterOpen}
        value={filter}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilter(f); setPage(1); }}
      />
    </div>
  );
}

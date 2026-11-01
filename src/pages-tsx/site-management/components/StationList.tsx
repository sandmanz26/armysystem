import { useState, useMemo } from "react";
import { Search, Download, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { baseStations as initialStations } from "@/data/siteManagement";
import { bookings } from "@/data/mock";
import type { BaseStation, LaneStatus } from "../types";
import { PER_PAGE } from "../constants";
import { BaseStationDrawer } from "../modals/BaseStationDrawer";
import { BlackoutTooltip } from "./BlackoutTooltip";

/*
 * Site Management — base station list. Figma page `Site Management List`
 * (5112:111648).
 *   list / empty        5112:201985 · 201965
 *   add + error states  5112:202006 · 202032 · 202042 · toast 202011
 *   edit                5112:202074 · toast 202079
 *   delete + blocked    5112:202050 · 202048 · toast 202052
 *
 * Columns: No 64 · Base Station 120 · Status 120 · Lane 256 ·
 * Blackout Date 256 · Last Updated on 160 · Actions 120.
 *
 * TWO THINGS FIGMA DOES NOT HAVE, removed from the prototype (see CHANGES.md):
 * a checkbox column with bulk delete, and a sort control on Base Station —
 * no header cell on this page carries either.
 *
 * Re-verified 29 Sep 2026 via figma_execute (resolving both badges'
 * boundVariables, not just eyeballing the colour): the Status column's
 * "Inactive" and the Lane cell's "Inactive" resolve to the EXACT SAME
 * danger tone (same variable ids). An earlier pass here claimed they were
 * deliberately different tones (danger vs neutral) — that claim was never
 * actually checked against Figma and was wrong; fixed to "danger" in both
 * places. See figma-slicing PITFALLS.md for the general lesson.
 */

/** Figma's blocked-delete counts upcoming bookings assigned to this station. */
const upcomingBookingsFor = (station: BaseStation | null) =>
  station
    ? bookings.filter(
        (b) => b.status === "Upcoming" && (b.assignedStations ?? []).includes(station.name),
      ).length
    : 0;

export function StationList({ onView }: { onView: (station: BaseStation) => void }) {
  const [stations, setStations] = useState<BaseStation[]>(initialStations);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStation, setEditingStation] = useState<BaseStation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BaseStation | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      stations.filter(
        (s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [stations, searchQuery],
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /** Figma's Lane cell: one "N Lanes" line per status, each with its own badge. */
  const getLaneSummary = (station: BaseStation) => {
    if (station.lanes.length === 0) return [{ label: "0 Lanes", status: null as LaneStatus | null }];
    const active = station.lanes.filter((l) => l.status === "Active").length;
    const inactive = station.lanes.filter((l) => l.status === "Inactive").length;
    const result: { label: string; status: LaneStatus | null }[] = [];
    if (active > 0) result.push({ label: `${active} Lane${active !== 1 ? "s" : ""}`, status: "Active" });
    if (inactive > 0)
      result.push({ label: `${inactive} Lane${inactive !== 1 ? "s" : ""}`, status: "Inactive" });
    return result;
  };

  const handleDelete = (s: BaseStation) => {
    setStations((prev) => prev.filter((x) => x.id !== s.id));
    setToast(`${s.name} deleted`);
  };

  const handleSubmit = ({ name }: { name: string }) => {
    if (editingStation) {
      setStations((prev) =>
        prev.map((s) => (s.id === editingStation.id ? { ...s, name } : s)),
      );
      // Figma's edit toast is generic ("Base station updated"), unlike add/delete.
      setToast("Base station updated");
      setEditingStation(null);
    } else {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setStations((prev) => [
        ...prev,
        {
          id: `st-${Date.now()}`,
          name,
          status: "Active",
          lanes: [],
          blackoutDates: [],
          lastUpdatedOn: `${dateStr}\n${timeStr}`,
        },
      ]);
      setToast(`${name} added`);
      setShowAddModal(false);
    }
  };

  const columns = useMemo<ColumnDef<BaseStation, any>[]>(
    () => [
      {
        id: "no",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        header: () => "No",
        cell: ({ row }: any) => (
          <span className="text-sm text-default">
            {(currentPage - 1) * PER_PAGE + row.index + 1}
          </span>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        width: 120,
        header: () => "Base Station",
        cell: ({ row, getValue }: any) => (
          <button
            onClick={() => onView(row.original)}
            className="text-sm text-default hover:text-primary transition-colors"
          >
            {getValue()}
          </button>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        width: 120,
        header: () => "Status",
        cell: ({ getValue }: any) => (
          <StatusBadge tone={getValue() === "Active" ? "success" : "danger"}>
            {getValue()}
          </StatusBadge>
        ),
      },
      {
        id: "lane",
        width: 256,
        header: () => "Lane",
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-1">
            {getLaneSummary(row.original).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-default">{s.label}</span>
                {s.status && (
                  <StatusBadge tone={s.status === "Active" ? "success" : "danger"}>
                    {s.status}
                  </StatusBadge>
                )}
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "blackoutDates",
        width: 256,
        header: () => "Blackout Date",
        /*
         * Figma shows the first two entries and collapses the rest behind
         * "+N more", which opens the dark `Tooltip - Blackout Date`. The cell
         * used to print every entry stacked, so a station with five blackout
         * dates blew the row height out.
         */
        cell: ({ row }: any) =>
          row.original.blackoutDates.length > 0 ? (
            <BlackoutTooltip dates={row.original.blackoutDates.map((d: any) => d.label)} />
          ) : (
            <span className="text-sm text-body">—</span>
          ),
      },
      {
        id: "lastUpdatedOn",
        width: 160,
        header: () => "Last Updated on",
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.lastUpdatedOn).split("\n");
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-default">{date}</span>
              {time && <span className="text-xs text-body">{time}</span>}
            </div>
          );
        },
      },
      {
        id: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onView(row.original)}
              aria-label="View"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setEditingStation(row.original)}
              aria-label="Edit"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirm(row.original)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-danger hover:bg-primary-invert-soft transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, onView],
  );

  const blocked = upcomingBookingsFor(deleteConfirm);

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Page header — Figma `Export` (103x40) + `Add Base Station` (175x40) */}
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-xl font-semibold text-default whitespace-nowrap">Site Management</h1>
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg border border-invert-default bg-surface text-default text-sm font-semibold hover:bg-main-background transition-colors"
            >
              <Download size={16} />
              Export
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
            >
              <Plus size={16} />
              Add Base Station
            </Button>
          </div>
        </div>

        {/* Section Layout - Table */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-default">Base Stations</h2>
              {/* Figma: title "Base Stations" + a separate bare-number "Count" text
                  (5112:202004 — Section Header/Left Content > Header > Count) — same
                  bare-count convention as every other list page's section header, not
                  a "(N base stations)" parenthetical. Re-verified 29 Sep 2026. */}
              <span className="text-base font-semibold text-body">{filtered.length}</span>
            </div>
            <div className="relative w-60">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
              />
            </div>
          </div>

          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <BaseStationDrawer
        open={showAddModal || !!editingStation}
        initial={editingStation}
        existingNames={stations.map((s) => s.name)}
        onClose={() => {
          setShowAddModal(false);
          setEditingStation(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteConfirm && blocked === 0}
        tone="warning"
        title={<>Delete &ldquo;{deleteConfirm?.name}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDelete(deleteConfirm);
          setDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm && blocked > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{deleteConfirm?.name}&rdquo;</>}
        subtitle={`This base station is linked to ${blocked} upcoming booking${blocked === 1 ? "" : "s"}. Reassign or cancel these bookings before deleting the base station.`}
        cancelLabel="Close"
        confirmLabel="View Bookings"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          setDeleteConfirm(null);
          window.location.href = "/bookings/list";
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

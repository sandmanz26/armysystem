import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { bookings } from "@/data/mock";
import { BRIEFING_ROOMS, PER_PAGE } from "../constants";
import type { BriefingRoomEntry } from "../types";
import { BriefingRoomDrawer } from "../modals/BriefingRoomDrawer";

/*
 * Briefing Room — Figma page `Briefing Room` (5108:73521).
 *   list / empty        5029:6492 · 5029:6474
 *   add + error states  5029:6548 · 6567 · 6561 · toast 6573
 *   edit                5337:521245 · toast 521256
 *   delete + blocked    5337:521275 · 528780 · toast 521277
 *
 * Columns, Figma's order: No. 64 · Name · Additional Info · Level · Capacity
 * · Status · Created at · Created by · Actions 96. This used to mirror
 * Location's simpler 5-column shape (No/Name/Status/Description/Actions) —
 * the two pages share the same drawer PATTERN but not the same column set;
 * Briefing Room's table grew Level/Capacity/Created at/Created by at some
 * point and this file was never updated to follow.
 *
 * Figma has NO checkbox column on this page (Location, its sibling, does), so
 * the prototype's row selection and bulk delete were removed — see CHANGES.md.
 *
 * `Inactive` is DANGER here, same as Location and unlike the Antenna/Asset
 * pages. Resolved per badge, never from a shared status→tone helper.
 */

/** Figma's blocked delete counts upcoming bookings held in this room. */
const upcomingBookingsFor = (room: BriefingRoomEntry | null) =>
  room
    ? bookings.filter((b) => b.status === "Upcoming" && b.briefingRoom === room.name).length
    : 0;

export function BriefingRoom() {
  const [rows, setRows] = useState<BriefingRoomEntry[]>(BRIEFING_ROOMS);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<BriefingRoomEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BriefingRoomEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.additionalInfo.toLowerCase().includes(q),
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleSubmit = (v: FormShape) => {
    const entry = {
      name: v.name,
      additionalInfo: v.additionalInfo,
      level: Number(v.level) as BriefingRoomEntry["level"],
      capacity: Number(v.capacity),
      status: v.status as BriefingRoomEntry["status"],
    };
    if (editTarget) {
      setRows((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...entry } : r)));
      setToast(`${v.name} updated`);
      setEditTarget(null);
    } else {
      const now = new Date();
      const createdAt =
        now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
        "\n" +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setRows((prev) => [
        ...prev,
        { ...entry, id: `br-${Date.now()}`, createdAt, createdBy: "Olivia Carter", createdByRole: "System Admin" },
      ]);
      setToast(`${v.name} added`);
      setShowAdd(false);
    }
  };

  const handleDelete = (r: BriefingRoomEntry) => {
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    setToast(`${r.name} deleted`);
  };

  const columns: ColumnDef<BriefingRoomEntry, any>[] = [
    {
      id: "no",
      width: 64,
      minWidth: 64,
      maxWidth: 64,
      header: () => "No.",
      cell: ({ row }: any) => {
        const idx = paginated.findIndex((r: BriefingRoomEntry) => r.id === row.original.id);
        return <span className="text-sm text-default">{(currentPage - 1) * PER_PAGE + idx + 1}</span>;
      },
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "name",
      header: () => "Name",
      cell: ({ row }: any) => (
        <span className="text-sm font-semibold text-default">{row.original.name}</span>
      ),
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "additionalInfo",
      header: () => "Additional Info",
      cell: ({ row }: any) => (
        <span className="text-sm text-default">{row.original.additionalInfo || "—"}</span>
      ),
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "level",
      header: () => "Level",
      cell: ({ row }: any) => <span className="text-sm text-default">Level {row.original.level}</span>,
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "capacity",
      header: () => "Capacity",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.original.capacity} pax</span>,
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "status",
      header: () => "Status",
      cell: ({ row }: any) => (
        <StatusBadge tone={row.original.status === "Active" ? "success" : "danger"}>
          {row.original.status}
        </StatusBadge>
      ),
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "createdAt",
      header: () => "Created at",
      // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
      normalWhitespace: "true",
      cell: ({ row }: any) => (
        <span className="text-sm text-default whitespace-pre-line leading-snug">{row.original.createdAt}</span>
      ),
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "createdBy",
      header: () => "Created by",
      cell: ({ row }: any) => (
        <div>
          <div className="text-sm text-default">{row.original.createdBy}</div>
          <div className="text-xs text-body">{row.original.createdByRole}</div>
        </div>
      ),
    } as ColumnDef<BriefingRoomEntry, any>,
    {
      id: "actions",
      width: 96,
      minWidth: 96,
      maxWidth: 96,
      header: () => "Actions",
      cell: ({ row }: any) => (
        <div
          className="flex items-center gap-0.5"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditTarget(row.original)}
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
    } as ColumnDef<BriefingRoomEntry, any>,
  ];

  const blocked = upcomingBookingsFor(deleteConfirm);

  return (
    <div className="space-y-6">
      {/* Page header — Figma `Page Header` + `Button Primary` (184x40) */}
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-xl font-semibold text-default whitespace-nowrap">Briefing Room</h1>
        <Button
          onClick={() => setShowAdd(true)}
          className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
        >
          <Plus size={16} />
          Add Briefing Room
        </Button>
      </div>

      {/* Section Layout - Table */}
      <div className="bg-surface-lv1 rounded-xl border border-invert-default overflow-hidden">
        <div className="flex items-center justify-between gap-5 p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-default">Briefing Room</h2>
            {/* Figma (5029:6492): the count sits bare next to the title —
                "Briefing Room" "7" as two separate text nodes, no parens,
                no "record(s)" word. */}
            <span className="text-base font-semibold text-body">{filtered.length}</span>
          </div>
          <div className="relative w-60">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-caption pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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

      <BriefingRoomDrawer
        open={showAdd || !!editTarget}
        initial={editTarget}
        existingNames={rows.map((r) => r.name)}
        onClose={() => {
          setShowAdd(false);
          setEditTarget(null);
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
        subtitle={`This room is linked to ${blocked} upcoming booking${blocked === 1 ? "" : "s"}. Reassign or cancel these bookings before deleting the room.`}
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

interface FormShape {
  name: string;
  additionalInfo: string;
  level: string;
  capacity: string;
  status: string;
}

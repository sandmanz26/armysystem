import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { Toast } from "@/components/toast";
import { LOCATIONS, PER_PAGE } from "../constants";
import type { RoomEntry } from "../types";
import { LocationDrawer } from "../modals/LocationDrawer";

/*
 * Location — Figma page `Location` (5108:73522).
 *   list / empty        5029:6529 · 5029:6511
 *   add + error states  5029:6593 · 6612 · 5159:137923 · toast 5029:6618
 *   edit                5339:530819 · toast 530826
 *   delete              5339:530845 · toast 530849
 *   bulk select         5339:531835 · confirm 531815 · toast 531817
 *
 * Columns: ☐ 58 · No 80 · Name 279 · Status 279 · Description 279 · Actions 120.
 * `Inactive` is DANGER here. The status→tone map is per screen, never global —
 * confirmed DANGER too on Asset Category/Asset Type (28 Sep 2026 check) AND on
 * Antenna Listing (30 Sep 2026 check, `AntennaTable.tsx`) — this comment used to
 * also claim "neutral on the Antenna and Asset pages", which was never actually
 * verified for any of the three and was wrong every time — see figma-color-sync
 * PITFALLS.md #29. Don't copy a tone ternary into a new screen without
 * re-checking that screen's own Figma badge fill.
 *
 * Figma's bulk bar on this page has only X + "N selected" + Delete; there is no
 * "Select All" button (the Antenna page has one).
 */

export function LocationSetting() {
  const [rows, setRows] = useState<RoomEntry[]>(LOCATIONS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<RoomEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RoomEntry | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q),
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const allSel = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const someSel = paginated.some((r) => selected.has(r.id));

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSel) paginated.forEach((r) => next.delete(r.id));
      else paginated.forEach((r) => next.add(r.id));
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSubmit = (v: FormShape) => {
    if (editTarget) {
      setRows((prev) =>
        prev.map((r) => (r.id === editTarget.id ? ({ ...r, ...v } as RoomEntry) : r)),
      );
      setToast(`${v.name} updated`);
      setEditTarget(null);
    } else {
      setRows((prev) => [...prev, { ...(v as unknown as RoomEntry), id: `loc-${Date.now()}` }]);
      setToast(`${v.name} added`);
      setShowAdd(false);
    }
  };

  const handleDelete = (r: RoomEntry) => {
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(r.id);
      return next;
    });
    setToast(`${r.name} deleted`);
  };

  const handleDeleteSelected = () => {
    const n = selected.size;
    setRows((prev) => prev.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
    setToast(`${n} ${n === 1 ? "location" : "locations"} deleted`);
  };

  const columns: ColumnDef<RoomEntry, any>[] = [
    {
      id: "select",
      width: 58,
      minWidth: 58,
      maxWidth: 58,
      header: () => (
        <div className="flex items-center">
          <Checkbox
            id="location-select-all"
            name="location-select-all"
            checked={allSel}
            indeterminate={someSel && !allSel}
            onChange={toggleAll}
            size={18}
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Checkbox
            id={`location-select-${row.original.id}`}
            name={`location-select-${row.original.id}`}
            checked={selected.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            size={18}
          />
        </div>
      ),
    } as ColumnDef<RoomEntry, any>,
    {
      id: "no",
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      header: () => "No.",
      cell: ({ row }: any) => {
        const idx = paginated.findIndex((r: RoomEntry) => r.id === row.original.id);
        return <span className="text-sm text-default">{(currentPage - 1) * PER_PAGE + idx + 1}</span>;
      },
    } as ColumnDef<RoomEntry, any>,
    {
      id: "name",
      width: 279,
      header: () => "Name",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.original.name}</span>,
    } as ColumnDef<RoomEntry, any>,
    {
      id: "status",
      width: 279,
      header: () => "Status",
      cell: ({ row }: any) => (
        <StatusBadge tone={row.original.status === "Active" ? "success" : "danger"}>
          {row.original.status}
        </StatusBadge>
      ),
    } as ColumnDef<RoomEntry, any>,
    {
      id: "description",
      width: 279,
      header: () => "Description",
      cell: ({ row }: any) => (
        <span className="text-sm text-default">{row.original.description}</span>
      ),
    } as ColumnDef<RoomEntry, any>,
    {
      id: "actions",
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      header: () => "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-0.5" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
    } as ColumnDef<RoomEntry, any>,
  ];

  return (
    <div className="space-y-6">
      {/* Page header — Figma `Page Header` + `Button Primary` (148x40) */}
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-xl font-semibold text-default whitespace-nowrap">Location</h1>
        <Button
          onClick={() => setShowAdd(true)}
          className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
        >
          <Plus size={16} />
          Add Location
        </Button>
      </div>

      {/* Section Layout - Table */}
      <div className="bg-surface-lv1 rounded-xl border border-invert-default overflow-hidden">
        <div className="flex items-center justify-between gap-5 p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-default">Location</h2>
            {/* Figma (5029:6529): the count sits bare next to the title —
                "Location" "2" as two separate text nodes, no parens, no
                "record(s)" word. */}
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

      {/* Bulk action bar — Figma `Table - Bulk Action Bar`: no Select All here */}
      <BulkActionBar
        open={selected.size > 0}
        count={selected.size}
        onDismiss={() => setSelected(new Set())}
        actions={
          <BulkActionButton tone="danger" onClick={() => setDeleteBulkConfirm(true)}>
            <Trash2 size={16} />
            Delete
          </BulkActionButton>
        }
      />

      <LocationDrawer
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
        open={!!deleteConfirm}
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
        open={deleteBulkConfirm}
        tone="warning"
        title={`Delete ${selected.size} ${selected.size === 1 ? "location" : "locations"}?`}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteBulkConfirm(false)}
        onConfirm={() => {
          handleDeleteSelected();
          setDeleteBulkConfirm(false);
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

interface FormShape {
  name: string;
  status: string;
  description: string;
}

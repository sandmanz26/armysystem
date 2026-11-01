import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { IP_ENTRIES, PER_PAGE } from "../constants";
import type { IPEntry } from "../types";

const columnHelper = createColumnHelper<IPEntry>();

export function IPWhitelisting() {
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);

  const filtered = IP_ENTRIES.filter(
    (e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.ipAddress.includes(search)
  );
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const allSelected = paginated.length > 0 && paginated.every((e) => selected.has(e.id));
  const someSelected = paginated.some((e) => selected.has(e.id));

  const toggleAll = () => {
    if (!enabled) return;
    setSelected(allSelected ? new Set() : new Set(paginated.map((e) => e.id)));
  };
  const toggleOne = (id: string) => {
    if (!enabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const deleteSelected = () => setSelected(new Set());

  const columns: ColumnDef<IPEntry, any>[] = [
    {
      id: "select",
      width: "40px",
      minWidth: "40px",
      maxWidth: "40px",
      header: () => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={toggleAll}
            size={16}
            disabled={!enabled}
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            size={16}
            disabled={!enabled}
          />
        </div>
      ),
    } as ColumnDef<IPEntry, any>,
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("ipAddress", {
      header: () => "IP Address",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: () => "Description",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("startIp", {
      header: () => "Start IP",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("endIp", {
      header: () => "End IP",
      cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <button
            disabled={!enabled}
            className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Pencil size={14} />
          </button>
          <button
            disabled={!enabled}
            className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-danger hover:bg-danger-invert-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      {/* Page header — Figma `IP Whitelisting` (5191:191667 / 191629). The
          Add IP button is always present: brand when enabled, disabled fill
          when whitelisting is off. The Enable/Disable control is a Toggle. */}
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-xl font-semibold text-default whitespace-nowrap">IP Whitelisting</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((v) => !v)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                enabled ? "bg-primary-default" : "bg-disabled",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all",
                  enabled ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
            <span className="text-sm text-default">Enable</span>
          </label>

          <Button
            disabled={!enabled}
            className={cn(
              "w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg text-sm font-semibold transition-colors",
              enabled
                ? "bg-primary-default text-invert-default hover:bg-primary-hovered"
                : "bg-disabled text-body cursor-not-allowed",
            )}
          >
            <Plus size={18} />
            Add IP
          </Button>
        </div>
      </div>

      {/* Figma `Alert` — warning/invert/default fill, border/warning outline */}
      {!enabled && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning bg-warning-invert-default p-3">
          <TriangleAlert size={16} className="mt-px flex-shrink-0 text-warning" />
          <p className="text-xs text-warning">
            IP Whitelisting is currently disabled. No IPs are being enforced. Switch to Enable to
            manage entries.
          </p>
        </div>
      )}

      {/* Section Layout - Table */}
      <div className="bg-surface-lv1 rounded-xl border border-invert-default overflow-hidden">
        <div className="flex items-center justify-between gap-5 p-5">
          <div className="flex items-center gap-3">
            {/* Figma Section Header (5191:191667): "IP Whitelisting" + count "5" — two
                text nodes 8px apart, no brackets, no "devices". */}
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-default">IP Whitelisting</h2>
              <span className="text-base font-semibold text-body">{filtered.length}</span>
            </div>
            {enabled && selected.size > 0 && (
              <button
                type="button"
                onClick={() => setDeleteBulkConfirm(true)}
                className="h-9 rounded-lg border border-danger bg-surface px-4 text-sm font-semibold text-danger hover:bg-danger-invert-soft transition-colors"
              >
                Delete ({selected.size})
              </button>
            )}
          </div>

          {/* Figma's disabled frame has an empty Right Content slot — no search */}
          {enabled && (
            <div className="relative w-60">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-caption pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        <div className={!enabled ? "opacity-60 pointer-events-none select-none" : ""}>
          <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={filtered.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteBulkConfirm}
        tone="warning"
        title={<>Delete {selected.size} IP {selected.size === 1 ? "entry" : "entries"}?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteBulkConfirm(false)}
        onConfirm={() => { deleteSelected(); setDeleteBulkConfirm(false); }}
      />
    </div>
  );
}

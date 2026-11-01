import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { ranks as initialRanks } from "@/data/userManagement";
import type { Rank } from "@/data/userManagement";
import { RankDrawer } from "./modals/RankDrawer";

const PER_PAGE = 10;

function TwoLine({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-default">{primary}</span>
      {secondary && <span className="text-xs text-body">{secondary}</span>}
    </div>
  );
}

/*
 * Rank — Figma page 5029:3597.
 *
 * Unlike the Asset pages, Figma DOES give Rank a selection column and a bulk
 * action bar (`Action - Bulk Action`): selecting rows reveals
 * `Select All N Ranks` and a danger-outline `Delete`, and the confirm dialog
 * switches to "Delete N ranks?".
 *
 * None of the 5 `Table - Header Cell` nodes carry a sort affordance (checked
 * each one's own children directly — no chevron/arrow icon on any), so this
 * table has no sortable column, same finding as Antenna Listing.
 */
export function RankPage() {
  const [ranks, setRanks] = useState<Rank[]>(initialRanks);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Rank | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rank | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sorted = ranks.filter(
    (r) => !searchQuery || r.rank.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pageAllSelected = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const pageSomeSelected = paginated.some((r) => selected.has(r.id)) && !pageAllSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (pageAllSelected) paginated.forEach((r) => next.delete(r.id));
      else paginated.forEach((r) => next.add(r.id));
      return next;
    });

  const handleSubmit = (v: { rank: string; sequence: number }) => {
    if (editTarget) {
      setRanks((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...v } : r)));
      setToast(`${v.rank} updated`);
      setEditTarget(null);
    } else {
      setRanks((prev) => [
        ...prev,
        {
          ...v,
          id: `rk${Date.now()}`,
          createdBy: "Admin",
          createdByRole: "System Admin",
          createdOn: "Just now\n—",
        },
      ]);
      setToast(`${v.rank} added`);
      setShowAdd(false);
    }
  };

  const columns = useMemo<ColumnDef<Rank, any>[]>(
    () => [
      {
        id: "select",
        width: 58,
        minWidth: 58,
        maxWidth: 58,
        header: () => (
          <div className="flex items-center justify-center">
            <Checkbox checked={pageAllSelected} indeterminate={pageSomeSelected} onChange={togglePage} size={18} />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.original.id)} onChange={() => toggleOne(row.original.id)} size={18} />
          </div>
        ),
      },
      {
        id: "sequence",
        accessorKey: "sequence",
        width: 120,
        minWidth: 120,
        header: () => "Sequence",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.sequence}</span>,
      },
      {
        id: "rank",
        accessorKey: "rank",
        width: 266,
        header: () => "Rank",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.rank}</span>,
      },
      {
        id: "createdBy",
        width: 266,
        header: () => "Created by",
        cell: ({ row }: any) => (
          <TwoLine primary={row.original.createdBy} secondary={row.original.createdByRole} />
        ),
      },
      {
        id: "createdOn",
        accessorKey: "createdOn",
        width: 266,
        header: () => "Created on",
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.createdOn).split("\n");
          return <TwoLine primary={date} secondary={time} />;
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
              onClick={() => setEditTarget(row.original)}
              aria-label="Edit"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteTarget(row.original)}
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
    [currentPage, selected, pageAllSelected, pageSomeSelected],
  );

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Figma `Section Header` (5029:3722, Body → Section Layout - Table): ONE row —
            title left, Search + Add Rank right. No separate page-level heading above the
            card, and no repeated title inside it — see figma-slicing PITFALLS.md #17. */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <h1 className="text-base font-semibold text-default whitespace-nowrap">Rank</h1>
            <div className="flex items-center gap-3">
              <div className="relative w-60">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
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
              <Button
                onClick={() => setShowAdd(true)}
                className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-9 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
              >
                <Plus size={16} />
                Add Rank
              </Button>
            </div>
          </div>

          <TableCustom<Rank> columns={columns} data={paginated} autoScrollTable={true} />
          <Pagination
            currentPage={currentPage}
            itemsPerPage={PER_PAGE}
            totalItems={sorted.length}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Figma `Action - Bulk Action / Select` (5337:508133): the shared
            floating `Table - Bulk Action Bar`, NOT buttons in the section
            header — it carries an X, "N selected", then the two actions. */}
        <BulkActionBar
          open={selected.size > 0}
          count={selected.size}
          onDismiss={() => setSelected(new Set())}
          actions={
            <>
              {selected.size < sorted.length && (
                <BulkActionButton onClick={() => setSelected(new Set(sorted.map((r) => r.id)))}>
                  Select All {sorted.length} Ranks
                </BulkActionButton>
              )}
              <BulkActionButton tone="danger" onClick={() => setBulkDelete(true)}>
                <Trash2 size={16} />
                Delete
              </BulkActionButton>
            </>
          }
        />
      </div>

      <RankDrawer
        open={showAdd || !!editTarget}
        initial={editTarget}
        existingNames={ranks.map((r) => r.rank)}
        onClose={() => {
          setShowAdd(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        tone="warning"
        title={<>Delete &ldquo;{deleteTarget?.rank}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setRanks((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setToast(`${deleteTarget.rank} deleted`);
          }
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={bulkDelete}
        tone="warning"
        title={<>Delete {selected.size} ranks?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setBulkDelete(false)}
        onConfirm={() => {
          const n = selected.size;
          setRanks((prev) => prev.filter((r) => !selected.has(r.id)));
          setSelected(new Set());
          setToast(`${n} ranks deleted`);
          setBulkDelete(false);
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

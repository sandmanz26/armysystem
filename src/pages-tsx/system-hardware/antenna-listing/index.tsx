import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { antennaEntries as initialAntennas } from "@/data/rfidConfig";
import { Button } from "@/components/button";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { AntennaTable } from "./components/AntennaTable";
import { AntennaDrawer } from "./modals/AntennaDrawer";
import { PER_PAGE } from "./constants";
import type { AntennaEntry } from "./types";

/*
 * Antenna Location Listing — Figma `Antenna Listing` (5133:43159).
 *   list / full table / empty   5167:211869 · 211888 · 211907
 *   add + error states          5171:25784 · 25807 · 25829
 *   edit                        5171:25861
 *   delete confirmation         5171:25893
 *   bulk select + bulk delete   5337:490380 · 490322
 */

export function AntennaListing() {
  const [antennas, setAntennas] = useState<AntennaEntry[]>(initialAntennas);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AntennaEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AntennaEntry | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const q = searchQuery.trim().toLowerCase();
  const filtered = antennas.filter(
    (a) =>
      !q ||
      a.antenna.toLowerCase().includes(q) ||
      a.station.toLowerCase().includes(q) ||
      a.rfidReader.toLowerCase().includes(q) ||
      a.antennaPortNumber.toLowerCase().includes(q) ||
      a.antennaKey.toLowerCase().includes(q) ||
      a.gpo.toLowerCase().includes(q),
  );

  const pageRows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const allSelected = pageRows.length > 0 && pageRows.every((a) => selected.has(a.id));
  const someSelected = pageRows.some((a) => selected.has(a.id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageRows.forEach((a) => next.delete(a.id));
      else pageRows.forEach((a) => next.add(a.id));
      return next;
    });

  const handleSubmit = (v: {
    antennaPortNumber: string;
    antenna: string;
    rfidReader: string;
    station: string;
    antennaKey: string;
    gpo: string;
    status: string;
  }) => {
    if (editTarget) {
      setAntennas((prev) =>
        prev.map((a) => (a.id === editTarget.id ? ({ ...a, ...v } as AntennaEntry) : a)),
      );
      setToast(`${v.antenna} updated`);
      setEditTarget(null);
    } else {
      setAntennas((prev) => [
        ...prev,
        {
          ...(v as Omit<AntennaEntry, "id" | "no" | "createdBy" | "createdByRole" | "lastUpdatedOn">),
          id: `a${Date.now()}`,
          no: prev.length + 1,
          createdBy: "Admin User",
          createdByRole: "System Admin",
          lastUpdatedOn: "Just now\n—",
        } as AntennaEntry,
      ]);
      setToast(`${v.antenna} added`);
      setShowAddModal(false);
    }
  };

  const handleDeleteRow = (a: AntennaEntry) => {
    setAntennas((prev) => prev.filter((x) => x.id !== a.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(a.id);
      return next;
    });
    setToast(`${a.antenna} deleted`);
  };

  const handleDeleteSelected = () => {
    const n = selected.size;
    setAntennas((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
    setToast(`${n} ${n === 1 ? "antenna" : "antennas"} deleted`);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Figma (5167:211869): no separate page-level header — `Main
            Content` goes straight to ONE `Section Layout - Table` card,
            whose own Section Header carries the title, bare count, search
            AND the "Add Antenna" button all in one row. A standalone
            "Antenna Location Listing" heading + button above the card was
            invented and has been removed. */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-default">Antenna Listing</h2>
              <span className="text-base font-semibold text-body">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-3">
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
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
              >
                <Plus size={16} />
                Add Antenna
              </Button>
            </div>
          </div>

          <AntennaTable
            data={filtered}
            currentPage={currentPage}
            selected={selected}
            allSelected={allSelected}
            someSelected={someSelected}
            onPageChange={setCurrentPage}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onEdit={setEditTarget}
            onDeleteRow={setDeleteConfirm}
          />
        </div>

        {/* Bulk action bar — Figma `Table - Bulk Action Bar` */}
        <BulkActionBar
          open={selected.size > 0}
          count={selected.size}
          onDismiss={() => setSelected(new Set())}
          actions={
            <>
              {selected.size < filtered.length && (
                <BulkActionButton onClick={() => setSelected(new Set(filtered.map((a) => a.id)))}>
                  Select All {filtered.length} {filtered.length === 1 ? "Antenna" : "Antennas"}
                </BulkActionButton>
              )}
              <BulkActionButton tone="danger" onClick={() => setDeleteBulkConfirm(true)}>
                <Trash2 size={16} />
                Delete
              </BulkActionButton>
            </>
          }
        />
      </div>

      {/* Add / Edit share one drawer — Figma has the same 7 fields in both */}
      <AntennaDrawer
        open={showAddModal || !!editTarget}
        initial={editTarget}
        existing={antennas}
        onClose={() => {
          setShowAddModal(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        tone="warning"
        title={<>Delete &ldquo;{deleteConfirm?.antenna}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDeleteRow(deleteConfirm);
          setDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={deleteBulkConfirm}
        tone="warning"
        title={`Delete ${selected.size} ${selected.size === 1 ? "antenna" : "antennas"}?`}
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

import { useState } from "react";
import { Trash2, Search, Bell, BellOff } from "lucide-react";
import { rfidReaders as initialReaders } from "@/data/rfidConfig";
import { Button } from "@/components/button";
import { Toast } from "@/components/toast";
import { nextSort, sortBy, type SortDir } from "@/lib/sortUtils";
import { RFIDReaderTable } from "./components/RFIDReaderTable";
import { BulkActionBar, BulkActionButton } from "@/components/bulk-action-bar";
import { AddRFIDReaderModal } from "./modals/AddRFIDReaderModal";
import { EditRFIDReaderModal } from "./modals/EditRFIDReaderModal";
import { DeleteConfirmModal } from "./modals/DeleteConfirmModal";
import { AlarmConfirmModal } from "./modals/AlarmConfirmModal";
import { PER_PAGE } from "./constants";
import type { RFIDReader } from "./types";

export function RFIDReaderListing() {
  const [readers, setReaders] = useState<RFIDReader[]>(initialReaders);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<RFIDReader | null>(null);
  const [deleteIds, setDeleteIds] = useState<Set<string> | null>(null);
  const [alarmTarget, setAlarmTarget] = useState<{ ids: Set<string>; turnOn: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /**
   * Figma ships whole `Action - Set Alarm On` / `Set Alarm Off` sections —
   * each one a warning-toned confirmation ("Turn on/off alarm for {n}
   * readers?", 5166:209382 / 5166:209377) followed by its own toast
   * ("{n} readers has been set to alarm on/off", 5337:489169 / 5166:209379).
   * Both the row menu (n=1) and the bulk bar (n=selection) go through the
   * same confirmation + toast here — neither used to have either.
   */
  const requestAlarm = (ids: Set<string>, turnOn: boolean) => setAlarmTarget({ ids, turnOn });

  const handleAlarm = () => {
    if (!alarmTarget) return;
    const { ids, turnOn } = alarmTarget;
    setReaders((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, armStatus: turnOn ? "Arm" : "Disarm" } : r)),
    );
    setSelected(new Set());
    setToast(`${ids.size} readers has been set to alarm ${turnOn ? "on" : "off"}`);
    setAlarmTarget(null);
  };

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = readers.filter(
    (r) => !searchQuery || r.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sorted = sortField
    ? sortBy(filtered, sortField as keyof RFIDReader, sortDir)
    : filtered;

  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const allSelected = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const someSelected = paginated.some((r) => selected.has(r.id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(paginated.map((r) => r.id)));

  const handleDelete = (ids: Set<string>) => {
    const targets = readers.filter((r) => ids.has(r.id));
    setReaders((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelected((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.delete(id));
      return n;
    });
    setDeleteIds(null);
    setToast(targets.length === 1 ? `${targets[0].displayName} deleted` : `${targets.length} readers deleted`);
  };

  const handleSave = (updated: RFIDReader) => {
    setReaders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setToast(`${updated.displayName} updated`);
  };

  const handleAdd = (r: RFIDReader) => {
    setReaders((prev) => [...prev, { ...r, no: prev.length + 1 }]);
    setToast(`${r.displayName} added`);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6">
        {/* Figma (5162:186881): no separate page-level header — the card's
            own Section Header carries the title, bare count, search AND
            the "Add RFID Reader" button all in one row (confirmed via
            screenshot; a standalone heading + subtitle "Readers registered
            across every base station" above the card, and a second title
            inside it, were both invented and are removed). The count is a
            bare number next to the title ("RFID Reader Listing 32"), not
            "(N records)". The page-level Alarm On/Off toggles that used to
            sit here are not in Figma; alarms are the per-row toggle column
            in the table (`Alarm`, next to Serial Number). */}
        <div className="bg-surface-lv1 rounded-xl border border-invert-default">
          <div className="flex items-center justify-between px-5 py-5 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-default">RFID Reader Listing</h2>
              <span className="text-base font-semibold text-body">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-placeholder" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 h-9 text-sm border border-invert-default rounded-lg w-60 bg-surface text-default focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 h-10 px-4 text-sm bg-primary-default text-invert-default rounded-lg hover:bg-primary-hovered font-semibold shadow-sm transition-colors whitespace-nowrap w-auto"
              >
                <span className="text-base leading-none">+</span>
                Add RFID Reader
              </Button>
            </div>
          </div>

          {/* Table */}
          <RFIDReaderTable
            data={paginated}
            currentPage={currentPage}
            totalItems={filtered.length}
            selected={selected}
            allSelected={allSelected}
            someSelected={someSelected}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            onToggleAll={toggleAll}
            onToggleSelect={toggleSelect}
            onEdit={setEditTarget}
            onDelete={setDeleteIds}
            onPageChange={setCurrentPage}
            onAlarm={(reader, on) => requestAlarm(new Set([reader.id]), on)}
          />
        </div>

        {/* Figma `Table - Bulk Action Bar` (5337:382978): a count, "Select All
            N RFID Readers", then Alarm On / Alarm Off as PRIMARY buttons and a
            danger-outlined Delete. Bulk delete used to be a filled red button
            up in the page header, and the alarm commands had no bulk form. */}
        <BulkActionBar
          open={selected.size > 0}
          count={selected.size}
          onDismiss={() => setSelected(new Set())}
          actions={
            <>
              <BulkActionButton onClick={() => setSelected(new Set(filtered.map((r) => r.id)))}>
                Select All {filtered.length} RFID Readers
              </BulkActionButton>
              <BulkActionButton tone="primary" onClick={() => requestAlarm(selected, true)}>
                <Bell size={16} />
                Alarm On
              </BulkActionButton>
              <BulkActionButton tone="primary" onClick={() => requestAlarm(selected, false)}>
                <BellOff size={16} />
                Alarm Off
              </BulkActionButton>
              <BulkActionButton tone="danger" onClick={() => setDeleteIds(new Set(selected))}>
                <Trash2 size={16} />
                Delete
              </BulkActionButton>
            </>
          }
        />
      </div>

      {/* Modals — parent controls mounting */}
      {showAddModal && (
        <AddRFIDReaderModal
          existingReaders={readers}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {editTarget && (
        <EditRFIDReaderModal
          reader={editTarget}
          existingReaders={readers}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}
      {deleteIds && (
        <DeleteConfirmModal
          readers={readers.filter((r) => deleteIds.has(r.id))}
          onClose={() => setDeleteIds(null)}
          onConfirm={() => handleDelete(deleteIds)}
        />
      )}
      {alarmTarget && (
        <AlarmConfirmModal
          count={alarmTarget.ids.size}
          turnOn={alarmTarget.turnOn}
          onClose={() => setAlarmTarget(null)}
          onConfirm={handleAlarm}
        />
      )}

      <Toast message={toast ?? ""} open={toast !== null} onDismiss={() => setToast(null)} />
    </div>
  );
}

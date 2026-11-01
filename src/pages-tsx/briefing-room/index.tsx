import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { briefingRooms as initialBriefingRooms } from "@/data/briefingRooms";
import { Button } from "@/components/button";
import { nextSort, sortBy, type SortDir } from "@/lib/sortUtils";
import { BriefingRoomTable } from "./components/BriefingRoomTable";
import { AddBriefingRoomModal } from "./modals/AddBriefingRoomModal";
import { EditBriefingRoomDrawer } from "./modals/EditBriefingRoomDrawer";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import type { BriefingRoom } from "./types";

export function BriefingRoom() {
  const [roomList, setRoomList] = useState<BriefingRoom[]>(initialBriefingRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<BriefingRoom | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = roomList.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = sortField ? sortBy(filtered, sortField as keyof BriefingRoom, sortDir) : filtered;

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    const PER_PAGE = 10;
    const pageRows = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    if (pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageRows.map((r) => r.id)));
    }
  };

  const handleAdd = (r: BriefingRoom) => {
    setRoomList((prev) => [...prev, { ...r, no: prev.length + 1 }]);
  };

  const handleEdit = (updated: BriefingRoom) => {
    setRoomList((prev) => prev.map((r) => r.id === updated.id ? updated : r));
  };

  const handleDelete = (id: string) => {
    setRoomList((prev) => prev.filter((r) => r.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleDeleteSelected = () => {
    setRoomList((prev) => prev.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-default">Briefing Room</h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <Button
                onClick={() => setDeleteBulkConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-invert-default rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selected.size})
              </Button>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-invert-default rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add Briefing Room
            </Button>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-invert-default">
          {/* Toolbar */}
          <div className="flex items-center px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          <BriefingRoomTable
            data={sorted}
            currentPage={currentPage}
            selected={selected}
            sortField={sortField}
            sortDir={sortDir}
            onPageChange={setCurrentPage}
            onSort={handleSort}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onEdit={setEditTarget}
            onDelete={setDeleteConfirm}
          />
        </div>
      </div>

      {/* Modals — parent controls mounting */}
      {showAddModal && (
        <AddBriefingRoomModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}

      {editTarget && (
        <EditBriefingRoomDrawer
          room={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => { handleEdit(updated); setEditTarget(null); }}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmDialog
          message="Are you sure you want to delete this briefing room?"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => { handleDelete(deleteConfirm); setDeleteConfirm(null); }}
        />
      )}

      {deleteBulkConfirm && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete ${selected.size} selected briefing room${selected.size === 1 ? "" : "s"}?`}
          onCancel={() => setDeleteBulkConfirm(false)}
          onConfirm={() => { handleDeleteSelected(); setDeleteBulkConfirm(false); }}
        />
      )}
    </div>
  );
}

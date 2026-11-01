import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { Button } from "@/components/button";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { platformTypes, callSigns, roles, vehicles } from "@/data/mstTctMasterData";
import { MasterDataTable } from "./components/MasterDataTable";
import { MasterDataFormModal } from "./modals/MasterDataFormModal";
import { ENTITY_TABS } from "./constants";
import type { MasterDataEntityKey, MasterDataItem } from "./types";

const SEED: Record<MasterDataEntityKey, MasterDataItem[]> = {
  platformType: platformTypes,
  callSign: callSigns,
  role: roles,
  vehicle: vehicles,
};

function MSTTCTMasterDataEntityPage({ entity }: { entity: MasterDataEntityKey }) {
  const meta = ENTITY_TABS.find((t) => t.key === entity)!;

  const [list, setList] = useState<MasterDataItem[]>(SEED[entity]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MasterDataItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteBulkConfirm, setDeleteBulkConfirm] = useState(false);

  const filtered = list.filter(
    (t) => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    const PER_PAGE = 10;
    const pageRows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    if (pageRows.length > 0 && pageRows.every((t) => selected.has(t.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageRows.map((t) => t.id)));
    }
  };

  const nowStamp = () => {
    const d = new Date();
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}\n${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;
  };

  const handleAdd = (values: { name: string; status: "Active" | "Inactive" }) => {
    setList((prev) => [
      ...prev,
      {
        id: `${entity}-${Date.now()}`,
        name: values.name,
        status: values.status,
        createdBy: "Olivia Carter",
        createdOn: nowStamp(),
      },
    ]);
  };

  const handleEdit = (updated: { name: string; status: "Active" | "Inactive" }) => {
    if (!editTarget) return;
    setList((prev) => prev.map((t) => (t.id === editTarget.id ? { ...t, ...updated } : t)));
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((t) => t.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleDeleteSelected = () => {
    setList((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">{meta.label}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage {meta.singular} options used across MST and TCT bookings.</p>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <Button
                onClick={() => setDeleteBulkConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selected.size})
              </Button>
            )}
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add {meta.singular}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <MasterDataTable
            data={filtered}
            currentPage={currentPage}
            selected={selected}
            nameLabel={meta.singular}
            onPageChange={setCurrentPage}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onEdit={setEditTarget}
            onDelete={setDeleteConfirm}
          />
        </div>
      </div>

      {showAddModal && (
        <MasterDataFormModal
          mode="add"
          singularLabel={meta.singular}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <MasterDataFormModal
          mode="edit"
          singularLabel={meta.singular}
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={(vals) => { handleEdit(vals); setEditTarget(null); }}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete this ${meta.singular.toLowerCase()}?`}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => { handleDelete(deleteConfirm); setDeleteConfirm(null); }}
        />
      )}

      {deleteBulkConfirm && (
        <DeleteConfirmDialog
          message={`Are you sure you want to delete ${selected.size} selected ${meta.singular.toLowerCase()}${selected.size === 1 ? "" : "s"}?`}
          onCancel={() => setDeleteBulkConfirm(false)}
          onConfirm={() => { handleDeleteSelected(); setDeleteBulkConfirm(false); }}
        />
      )}
    </div>
  );
}

export function MSTTCTPlatformType() {
  return <MSTTCTMasterDataEntityPage entity="platformType" />;
}

export function MSTTCTCallSign() {
  return <MSTTCTMasterDataEntityPage entity="callSign" />;
}

export function MSTTCTRole() {
  return <MSTTCTMasterDataEntityPage entity="role" />;
}

export function MSTTCTVehicle() {
  return <MSTTCTMasterDataEntityPage entity="vehicle" />;
}

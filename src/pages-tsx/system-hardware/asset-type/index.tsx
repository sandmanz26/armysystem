import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { assetTypes as initialAssetTypes } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { nextSort, sortBy, type SortDir } from "@/lib/sortUtils";
import { AssetTypeTable } from "./components/AssetTypeTable";
import { assets } from "@/data/systemHardware";
import { AssetTypeDrawer } from "./modals/AssetTypeDrawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import type { AssetTypeData } from "./types";

export function AssetType() {
  const [assetTypeList, setAssetTypeList] = useState<AssetTypeData[]>(initialAssetTypes);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AssetTypeData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AssetTypeData | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = assetTypeList.filter(
    (t) => !searchQuery || t.assetType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = sortField ? sortBy(filtered, sortField as keyof AssetTypeData, sortDir) : filtered;

  /** Figma's blocked-delete state: an asset type still referenced by assets
      cannot be removed. Counted from the asset list's own `assetType` field. */
  const linkedAssetCount = (t: AssetTypeData | null) =>
    t ? assets.filter((a) => a.assetType === t.assetType).length : 0;

  const handleSubmit = (v: { assetType: string; assetCategory: string; code: string; status: string }) => {
    if (editTarget) {
      setAssetTypeList((prev) =>
        prev.map((t) => (t.id === editTarget.id ? { ...t, ...v } as AssetTypeData : t)),
      );
      setToast(`${v.assetType} updated`);
      setEditTarget(null);
    } else {
      setAssetTypeList((prev) => [
        ...prev,
        {
          ...(v as unknown as AssetTypeData),
          id: `at${Date.now()}`,
          no: prev.length + 1,
          createdBy: "Admin User",
          createdByRole: "System Admin",
          lastUpdatedOn: "Just now\n—",
        },
      ]);
      setToast(`${v.assetType} added`);
      setShowAddModal(false);
    }
  };

  const handleDelete = (t: AssetTypeData) => {
    setAssetTypeList((prev) => prev.filter((x) => x.id !== t.id));
    setToast(`${t.assetType} deleted`);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Figma (5133:42395): no separate page-level header — the card's
            own Section Header carries the title, bare count ("Asset Type
            32", not "(N records)"), search AND the "Add Asset Type"
            button all in one row (confirmed by screenshot; a standalone
            heading + button above the card, and a second title inside it,
            were both invented and are removed). */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-default">Asset Type</h2>
              <span className="text-base font-semibold text-body">{sorted.length}</span>
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
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                />
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
              >
                <Plus size={16} />
                Add Asset Type
              </Button>
            </div>
          </div>

          <AssetTypeTable
            data={sorted}
            currentPage={currentPage}
            sortField={sortField}
            sortDir={sortDir}
            onPageChange={setCurrentPage}
            onSort={handleSort}
            onEdit={setEditTarget}
            onDelete={setDeleteConfirm}
          />
        </div>
      </div>

      {/* Add / Edit share one drawer — Figma has the same 4 fields in both */}
      <AssetTypeDrawer
        open={showAddModal || !!editTarget}
        initial={editTarget}
        onClose={() => {
          setShowAddModal(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Delete — Figma has a normal confirm and a BLOCKED variant */}
      <ConfirmDialog
        open={!!deleteConfirm && linkedAssetCount(deleteConfirm) === 0}
        tone="warning"
        title={<>Delete &ldquo;{deleteConfirm?.assetType}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDelete(deleteConfirm);
          setDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm && linkedAssetCount(deleteConfirm) > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{deleteConfirm?.assetType}&rdquo;</>}
        subtitle={`This asset type is linked to ${linkedAssetCount(deleteConfirm)} assets. Reassign these assets before deleting it.`}
        cancelLabel="Close"
        confirmLabel="View Assets List"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          setDeleteConfirm(null);
          window.location.href = "/system-hardware/assets-list";
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

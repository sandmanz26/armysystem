import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { assetCategories as initialCategories, assetTypes } from "@/data/systemHardware";
import type { AssetCategory } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { nextSort, sortBy, type SortDir } from "@/lib/sortUtils";
import { AssetCategoryTable } from "./components/AssetCategoryTable";
import { AssetCategoryDrawer } from "./modals/AssetCategoryDrawer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";

export function AssetCategory() {
  const [categories, setCategories] = useState<AssetCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AssetCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AssetCategory | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSort = (field: string) => {
    const s = nextSort(sortField, field, sortDir);
    setSortField(s.field);
    setSortDir(s.dir);
    setCurrentPage(1);
  };

  const filtered = categories.filter(
    (c) => !searchQuery || c.assetCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = sortField
    ? sortBy(filtered, sortField as keyof (typeof filtered)[0], sortDir)
    : filtered;

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  /** Figma's blocked-delete state counts the ASSET TYPES sitting in this
      category (Asset Type's own blocked state counts assets instead). */
  const assetTypeCount = (c: AssetCategory | null) =>
    c ? assetTypes.filter((t) => t.assetCategory === c.assetCategory).length : 0;

  const handleSubmit = (v: { assetCategory: string; status: string; alert: string }) => {
    if (editTarget) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editTarget.id ? ({ ...c, ...v } as AssetCategory) : c)),
      );
      setToast(`${v.assetCategory} updated`);
      setEditTarget(null);
    } else {
      setCategories((prev) => [
        ...prev,
        {
          ...(v as unknown as AssetCategory),
          id: `ac${Date.now()}`,
          no: prev.length + 1,
          createdBy: "Admin User",
          createdByRole: "System Admin",
          lastUpdatedOn: "Just now\n—",
        },
      ]);
      setToast(`${v.assetCategory} added`);
      setShowAddModal(false);
    }
  };

  const handleDeleteRow = (c: AssetCategory) => {
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
    setToast(`${c.assetCategory} deleted`);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Figma (5133:42396): no separate page-level header — the card's
            own Section Header carries the title, bare count ("Asset
            Category 32", not "(N records)"), search AND the "Add Asset
            Category" button all in one row (confirmed by screenshot; a
            standalone heading + button above the card, and a second title
            inside it, were both invented and are removed). */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="flex items-center justify-between gap-5 p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-base font-semibold text-default">Asset Category</h2>
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-9 pl-10 pr-3 py-2 text-sm bg-surface text-default placeholder:text-placeholder border border-invert-default rounded-lg focus:outline-none focus:ring-[3px] focus:ring-primary-invert-focused focus:border-primary transition-colors"
                />
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg bg-primary-default text-invert-default text-sm font-semibold hover:bg-primary-hovered transition-colors"
              >
                <Plus size={16} />
                Add Asset Category
              </Button>
            </div>
          </div>

          <AssetCategoryTable
            data={sorted}
            currentPage={currentPage}
            sortField={sortField}
            sortDir={sortDir}
            onPageChange={setCurrentPage}
            onSort={handleSort}
            onEdit={setEditTarget}
            onDeleteRow={setDeleteConfirm}
          />
        </div>
      </div>

      {/* Add / Edit share one drawer — Figma has the same 3 fields in both */}
      <AssetCategoryDrawer
        open={showAddModal || !!editTarget}
        initial={editTarget}
        existingNames={categories.map((c) => c.assetCategory)}
        onClose={() => {
          setShowAddModal(false);
          setEditTarget(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteConfirm && assetTypeCount(deleteConfirm) === 0}
        tone="warning"
        title={<>Delete &ldquo;{deleteConfirm?.assetCategory}&rdquo;?</>}
        subtitle="This can't be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDeleteRow(deleteConfirm);
          setDeleteConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm && assetTypeCount(deleteConfirm) > 0}
        tone="danger"
        title={<>Can&rsquo;t delete &ldquo;{deleteConfirm?.assetCategory}&rdquo;</>}
        subtitle={`This category contains ${assetTypeCount(deleteConfirm)} asset types. Reassign or delete these asset types before deleting the category.`}
        cancelLabel="Close"
        confirmLabel="View Asset Type"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          setDeleteConfirm(null);
          window.location.href = "/system-hardware/asset-type";
        }}
      />

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

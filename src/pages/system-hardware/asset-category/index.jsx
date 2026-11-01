import { useState } from "react";
import { Trash2 } from "lucide-react";
import { assetCategories } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { nextSort, sortBy } from "@/lib/sortUtils";
import { AssetCategoryToolbar } from "./components/AssetCategoryToolbar";
import { AssetCategoryTable } from "./components/AssetCategoryTable";
import { AddAssetCategoryModal } from "./modals/AddAssetCategoryModal";
import { EditAssetCategorySidebar } from "./components/EditAssetCategorySidebar";
export function AssetCategory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editSidebar, setEditSidebar] = useState({ open: false, category: null });
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const filtered = assetCategories.filter((c) => !searchQuery || c.assetCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    const sorted = sortField
        ? sortBy(filtered, sortField, sortDir)
        : filtered;
    const handleSearchChange = (q) => {
        setSearchQuery(q);
        setCurrentPage(1);
    };
    const toggleSelect = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAll = () => {
        const pageStart = (currentPage - 1) * 10;
        const pageEnd = currentPage * 10;
        const pageRows = sorted.slice(pageStart, pageEnd);
        const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
        if (allSelected) {
            setSelected((prev) => {
                const next = new Set(prev);
                pageRows.forEach((r) => next.delete(r.id));
                return next;
            });
        }
        else {
            setSelected((prev) => {
                const next = new Set(prev);
                pageRows.forEach((r) => next.add(r.id));
                return next;
            });
        }
    };
    const handleDeleteRow = (id) => {
        setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    };
    const handleEditSave = (updated) => {
        // In real app: call API. Here we update local mock state.
        console.log("Saved:", updated);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Asset Category</h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (<Button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <Trash2 size={14}/>
                Delete ({selected.size})
              </Button>)}
            <Button className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover font-medium" onClick={() => setShowAddModal(true)}>
              + Add Asset Category
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <AssetCategoryToolbar searchQuery={searchQuery} onSearchChange={handleSearchChange}/>
          <AssetCategoryTable data={sorted} currentPage={currentPage} selected={selected} sortField={sortField} sortDir={sortDir} onPageChange={setCurrentPage} onSort={handleSort} onToggleSelect={toggleSelect} onToggleAll={toggleAll} onEditTarget={(cat) => setEditSidebar({ open: true, category: cat })} onDeleteRow={handleDeleteRow}/>
        </div>
      </div>

      <AddAssetCategoryModal open={showAddModal} onClose={() => setShowAddModal(false)}/>
      <EditAssetCategorySidebar
        open={editSidebar.open}
        category={editSidebar.category}
        onClose={() => setEditSidebar({ open: false, category: null })}
        onSave={handleEditSave}
      />
    </div>);
}

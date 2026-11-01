import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { assetTypes as initialAssetTypes } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { nextSort, sortBy } from "@/lib/sortUtils";
import { AssetTypeTable } from "./components/AssetTypeTable";
import { AddAssetTypeModal } from "./modals/AddAssetTypeModal";
import { EditAssetTypeSidebar } from "./components/EditAssetTypeSidebar";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
export function AssetType() {
    const [assetTypeList, setAssetTypeList] = useState(initialAssetTypes);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editSidebar, setEditSidebar] = useState({ open: false, asset: null });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, ids: null });
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const filtered = assetTypeList.filter((t) => !searchQuery || t.assetType.toLowerCase().includes(searchQuery.toLowerCase()));
    const sorted = sortField ? sortBy(filtered, sortField, sortDir) : filtered;
    const toggleSelect = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAll = () => {
        const PER_PAGE = 10;
        const pageRows = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
        if (pageRows.length > 0 && pageRows.every((t) => selected.has(t.id))) {
            setSelected(new Set());
        }
        else {
            setSelected(new Set(pageRows.map((t) => t.id)));
        }
    };
    const handleAdd = (t) => {
        setAssetTypeList((prev) => [...prev, { ...t, no: prev.length + 1 }]);
    };
    const handleDeleteSelected = () => {
        setAssetTypeList((prev) => prev.filter((t) => !selected.has(t.id)));
        setSelected(new Set());
    };
    const handleEditSave = (updated) => {
        setAssetTypeList((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    };
    const handleDeleteOne = (id) => {
        setAssetTypeList((prev) => prev.filter((t) => t.id !== id));
        setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Asset Type</h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (<Button onClick={() => setConfirmDelete({ open: true, ids: [...selected] })} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap">
                <Trash2 size={14}/>
                Delete ({selected.size})
              </Button>)}
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors whitespace-nowrap">
              <span className="text-base leading-none">+</span>
              Add Asset Type
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Toolbar */}
          <div className="flex items-center px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
          </div>

          <AssetTypeTable data={sorted} currentPage={currentPage} selected={selected} sortField={sortField} sortDir={sortDir} onPageChange={setCurrentPage} onSort={handleSort} onToggleSelect={toggleSelect} onToggleAll={toggleAll} onEdit={(asset) => setEditSidebar({ open: true, asset })} onDelete={(id) => setConfirmDelete({ open: true, ids: [id] })}/>
        </div>
      </div>

      <AddAssetTypeModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAdd}/>
      <ConfirmDeleteModal
        open={confirmDelete.open}
        count={confirmDelete.ids?.length ?? 0}
        onClose={() => setConfirmDelete({ open: false, ids: null })}
        onConfirm={() => {
          if (confirmDelete.ids?.length === 1) {
            handleDeleteOne(confirmDelete.ids[0]);
          } else {
            handleDeleteSelected();
          }
        }}
      />
      <EditAssetTypeSidebar
        open={editSidebar.open}
        asset={editSidebar.asset}
        onClose={() => setEditSidebar({ open: false, asset: null })}
        onSave={handleEditSave}
      />
    </div>);
}

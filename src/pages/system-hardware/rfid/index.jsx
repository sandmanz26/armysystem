import { useState } from "react";
import { Trash2, Search, BellOff, Bell } from "lucide-react";
import { rfidReaders as initialReaders } from "@/data/rfidConfig";
import { Button } from "@/components/button";
import { nextSort, sortBy } from "@/lib/sortUtils";
import { RFIDReaderTable } from "./components/RFIDReaderTable";
import { AddRFIDReaderModal } from "./modals/AddRFIDReaderModal";
import { EditRFIDReaderModal } from "./modals/EditRFIDReaderModal";
import { DeleteConfirmModal } from "./modals/DeleteConfirmModal";
import { PER_PAGE } from "./constants";
export function RFIDReaderListing() {
    const [readers, setReaders] = useState(initialReaders);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteIds, setDeleteIds] = useState(null);
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const filtered = readers.filter((r) => !searchQuery || r.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    const sorted = sortField
        ? sortBy(filtered, sortField, sortDir)
        : filtered;
    const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const allSelected = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
    const someSelected = paginated.some((r) => selected.has(r.id));
    const toggleSelect = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map((r) => r.id)));
    const handleDelete = (ids) => {
        setReaders((prev) => prev.filter((r) => !ids.has(r.id)));
        setSelected((prev) => {
            const n = new Set(prev);
            ids.forEach((id) => n.delete(id));
            return n;
        });
        setDeleteIds(null);
    };
    const handleSave = (updated) => {
        setReaders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    };
    const handleAdd = (r) => {
        setReaders((prev) => [...prev, { ...r, no: prev.length + 1 }]);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">RFID Reader Listing</h1>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (<Button onClick={() => setDeleteIds(new Set(selected))} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors shadow-sm">
                <Trash2 size={14}/>
                Delete ({selected.size})
              </Button>)}
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors">
              <span className="text-base leading-none">+</span>
              Add RFID Reader
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
        }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
            <div className="flex items-center gap-3">
              {/* Alarm buttons stay raw — these are toolbar toggle actions, not page-action buttons */}
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
                <BellOff size={14}/>
                Alarm Off
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium">
                <Bell size={14}/>
                Alarm On
              </button>
            </div>
          </div>

          {/* Table */}
          <RFIDReaderTable data={paginated} currentPage={currentPage} totalItems={filtered.length} selected={selected} allSelected={allSelected} someSelected={someSelected} sortField={sortField} sortDir={sortDir} onSort={handleSort} onToggleAll={toggleAll} onToggleSelect={toggleSelect} onEdit={setEditTarget} onDelete={setDeleteIds} onPageChange={setCurrentPage}/>
        </div>
      </div>

      {/* Sidebars */}
      <AddRFIDReaderModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAdd}/>
      <EditRFIDReaderModal open={!!editTarget} reader={editTarget ?? {}} onClose={() => setEditTarget(null)} onSave={handleSave}/>
      {deleteIds && (<DeleteConfirmModal count={deleteIds.size} onClose={() => setDeleteIds(null)} onConfirm={() => handleDelete(deleteIds)}/>)}
    </div>);
}

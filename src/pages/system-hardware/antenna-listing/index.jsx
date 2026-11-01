import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { antennaEntries } from "@/data/rfidConfig";
import { Button } from "@/components/button";
import { nextSort, sortBy } from "@/lib/sortUtils";
import { AntennaTable } from "./components/AntennaTable";
import { AddAntennaModal } from "./modals/AddAntennaModal";
import { EditAntennaSidebar } from "./modals/EditAntennaSidebar";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
export function AntennaListing() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editSidebar, setEditSidebar] = useState({ open: false, antenna: null });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, ids: null });
    const handleSort = (field) => {
        const s = nextSort(sortField, field, sortDir);
        setSortField(s.field);
        setSortDir(s.dir);
        setCurrentPage(1);
    };
    const filtered = antennaEntries.filter((a) => !searchQuery ||
        a.antenna.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.station.toLowerCase().includes(searchQuery.toLowerCase()));
    const sorted = sortField
        ? sortBy(filtered, sortField, sortDir)
        : filtered;
    const paginated = (() => {
        const PER_PAGE = 10;
        return sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    })();
    const allSelected = paginated.length > 0 && paginated.every((a) => selected.has(a.id));
    const someSelected = paginated.some((a) => selected.has(a.id));
    const toggleSelect = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map((a) => a.id)));
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-brand-primary">Antenna Location Listing</h1>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (<Button onClick={() => setConfirmDelete({ open: true, ids: [...selected] })} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap">
                <Trash2 size={14}/>
                Delete ({selected.size})
              </Button>)}
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-semibold shadow-sm transition-colors whitespace-nowrap min-w-[148px] justify-center">
              <span className="text-base leading-none">+</span>
              Add Antenna
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
            </div>
          </div>

          <AntennaTable data={sorted} currentPage={currentPage} selected={selected} allSelected={allSelected} someSelected={someSelected} sortField={sortField} sortDir={sortDir} onPageChange={setCurrentPage} onSort={handleSort} onToggleSelect={toggleSelect} onToggleAll={toggleAll} onEdit={(ant) => setEditSidebar({ open: true, antenna: ant })} onDelete={(id) => setConfirmDelete({ open: true, ids: [id] })}/>
        </div>
      </div>

      <AddAntennaModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={() => {}} />
      <EditAntennaSidebar open={editSidebar.open} antenna={editSidebar.antenna} onClose={() => setEditSidebar({ open: false, antenna: null })} onSave={(updated) => { console.log("Antenna saved:", updated); }} />
      <ConfirmDeleteModal
        open={confirmDelete.open}
        count={confirmDelete.ids?.length ?? 0}
        onClose={() => setConfirmDelete({ open: false, ids: null })}
        onConfirm={() => {
          setSelected((prev) => {
            const next = new Set(prev);
            confirmDelete.ids?.forEach((id) => next.delete(id));
            return next;
          });
        }}
      />
    </div>);
}

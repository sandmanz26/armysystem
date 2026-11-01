import { useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { LOCATIONS } from "../constants";
import { LocationModal } from "../modals/LocationModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
const columnHelper = createColumnHelper();
const PER = 10;
export function LocationSetting() {
    const [rows, setRows] = useState(LOCATIONS);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, ids: null });
    const filtered = rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
    const paginated = filtered.slice((currentPage - 1) * PER, currentPage * PER);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
    const allSel = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
    const someSel = paginated.some((r) => selected.has(r.id));
    const toggleAll = () => setSelected(allSel ? new Set() : new Set(paginated.map((r) => r.id)));
    const toggleOne = (id) => setSelected((prev) => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });
    const handleAdd = (entry) => {
        setRows((prev) => [...prev, { ...entry, id: `loc-${Date.now()}` }]);
    };
    const handleEdit = (entry) => {
        if (!editTarget)
            return;
        setRows((prev) => prev.map((r) => r.id === editTarget.id ? { ...r, ...entry } : r));
    };
    const handleDelete = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
    const handleDeleteSelected = () => {
        setRows((prev) => prev.filter((r) => !selected.has(r.id)));
        setSelected(new Set());
    };
    const columns = [
        columnHelper.display({
            id: "select",
            header: () => (<Checkbox checked={allSel} indeterminate={someSel && !allSel} onChange={toggleAll} size={16}/>),
            cell: ({ row }) => (<Checkbox checked={selected.has(row.original.id)} onChange={() => toggleOne(row.original.id)} size={16}/>),
        }),
        columnHelper.display({
            id: "no",
            header: () => "No",
            cell: ({ row }) => {
                const idx = paginated.findIndex((r) => r.id === row.original.id);
                return <span className="text-gray-500">{(currentPage - 1) * PER + idx + 1}</span>;
            },
        }),
        columnHelper.accessor("name", {
            header: () => "Name",
            cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: () => "Status",
            cell: (info) => (<span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", info.getValue() === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
          {info.getValue()}
        </span>),
        }),
        columnHelper.accessor("description", {
            header: () => "Description",
            cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (<div className="flex items-center gap-1">
          <button onClick={() => setEditTarget(row.original)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-red-50 rounded transition-colors">
            <Pencil size={14}/>
          </button>
          <button onClick={() => setConfirmDelete({ open: true, ids: [row.original.id] })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14}/>
          </button>
        </div>),
        }),
    ];
    return (<div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          Location <span className="text-gray-400 font-normal">({rows.length} Rooms)</span>
        </h2>
        <Button onClick={() => setShowAdd(true)} className="px-4 py-2 w-fit bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
          Add Location
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10"/>
          <InputCustom type="text" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
        </div>
        {selected.size > 0 && (<button onClick={() => setConfirmDelete({ open: true, ids: [...selected] })} className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600">
            <Trash2 size={14}/> Delete ({selected.size})
          </button>)}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <TableCustom columns={columns} data={paginated} autoScrollTable={true}/>
        <Pagination currentPage={currentPage} itemsPerPage={PER} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
      </div>

      <LocationModal open={showAdd} mode="add" onClose={() => setShowAdd(false)} onConfirm={handleAdd}/>
      <LocationModal open={!!editTarget} mode="edit" initial={editTarget ?? {}} onClose={() => setEditTarget(null)} onConfirm={handleEdit}/>
      <ConfirmDeleteModal
        open={confirmDelete.open}
        count={confirmDelete.ids?.length ?? 0}
        onClose={() => setConfirmDelete({ open: false, ids: null })}
        onConfirm={() => {
          if (confirmDelete.ids?.length === 1) handleDelete(confirmDelete.ids[0]);
          else handleDeleteSelected();
        }}
      />
    </div>);
}

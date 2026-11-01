import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { IPSidebar } from "./IPSidebar";
import { IP_ENTRIES, PER_PAGE } from "../constants";

const columnHelper = createColumnHelper();

export function IPWhitelisting() {
    const [entries, setEntries] = useState(IP_ENTRIES);
    const [search, setSearch] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [sidebar, setSidebar] = useState({ open: false, mode: "add", ip: null });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, ids: null });

    const filtered = entries.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.ipAddress.includes(search));
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const allSelected = paginated.length > 0 && paginated.every((e) => selected.has(e.id));
    const someSelected = paginated.some((e) => selected.has(e.id));

    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(paginated.map((e) => e.id)));
    const toggleOne = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const handleSave = (ip) => {
        setEntries((prev) => {
            const exists = prev.find((e) => e.id === ip.id);
            return exists ? prev.map((e) => e.id === ip.id ? ip : e) : [ip, ...prev];
        });
    };

    const handleDelete = (ids) => {
        setEntries((prev) => prev.filter((e) => !ids.includes(e.id)));
        setSelected((prev) => { const n = new Set(prev); ids.forEach((id) => n.delete(id)); return n; });
    };

    const columns = [
        columnHelper.display({
            id: "select",
            compact: true, width: "40px", minWidth: "40px", maxWidth: "40px",
            header: () => <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} size={14}/>,
            cell: ({ row }) => <Checkbox checked={selected.has(row.original.id)} onChange={() => toggleOne(row.original.id)} size={14}/>,
        }),
        columnHelper.accessor("name", {
            header: () => "Name",
            cell: (info) => <span className="font-medium text-gray-800">{info.getValue()}</span>,
        }),
        columnHelper.accessor("ipAddress", {
            header: () => "IP Address",
            cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
        }),
        columnHelper.accessor("description", {
            header: () => "Description",
            cell: (info) => <span className="text-gray-700">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: "ipRange",
            header: () => "IP Range",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div><span className="text-xs text-gray-400">Start IP</span><div className="text-sm text-gray-600">{row.original.startIp}</div></div>
                    <div><span className="text-xs text-gray-400">End IP</span><div className="text-sm text-gray-600">{row.original.endIp}</div></div>
                </div>
            ),
        }),
        columnHelper.display({
            id: "action",
            width: "80px", minWidth: "80px", maxWidth: "80px",
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSidebar({ open: true, mode: "edit", ip: row.original })} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-red-50 rounded transition-colors" title="Edit">
                        <Pencil size={14}/>
                    </button>
                    <button onClick={() => setConfirmDelete({ open: true, ids: [row.original.id] })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 size={14}/>
                    </button>
                </div>
            ),
        }),
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                    IP Whitelisting <span className="text-gray-400 font-normal">({entries.length} Devices)</span>
                </h2>
                <div className="flex items-center gap-2">
                    {selected.size > 0 && (
                        <Button onClick={() => setConfirmDelete({ open: true, ids: [...selected] })}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors">
                            <Trash2 size={14}/> Delete ({selected.size})
                        </Button>
                    )}
                    <Button onClick={() => setSidebar({ open: true, mode: "add", ip: null })}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
                        <Plus size={15}/> Add IP
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 z-10"/>
                    <InputCustom type="text" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="radio" name="ip-status" checked={enabled} onChange={() => setEnabled(true)} className="accent-brand-primary"/> Enable
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="radio" name="ip-status" checked={!enabled} onChange={() => setEnabled(false)} className="accent-brand-primary"/> Disable
                    </label>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <TableCustom columns={columns} data={paginated} autoScrollTable={true}
                    classThead="bg-red-50/70" classTheadTh="text-brand-primary text-xs font-semibold"/>
                <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={filtered.length} setCurrentPage={setCurrentPage}/>
            </div>

            <IPSidebar open={sidebar.open} mode={sidebar.mode} ip={sidebar.ip} onClose={() => setSidebar({ open: false, mode: "add", ip: null })} onSave={handleSave}/>
            <ConfirmDeleteModal open={confirmDelete.open} count={confirmDelete.ids?.length ?? 0}
                onClose={() => setConfirmDelete({ open: false, ids: null })}
                onConfirm={() => handleDelete(confirmDelete.ids ?? [])}/>
        </div>
    );
}

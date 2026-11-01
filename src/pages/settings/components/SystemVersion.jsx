import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { INITIAL_VERSIONS } from "../constants";
import { AddVersionModal } from "../modals/AddVersionModal";
const columnHelper = createColumnHelper();
const VER_PER_PAGE = 10;
export function SystemVersion() {
    const [versions, setVersions] = useState(INITIAL_VERSIONS);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(versions.length / VER_PER_PAGE));
    const paginated = versions.slice((currentPage - 1) * VER_PER_PAGE, currentPage * VER_PER_PAGE);
    const handleAdd = (v) => {
        setVersions((prev) => [{ ...v, id: `v-${Date.now()}` }, ...prev]);
    };
    const handleDelete = (id) => setVersions((prev) => prev.filter((v) => v.id !== id));
    const columns = [
        columnHelper.accessor("version", {
            header: () => "Version",
            cell: (info) => <span className="font-semibold text-gray-800">{info.getValue()}</span>,
        }),
        columnHelper.accessor("date", {
            header: () => "Date",
            cell: (info) => {
                const parts = info.getValue().split("\n");
                return (<div>
            <div className="text-sm text-gray-700">{parts[0]}</div>
            <div className="text-xs text-gray-400">{parts[1]}</div>
          </div>);
            },
        }),
        columnHelper.accessor("patchNotes", {
            header: () => "Patch Notes",
            cell: (info) => (<ul className="list-disc list-inside space-y-0.5">
          {info.getValue().map((note, i) => (<li key={i} className="text-sm text-gray-700">{note}</li>))}
        </ul>),
        }),
        columnHelper.display({
            id: "actions",
            header: () => "Actions",
            cell: ({ row }) => (<div className="flex items-center gap-1">
          <button onClick={() => setEditTarget(row.original)} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-red-50 rounded transition-colors">
            <Pencil size={14}/>
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={14}/>
          </button>
        </div>),
        }),
    ];
    return (<div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">System Version</h2>
        <Button onClick={() => setShowAdd(true)} className="px-4 py-2 w-fit bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
          Add Version
        </Button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <TableCustom columns={columns} data={paginated} autoScrollTable={true}/>
        <Pagination currentPage={currentPage} itemsPerPage={VER_PER_PAGE} totalItems={versions.length} setCurrentPage={setCurrentPage}/>
      </div>

      {showAdd && (<AddVersionModal onClose={() => setShowAdd(false)} onAdd={handleAdd}/>)}
      {editTarget && (<AddVersionModal onClose={() => setEditTarget(null)} onAdd={(v) => {
                setVersions((prev) => prev.map((e) => e.id === editTarget.id ? { ...e, ...v } : e));
                setEditTarget(null);
            }}/>)}
    </div>);
}

import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { SortIcon } from "@/lib/sortUtils";
import { PER_PAGE } from "../constants";
export function AntennaTable({ data, currentPage, selected, allSelected, someSelected, sortField, sortDir, onPageChange, onSort, onToggleSelect, onToggleAll, onEdit, onDelete }) {
    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const rows = useMemo(() => data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((entry, idx) => ({
        ...entry,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    })), [currentPage, data]);
    const columns = useMemo(() => [
        {
            id: "select",
            width: 60,
            minWidth: 60,
            maxWidth: 60,
                        compact: true,
            header: () => (<div className="flex items-center justify-center">
            <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={() => onToggleAll()} size={16}/>
          </div>),
            cell: ({ row }) => (<div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.original.id)} onChange={() => onToggleSelect(row.original.id)} size={16}/>
          </div>),
        },
        {
            id: "no",
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            compact: true,
            header: () => "No",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original._idx}</div>),
        },
        {
            id: "station",
            header: () => "Station",
            cell: ({ row }) => (<div className="text-sm text-gray-800 font-medium">{row.original.station}</div>),
        },
        {
            id: "rfidReader",
            header: () => "RFID Reader",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.rfidReader}</div>),
        },
        {
            id: "antennaPortNumber",
            header: () => "Antenna Port Number",
            cell: ({ row }) => (<div className="text-sm text-gray-700 font-mono">{row.original.antennaPortNumber}</div>),
        },
        {
            id: "antenna",
            accessorKey: "antenna",
            header: () => (<button onClick={() => onSort("antenna")} className="flex items-center gap-1 hover:text-brand-primary-hover transition-colors">
            Antenna <SortIcon active={sortField === "antenna"} dir={sortDir}/>
          </button>),
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.antenna}</div>),
        },
        {
            id: "antennaKey",
            header: () => "Antenna Key",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.antennaKey}</div>),
        },
        {
            id: "gpo",
            header: () => "GPO",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.gpo}</div>),
        },
        {
            id: "action",
            width: "90px",
            minWidth: "90px",
            maxWidth: "90px",
            header: () => "Actions",
            cell: ({ row }) => (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onEdit?.(row.original)} className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors" title="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete?.(row.original.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, someSelected, selected, sortField, sortDir]);
    return (<div>
            <TableCustom columns={columns} data={rows} autoScrollTable={true} classTheadTh="py-3" classTBodyTd="h-[58px]"/>
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={data.length} setCurrentPage={onPageChange}/>
    </div>);
}

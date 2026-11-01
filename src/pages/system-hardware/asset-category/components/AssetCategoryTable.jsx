import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { SortIcon } from "@/lib/sortUtils";
import { PER_PAGE } from "../constants";
export function AssetCategoryTable({ data, currentPage, selected, sortField, sortDir, onPageChange, onSort, onToggleSelect, onToggleAll, onEditTarget, onDeleteRow, }) {
    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const rows = useMemo(() => data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((cat, idx) => ({
        ...cat,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    })), [currentPage, data]);
    const allPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
    const somePageSelected = rows.some((r) => selected.has(r.id)) && !allPageSelected;
    const columns = useMemo(() => [
        {
            id: "select",
            width: 48,
            minWidth: 48,
            maxWidth: 48,
            header: () => (<Checkbox checked={allPageSelected} indeterminate={somePageSelected} onChange={onToggleAll} size={16}/>),
            cell: ({ row }) => (<div onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected.has(row.original.id)} onChange={() => onToggleSelect(row.original.id)} size={16}/>
          </div>),
        },
        {
            id: "no",
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            header: () => "No",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original._idx}</div>),
        },
        {
            id: "assetCategory",
            accessorKey: "assetCategory",
            header: () => (<button onClick={() => onSort("assetCategory")} className="flex items-center gap-1 font-semibold text-xs hover:text-brand-primary-hover transition-colors">
            Asset Category <SortIcon active={sortField === "assetCategory"} dir={sortDir}/>
          </button>),
            cell: ({ row }) => (<div className="text-sm text-gray-800 font-medium">{row.original.assetCategory}</div>),
        },
        {
            id: "alert",
            header: () => "Alert",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.alert}</div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: ({ row }) => (<span className={cn("inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5", row.original.status === "Active"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-orange-50 text-orange-500 border-orange-200")}>
            {row.original.status}
          </span>),
        },
        {
            id: "createdBy",
            header: () => "Created By",
            cell: ({ row }) => (<div>
            <div className="text-sm text-gray-800">{row.original.createdBy}</div>
            <div className="text-xs text-gray-400">{row.original.createdByRole}</div>
          </div>),
        },
        {
            id: "lastUpdatedOn",
            accessorKey: "lastUpdatedOn",
            header: () => (<button onClick={() => onSort("lastUpdatedOn")} className="flex items-center gap-1 font-semibold text-xs hover:text-brand-primary-hover transition-colors">
            Last Updated On <SortIcon active={sortField === "lastUpdatedOn"} dir={sortDir}/>
          </button>),
            cell: ({ row }) => (<div className="text-sm text-gray-700 whitespace-pre-line">
            {row.original.lastUpdatedOn}
          </div>),
        },
        {
            id: "action",
            header: () => "Actions",
            cell: ({ row }) => (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEditTarget(row.original)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteRow(row.original.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPageSelected, somePageSelected, selected, sortField, sortDir]);
    return (<div>
      <TableCustom columns={columns} data={rows} autoScrollTable={true} classThead="bg-red-50/70" classTheadTh="text-brand-primary text-xs font-semibold"/>
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={data.length} setCurrentPage={onPageChange}/>
    </div>);
}

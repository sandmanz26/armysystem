import { useMemo } from "react";
import { Eye, MoreVertical } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "../constants";
export function AssetTrackingTable({ data, currentPage, onPageChange }) {
    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const rows = useMemo(() => data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((asset, idx) => ({
        ...asset,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    })), [currentPage, data]);
    const columns = useMemo(() => [
        {
            id: "no",
            header: () => "No",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original._idx}</div>),
        },
        {
            id: "name",
            header: () => "Asset",
            cell: ({ row }) => (<div className="text-sm text-gray-800 font-medium">{row.original.name}</div>),
        },
        {
            id: "serialNumber",
            header: () => "Serial Number",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.serialNumber}</div>),
        },
        {
            id: "assetType",
            header: () => "Asset Type",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.assetType}</div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: ({ row }) => (<span className={cn("inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5", row.original.status === "Available"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : row.original.status === "Issued"
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : "bg-orange-50 text-orange-500 border-orange-200")}>
            {row.original.status}
          </span>),
        },
        {
            id: "actions",
            header: () => "Actions",
            cell: () => (<div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600"><Eye size={16}/></button>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16}/></button>
          </div>),
        },
    ], []);
    return (<div>
      <TableCustom columns={columns} data={rows} autoScrollTable={true}/>
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={data.length} setCurrentPage={onPageChange}/>
    </div>);
}

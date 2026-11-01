import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { Archive, Edit2, Eye } from "lucide-react";
import { useMemo } from "react";
import { PER_PAGE } from "../constants";
import { AssetStatusBadge } from "./AssetStatusBadge";
export function AssetsTable({ data, currentPage, onPageChange, onEdit, onNavigate, }) {
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
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            header: () => "No",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>{info.row.original._idx}</div>),
        },
        {
            id: "name",
            accessorKey: "name",
            header: () => "Asset",
            cell: (info) => (<div className="text-sm text-gray-800 font-medium cursor-pointer hover:text-brand-primary transition-colors" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            {info.row.original.name}
          </div>),
        },
        {
            id: "serialNumber",
            accessorKey: "serialNumber",
            header: () => "Asset Serial Number",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            {info.row.original.serialNumber}
          </div>),
        },
        {
            id: "assetType",
            header: () => "Asset Type",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            {info.row.original.assetType}
          </div>),
        },
        {
            id: "assetCategory",
            header: () => "Asset Category",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            {info.row.original.assetCategory}
          </div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => (<div className="cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}><AssetStatusBadge status={info.row.original.status}/></div>),
        },
        {
            id: "issuedDate",
            accessorKey: "issuedDate",
            header: () => "Issued Date",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            {info.row.original.issuedDate}
          </div>),
        },
        {
            id: "createdBy",
            header: () => "Created By",
            cell: (info) => (<div className="cursor-pointer" onClick={() => onNavigate?.(`/system-hardware/asset-detail/${info.row.original.id}`)}>
            <div className="text-sm text-gray-800 font-medium">
              {info.row.original.createdBy || "—"}
            </div>
            <div className="text-xs text-gray-400">
              {info.row.original.createdByRole || ""}
            </div>
          </div>),
        },
        {
            id: "action",
            width: "120px",
            minWidth: "120px",
            maxWidth: "120px",
            header: () => "Actions",
            cell: (info) => {
                const asset = info.row.original;
                return (<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onNavigate?.(`/system-hardware/asset-detail/${asset.id}`)}
                className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
                title="View"
              >
                <Eye size={15}/>
              </button>
              <button
                onClick={() => onEdit(asset)}
                className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
                title="Edit"
              >
                <Edit2 size={15}/>
              </button>
              <button
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Archive"
              >
                <Archive size={15}/>
              </button>
            </div>);
            },
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdit, onNavigate]);
    return (<div>
      <TableCustom
        columns={columns}
        data={rows}
        autoScrollTable={true}
        classThead="bg-red-50/70"
        classTheadTh="text-brand-primary text-xs font-semibold"
      />
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={data.length} setCurrentPage={onPageChange}/>
    </div>);
}

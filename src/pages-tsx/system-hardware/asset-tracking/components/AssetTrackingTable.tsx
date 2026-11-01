import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { PER_PAGE } from "../constants";
import type { Asset } from "../types";

interface AssetRow extends Asset {
  _idx: number;
}

interface AssetTrackingTableProps {
  data: Asset[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

/** Figma `Asset Tracking - Tabs - Asset List` (5160:183730) shows five states. */
const STATUS_TONE: Record<string, BadgeTone> = {
  "Available": "success",
  "Maintenance": "danger",
  "No RFID": "neutral",
  "Issued": "purple",
  "Pending Return": "warning",
};

export function AssetTrackingTable({ data, currentPage, onPageChange }: AssetTrackingTableProps) {

  const rows: AssetRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((asset, idx) => ({
          ...asset,
          _idx: (currentPage - 1) * PER_PAGE + idx + 1,
        })),
    [currentPage, data]
  );

  const columns = useMemo<ColumnDef<AssetRow, any>[]>(
    () => [
      {
        id: "no",
        header: () => "No",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original._idx}</div>
        ),
      },
      {
        id: "name",
        header: () => "Asset",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.name}</div>
        ),
      },
      {
        id: "serialNumber",
        header: () => "Asset Serial Number",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.serialNumber}</div>
        ),
      },
      {
        id: "assetType",
        header: () => "Asset Type",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.assetType}</div>
        ),
      },
      {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.assetCategory}</div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => (
          <StatusBadge tone={STATUS_TONE[row.original.status] ?? "neutral"}>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors" title="View detail"><Eye size={16} /></button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <TableCustom
        columns={columns}
        data={rows}
        autoScrollTable={true}
      />
      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={data.length}
        setCurrentPage={onPageChange}
      />
    </div>
  );
}

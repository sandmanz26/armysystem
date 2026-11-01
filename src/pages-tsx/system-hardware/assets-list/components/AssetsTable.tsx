import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import type { Asset } from "@/data/systemHardware";
import { type ColumnDef } from "@tanstack/react-table";
import { Archive, ArchiveRestore, Edit2, Eye } from "lucide-react";
import { useMemo } from "react";
import { PER_PAGE } from "../constants";
import { AssetStatusBadge } from "./AssetStatusBadge";

interface AssetsTableProps {
  data: Asset[];
  /**
   * Figma keeps two versions of this table: `List` shows **Issued Date**,
   * `List - Archived` (`5943:14704`) shows **Archived Date** in the same slot.
   * The Actions column differs too — the archived fixed column
   * (`Table - Fixed Column - Asset List Archived`) is 104 wide, not 128,
   * because it only has Eye + `archive-restore`, no Edit.
   */
  archived?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (asset: Asset) => void;
  onArchive: (asset: Asset) => void;
  onRestore: (asset: Asset) => void;
  onNavigate?: (path: string) => void;
}

interface AssetRow extends Asset {
  _idx: number;
}

export function AssetsTable({
  data,
  archived = false,
  currentPage,
  onPageChange,
  onEdit,
  onArchive,
  onRestore,
  onNavigate,
}: AssetsTableProps) {

  const rows: AssetRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((asset, idx) => ({
          ...asset,
          _idx: (currentPage - 1) * PER_PAGE + idx + 1,
        })),
    [currentPage, data],
  );



  const columns = useMemo<ColumnDef<AssetRow, any>[]>(
    () => [
      {
        id: "no",
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        header: () => "No.",
        cell: (info: any) => (
          <div className="text-sm text-default">{info.row.original._idx}</div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: () => "Asset",
        cell: (info: any) => (
          <div className="text-sm text-default font-medium">
            {info.row.original.name}
          </div>
        ),
      },
      {
        id: "serialNumber",
        accessorKey: "serialNumber",
        header: () => "Asset Serial Number",
        cell: (info: any) => (
          <div className="text-sm text-default">
            {info.row.original.serialNumber}
          </div>
        ),
      },
      {
        id: "assetType",
        header: () => "Asset Type",
        cell: (info: any) => (
          <div className="text-sm text-default">
            {info.row.original.assetType}
          </div>
        ),
      },
      {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: (info: any) => (
          <div className="text-sm text-default">
            {info.row.original.assetCategory}
          </div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: (info: any) => (
          <AssetStatusBadge status={info.row.original.status} />
        ),
      },
      {
        id: "issuedDate",
        accessorKey: archived ? "archivedDate" : "issuedDate",
        header: () => (archived ? "Archived Date" : "Issued Date"),
        cell: (info: any) => (
          <div className="text-sm text-default">
            {archived ? (info.row.original.archivedDate ?? "\u2014") : info.row.original.issuedDate}
          </div>
        ),
      },
      {
        id: "createdBy",
        header: () => "Created by",
        cell: (info: any) => (
          <div>
            <div className="text-sm text-default font-medium">
              {info.row.original.createdBy || "—"}
            </div>
            <div className="text-xs text-disabled">
              {info.row.original.createdByRole || ""}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: () => "Actions",
        cell: (info: any) => {
          const asset = info.row.original as AssetRow;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate?.(`/system-hardware/asset-detail/${asset.id}`)}
                className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
                title="View detail"
              >
                <Eye size={15} />
              </button>
              {archived ? (
                <button
                  onClick={() => onRestore(asset)}
                  className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
                  title="Restore"
                >
                  <ArchiveRestore size={15} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(asset)}
                    className="p-1.5 rounded-md text-disabled hover:text-primary hover:bg-danger-invert-soft transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => onArchive(asset)}
                    className="p-1.5 rounded-md text-disabled hover:text-danger hover:bg-danger-invert-soft transition-colors"
                    title="Archive"
                  >
                    <Archive size={15} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdit, onArchive, onRestore, onNavigate, archived],
  );

  return (
    <div>
      <TableCustom columns={columns} data={rows} autoScrollTable={true} />
      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={data.length}
        setCurrentPage={onPageChange}
      />
    </div>
  );
}

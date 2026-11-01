import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { SortIcon, type SortDir } from "@/lib/sortUtils";
import { PER_PAGE } from "../constants";
import type { AssetTypeData, AssetTypeRow } from "../types";

interface AssetTypeTableProps {
  data: AssetTypeData[];
  currentPage: number;
  sortField: string;
  sortDir: SortDir;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  onEdit: (item: AssetTypeData) => void;
  onDelete: (item: AssetTypeData) => void;
}

/** Figma stores "date\ntime" in one field; the design shows them on two lines. */
function TwoLine({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-default">{primary}</span>
      {secondary && <span className="text-xs text-body">{secondary}</span>}
    </div>
  );
}

/** Status pill — Figma Badge: radius full, 2/8 padding, 12px Medium. */

export function AssetTypeTable({
  data,
  currentPage,
  sortField,
  sortDir,
  onPageChange,
  onSort,
  onEdit,
  onDelete,
}: AssetTypeTableProps) {
  const rows: AssetTypeRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((item, idx) => ({ ...item, _idx: (currentPage - 1) * PER_PAGE + idx + 1 })),
    [currentPage, data],
  );

  const columns = useMemo<ColumnDef<AssetTypeRow, any>[]>(
    () => [
      {
        id: "no",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        header: () => "No.",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original._idx}</span>,
      },
      {
        id: "assetType",
        accessorKey: "assetType",
        header: () => (
          <button
            onClick={() => onSort("assetType")}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            Asset Type <SortIcon active={sortField === "assetType"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.assetType}</span>,
      },
      {
        id: "assetCategory",
        header: () => "Asset Category",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.assetCategory}</span>,
      },
      {
        id: "code",
        header: () => "Code",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original.code}</span>,
      },
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => <StatusBadge tone={row.original.status === "Active" ? "success" : "danger"}>{row.original.status}</StatusBadge>,
      },
      {
        id: "lastUpdatedOn",
        accessorKey: "lastUpdatedOn",
        header: () => (
          <button
            onClick={() => onSort("lastUpdatedOn")}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            Last Updated on <SortIcon active={sortField === "lastUpdatedOn"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.lastUpdatedOn).split("\n");
          return <TwoLine primary={date} secondary={time} />;
        },
      },
      {
        id: "createdBy",
        header: () => "Created by",
        cell: ({ row }: any) => (
          <TwoLine primary={row.original.createdBy} secondary={row.original.createdByRole} />
        ),
      },
      {
        id: "actions",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        header: () => "Actions",
        // Figma draws an eye here, but the PO confirmed on 18 Sep 2026 that a
        // view action is not wanted: Edit and Delete only.
        cell: ({ row }: any) => (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(row.original)}
              aria-label="Edit"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-primary hover:bg-primary-invert-soft transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(row.original)}
              aria-label="Delete"
              className="w-7 h-7 flex items-center justify-center rounded text-caption hover:text-danger hover:bg-primary-invert-soft transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortDir, onEdit, onDelete],
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

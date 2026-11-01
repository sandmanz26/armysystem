import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { PER_PAGE } from "../constants";
import type { MasterDataItem, MasterDataRow } from "../types";

interface MasterDataTableProps {
  data: MasterDataItem[];
  currentPage: number;
  selected: Set<string>;
  nameLabel: string;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (item: MasterDataItem) => void;
  onDelete: (id: string) => void;
}

export function MasterDataTable({
  data,
  currentPage,
  selected,
  nameLabel,
  onPageChange,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
}: MasterDataTableProps) {
  const rows: MasterDataRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((item, idx) => ({
          ...item,
          _idx: (currentPage - 1) * PER_PAGE + idx + 1,
        })),
    [currentPage, data]
  );

  const allPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const somePageSelected = rows.some((r) => selected.has(r.id)) && !allPageSelected;

  const columns = useMemo<ColumnDef<MasterDataRow, any>[]>(
    () => [
      {
        id: "select",
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        header: () => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={onToggleAll}
              size={16}
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected.has(row.original.id)}
              onChange={() => onToggleSelect(row.original.id)}
              size={16}
            />
          </div>
        ),
      },
      {
        id: "no",
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        header: () => "No",
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-700">{row.original._idx}</div>
        ),
      },
      {
        id: "name",
        header: () => nameLabel,
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-800 font-medium">{row.original.name}</div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5",
              row.original.status === "Active"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "createdBy",
        header: () => "Created By",
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-800">{row.original.createdBy}</div>
        ),
      },
      {
        id: "createdOn",
        header: () => "Created On",
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-700 whitespace-pre-line">{row.original.createdOn}</div>
        ),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
              title="Edit"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allPageSelected, somePageSelected, selected, nameLabel, onEdit, onDelete]
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

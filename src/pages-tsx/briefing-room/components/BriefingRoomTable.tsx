import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { SortIcon, type SortDir } from "@/lib/sortUtils";
import { PER_PAGE } from "../constants";
import type { BriefingRoom, BriefingRoomRow } from "../types";

interface BriefingRoomTableProps {
  data: BriefingRoom[];
  currentPage: number;
  selected: Set<string>;
  sortField: string;
  sortDir: SortDir;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (item: BriefingRoom) => void;
  onDelete: (id: string) => void;
}

export function BriefingRoomTable({
  data,
  currentPage,
  selected,
  sortField,
  sortDir,
  onPageChange,
  onSort,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
}: BriefingRoomTableProps) {

  const rows: BriefingRoomRow[] = useMemo(
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

  const columns = useMemo<ColumnDef<BriefingRoomRow, any>[]>(
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
          <div className="text-sm text-gray-500">{row.original._idx}</div>
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: () => (
          <button
            onClick={() => onSort("name")}
            className="flex items-center gap-1 font-semibold text-sm hover:text-brand-primary-hover transition-colors"
          >
            Name <SortIcon active={sortField === "name"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => (
          <div className="text-sm text-default font-medium">{row.original.name}</div>
        ),
      },
      {
        id: "additionalInfo",
        header: () => "Additional Info",
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.additionalInfo || "—"}</div>
        ),
      },
      {
        id: "level",
        accessorKey: "level",
        header: () => (
          <button
            onClick={() => onSort("level")}
            className="flex items-center gap-1 font-semibold text-sm hover:text-brand-primary-hover transition-colors"
          >
            Level <SortIcon active={sortField === "level"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => (
          <div className="text-sm text-default">Level {row.original.level}</div>
        ),
      },
      {
        id: "capacity",
        accessorKey: "capacity",
        header: () => (
          <button
            onClick={() => onSort("capacity")}
            className="flex items-center gap-1 font-semibold text-sm hover:text-brand-primary-hover transition-colors"
          >
            Capacity <SortIcon active={sortField === "capacity"} dir={sortDir} />
          </button>
        ),
        cell: ({ row }: any) => (
          <div className="text-sm text-default">{row.original.capacity} pax</div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: ({ row }: any) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-0.5",
              row.original.status === "Available"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-red-100 text-red-700 border-red-200"
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
          <div>
            <div className="text-sm text-default">{row.original.createdBy}</div>
            <div className="text-xs text-gray-500">{row.original.createdByRole}</div>
          </div>
        ),
      },
      {
        id: "createdAt",
        header: () => "Created At",
        cell: ({ row }: any) => (
          <div className="text-sm text-default whitespace-pre-line">{row.original.createdAt}</div>
        ),
      },
      {
        id: "lastUpdatedAt",
        header: () => "Last Updated At",
        cell: ({ row }: any) => (
          <div className="text-sm text-default whitespace-pre-line">{row.original.lastUpdatedAt}</div>
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
    [allPageSelected, somePageSelected, selected, sortField, sortDir, onEdit, onDelete]
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

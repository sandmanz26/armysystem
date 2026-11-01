import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { InputCustom } from "@/components/input";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import type { RoomEntry } from "../types";

const columnHelper = createColumnHelper<RoomEntry>();

const PER = 10;

interface RoomTableProps {
  title: string;
  addLabel: string;
  rows: RoomEntry[];
}

export function RoomTable({ title, addLabel, rows }: RoomTableProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * PER, currentPage * PER);
  const allSel = paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const someSel = paginated.some((r) => selected.has(r.id));

  const toggleAll = () => setSelected(allSel ? new Set() : new Set(paginated.map((r) => r.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const columns: ColumnDef<RoomEntry, any>[] = [
    columnHelper.display({
      id: "no",
      header: () => "No",
      cell: ({ row }) => {
        const idx = paginated.findIndex((r) => r.id === row.original.id);
        return (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selected.has(row.original.id)}
              onChange={() => toggleOne(row.original.id)}
              size={16}
            />
            <span className="text-body">{(currentPage - 1) * PER + idx + 1}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("name", {
      header: () => "Name",
      cell: (info) => <span className="font-medium text-default">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: () => "Status",
      cell: (info) => (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          info.getValue() === "Active"
            ? "bg-success-invert-soft text-success"
            : "bg-default-default text-body"
        )}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("description", {
      header: () => "Description",
      cell: (info) => <span className="text-body">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-caption hover:text-primary hover:bg-primary-invert-soft rounded transition-colors">
            <Pencil size={14} />
          </button>
          <button className="p-1.5 text-caption hover:text-danger hover:bg-danger-invert-soft rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-default">
          {title} <span className="text-caption font-normal">({rows.length} Rooms)</span>
        </h2>
        <Button className="flex items-center gap-1.5 px-4 py-2 bg-primary-default hover:bg-primary-hovered text-invert-default text-sm font-semibold rounded-lg transition-colors">
          <Plus size={15} /> {addLabel}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption z-10" />
        <InputCustom
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-8 pr-3 py-1.5 text-sm border border-invert-default rounded-md w-56 focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Select All + Delete toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="flex items-center gap-2 text-sm text-body cursor-pointer select-none">
          <Checkbox
            checked={allSel}
            indeterminate={someSel && !allSel}
            onChange={toggleAll}
            size={16}
          />
          Select All
        </label>
        <button
          disabled={selected.size === 0}
          onClick={() => setSelected(new Set())}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-colors",
            selected.size > 0
              ? "text-danger hover:opacity-80"
              : "text-disabled cursor-not-allowed"
          )}
        >
          <Trash2 size={14} /> Delete{selected.size > 0 ? ` (${selected.size})` : ""}
        </button>
      </div>

      {/* Table */}
      <div className="border border-invert-default rounded-lg overflow-hidden">
        <TableCustom columns={columns} data={paginated} autoScrollTable={true} />
        <Pagination
          currentPage={currentPage}
          itemsPerPage={PER}
          totalItems={filtered.length}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

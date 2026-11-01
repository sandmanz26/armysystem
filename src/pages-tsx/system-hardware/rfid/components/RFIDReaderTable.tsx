import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Toggle } from "@/components/toggle";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { SortIcon, type SortDir } from "@/lib/sortUtils";
import { PER_PAGE } from "../constants";
import type { RFIDReader } from "../types";

interface RFIDReaderTableProps {
  data: RFIDReader[];
  currentPage: number;
  totalItems: number;
  selected: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  sortField: string;
  sortDir: SortDir;
  onSort: (field: string) => void;
  onToggleAll: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (reader: RFIDReader) => void;
  onDelete: (ids: Set<string>) => void;
  onPageChange: (page: number) => void;
  /** Figma `Action - Set Alarm On` / `Set Alarm Off` — a per-row toggle in
   *  its own "Alarm" column (between Serial Number and IP Address), always
   *  visible, not gated behind row selection or a menu. */
  onAlarm?: (reader: RFIDReader, on: boolean) => void;
}

interface RFIDReaderRow extends RFIDReader {
  _idx: number;
}

export function RFIDReaderTable({
  data,
  currentPage,
  totalItems,
  selected,
  allSelected,
  someSelected,
  sortField,
  sortDir,
  onSort,
  onToggleAll,
  onToggleSelect,
  onEdit,
  onDelete,
  onPageChange,
  onAlarm,
}: RFIDReaderTableProps) {

  const rows: RFIDReaderRow[] = useMemo(
    () =>
      data.map((reader, idx) => ({
        ...reader,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
      })),
    [data, currentPage],
  );

  const columns = useMemo<ColumnDef<RFIDReaderRow, any>[]>(
    () => [
      {
        id: "select",
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        header: () => (
          <Checkbox
            id="select-all"
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={() => onToggleAll()}
            size={16}
          />
        ),
        cell: (info) => (
          <Checkbox
            id={`select-${info.row.original.id}`}
            checked={selected.has(info.row.original.id)}
            onChange={() => onToggleSelect(info.row.original.id)}
            size={16}
          />
        ),
      },
      {
        id: "no",
        width: 60,
        minWidth: 60,
        maxWidth: 60,
        header: () => "No",
        cell: (info) => (
          <div className="text-sm text-default">{info.row.original._idx}</div>
        ),
      },
      {
        id: "displayName",
        accessorKey: "displayName",
        header: () => (
          <button
            onClick={() => onSort("displayName")}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Display Name <SortIcon active={sortField === "displayName"} dir={sortDir} />
          </button>
        ),
        cell: (info) => (
          <div className="text-sm text-default font-medium">{info.row.original.displayName}</div>
        ),
      },
      {
        id: "macAddress",
        header: () => "Reader MAC Address",
        cell: (info) => (
          <div className="text-sm text-body font-mono">{info.row.original.macAddress}</div>
        ),
      },
      {
        id: "status",
        header: () => "Status",
        cell: (info) => {
          const status = info.row.original.status;
          return (
            <span
              className={cn(
                // Figma `Badge`: Active on background/success/invert/default +
                // border/invert/success + text/success; Inactive on the NEUTRAL
                // background/default/default, not an orange one.
                "inline-flex items-center rounded-full border text-xs font-medium px-2 py-0.5",
                status === "Active"
                  ? "bg-success-invert-default text-success border-invert-success"
                  : "bg-default-default text-default border-invert-default",
              )}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "serialNumber",
        header: () => "Serial Number",
        cell: (info) => (
          <div className="text-sm text-body font-mono">{info.row.original.serialNumber}</div>
        ),
      },
      {
        id: "alarm",
        header: () => "Alarm",
        cell: (info) => {
          const reader = info.row.original;
          return (
            <Toggle
              checked={reader.armStatus === "Arm"}
              onChange={(next) => onAlarm?.(reader, next)}
            />
          );
        },
      },
      {
        id: "ipAddress",
        header: () => "IP Address",
        cell: (info) => (
          <div className="text-sm text-body font-mono">{info.row.original.ipAddress}</div>
        ),
      },
      {
        id: "lastUpdatedOn",
        header: () => "Last Updated on",
        // Figma renders this as two lines: the date, then the time beneath it.
        cell: (info) => {
          const [date, time] = String(info.row.original.lastUpdatedOn ?? "—").split("\n");
          return (
            <div>
              <div className="text-sm text-default">{date}</div>
              {time && <div className="text-xs text-body mt-0.5">{time}</div>}
            </div>
          );
        },
      },
      {
        id: "createdBy",
        header: () => "Created by",
        cell: (info) => (
          <div>
            <div className="text-sm text-default">{info.row.original.createdBy ?? "—"}</div>
            {info.row.original.createdByRole && (
              <div className="text-xs text-body mt-0.5">{info.row.original.createdByRole}</div>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: (info) => {
          const reader = info.row.original;
          // Figma's Actions cell (5162:186926): just pencil + trash — no
          // eye and no row menu. Alarm On/Off moved to its own inline
          // toggle column; a separate menu for it was never in Figma.
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(reader)}
                className="text-disabled hover:text-primary p-1 rounded hover:bg-danger-invert-soft transition-colors"
                title="Edit Reader"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(new Set([reader.id]))}
                className="text-disabled hover:text-danger p-1 rounded hover:bg-danger-invert-soft transition-colors"
                title="Delete Reader"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSelected, someSelected, selected, sortField, sortDir],
  );

  return (
    <div>
      <TableCustom columns={columns} data={rows} autoScrollTable={true} />
      <Pagination
        currentPage={currentPage}
        itemsPerPage={PER_PAGE}
        totalItems={totalItems}
        setCurrentPage={onPageChange}
      />
    </div>
  );
}

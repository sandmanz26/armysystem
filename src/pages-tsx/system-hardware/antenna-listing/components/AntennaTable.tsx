import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { TableCustom } from "@/components/table";
import { Checkbox } from "@/components/checkbox";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/status-badge";
import { PER_PAGE } from "../constants";
import type { AntennaEntry, AntennaRow } from "../types";

/*
 * Antenna listing table — Figma `Table - Antenna Listing - List`
 * (5167:211869 · `List - Full Table` 5167:211888).
 *
 * Columns and widths straight from the Figma header row:
 *   ☐ 58 · No 64 · Base Station 200 · RFID Reader 200 ·
 *   Antenna Port Number 200 · Antenna 240 · Antenna Key 200 · GPO 200 ·
 *   Status 200 · Created by 200 · Last Updated on 200 · Actions 120
 *
 * None of the Figma header cells carry a sort affordance, so this table has no
 * sortable column (the earlier prototype sorted "Antenna" — see CHANGES.md).
 */

interface AntennaTableProps {
  data: AntennaEntry[];
  currentPage: number;
  selected: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (item: AntennaEntry) => void;
  onDeleteRow: (item: AntennaEntry) => void;
}

function TwoLine({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-default">{primary}</span>
      {secondary && <span className="text-xs text-body">{secondary}</span>}
    </div>
  );
}

export function AntennaTable({
  data,
  currentPage,
  selected,
  allSelected,
  someSelected,
  onPageChange,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDeleteRow,
}: AntennaTableProps) {
  const rows: AntennaRow[] = useMemo(
    () =>
      data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((entry, idx) => ({ ...entry, _idx: (currentPage - 1) * PER_PAGE + idx + 1 })),
    [currentPage, data],
  );

  const text = (key: keyof AntennaEntry) => ({
    cell: ({ row }: any) => <span className="text-sm text-default">{row.original[key]}</span>,
  });

  const columns = useMemo<ColumnDef<AntennaRow, any>[]>(
    () => [
      {
        id: "select",
        width: 58,
        minWidth: 58,
        maxWidth: 58,
        header: () => (
          <div className="flex items-center">
            <Checkbox
              id="antenna-select-all"
              name="antenna-select-all"
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={onToggleAll}
              size={18}
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              id={`antenna-select-${row.original.id}`}
              name={`antenna-select-${row.original.id}`}
              checked={selected.has(row.original.id)}
              onChange={() => onToggleSelect(row.original.id)}
              size={18}
            />
          </div>
        ),
      },
      {
        id: "no",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        header: () => "No",
        cell: ({ row }: any) => <span className="text-sm text-default">{row.original._idx}</span>,
      },
      { id: "station", width: 200, header: () => "Base Station", ...text("station") },
      { id: "rfidReader", width: 200, header: () => "RFID Reader", ...text("rfidReader") },
      {
        id: "antennaPortNumber",
        width: 200,
        header: () => "Antenna Port Number",
        ...text("antennaPortNumber"),
      },
      { id: "antenna", width: 240, header: () => "Antenna", ...text("antenna") },
      { id: "antennaKey", width: 200, header: () => "Antenna Key", ...text("antennaKey") },
      { id: "gpo", width: 200, header: () => "GPO", ...text("gpo") },
      {
        id: "status",
        width: 200,
        header: () => "Status",
        cell: ({ row }: any) => (
          <StatusBadge tone={row.original.status === "Active" ? "success" : "danger"}>
            {row.original.status}
          </StatusBadge>
        ),
      },
      {
        id: "lastUpdatedOn",
        width: 200,
        header: () => "Last Updated on",
        cell: ({ row }: any) => {
          const [date, time] = String(row.original.lastUpdatedOn).split("\n");
          return <TwoLine primary={date} secondary={time} />;
        },
      },
      {
        id: "createdBy",
        width: 200,
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
              onClick={() => onDeleteRow(row.original)}
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
    [allSelected, someSelected, selected, onEdit, onDeleteRow],
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

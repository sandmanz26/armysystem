import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Icon } from "@/components/icon";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import type { ActivityRow } from "../types";
import { PER_PAGE } from "../constants";

/**
 * Figma `Table - User Mgmt - User Details - Activities` (5014:9360 / 5014:9392):
 * No. 64 · Action 240 · Module 120 (sortable) · Date 160 (sortable, date over
 * time) · Description (fills the rest). Header cells 20/12 padding, body 14
 * Regular text/default, No. in text/body. `Pagination` below, inside the card.
 */
function col(width: number) {
  return { width, minWidth: width, maxWidth: width } as const;
}

/** Figma `Table - Header Cell` state "Text with Sort": label + 14px `arrow-up-down` (text/body). */
function SortLabel({ label, sorted }: { label: string; sorted: boolean }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      {!sorted && <Icon name="arrow-up-down" size={14} className="text-body" />}
    </span>
  );
}

export function ActivitiesTable({ rows }: { rows: ActivityRow[] }) {
  const [page, setPage] = useState(1);

  const columns = useMemo<ColumnDef<ActivityRow, any>[]>(
    () => [
      {
        accessorKey: "no",
        ...col(64),
        header: () => "No.",
        cell: (info) => <span className="text-sm text-body">{info.getValue()}</span>,
        enableSorting: false,
      },
      {
        // Not `accessorKey: "action"` — TableCustom treats an "action(s)" column as the
        // sticky row-actions column (centred, shadowed).
        id: "activityAction",
        accessorFn: (r) => r.action,
        ...col(240),
        header: () => "Action",
        cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
        enableSorting: false,
      },
      {
        accessorKey: "module",
        ...col(120),
        header: ({ column }) => <SortLabel label="Module" sorted={!!column.getIsSorted()} />,
        cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
      },
      {
        id: "date",
        accessorFn: (r) => r.ts,
        ...col(160),
        header: ({ column }) => <SortLabel label="Date" sorted={!!column.getIsSorted()} />,
        cell: ({ row }) => (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-sm text-default">{row.original.date}</span>
            <span className="text-xs text-body">{row.original.time}</span>
          </div>
        ),
      },
      {
        accessorKey: "desc",
        width: 512,
        minWidth: 320,
        header: () => "Description",
        cell: (info) => <span className="text-sm text-default">{info.getValue()}</span>,
        enableSorting: false,
      },
    ],
    [],
  );

  const paginated = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <TableCustom<ActivityRow> columns={columns} data={paginated} autoScrollTable={true} />
      <Pagination
        currentPage={page}
        itemsPerPage={PER_PAGE}
        totalItems={rows.length}
        setCurrentPage={setPage}
      />
    </>
  );
}

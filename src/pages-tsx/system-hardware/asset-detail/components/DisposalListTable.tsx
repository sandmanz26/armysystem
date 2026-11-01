import { useMemo } from "react";
import { Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";

export interface DisposalRow {
  id: string;
  rfidTagId: string;
  rfidUniqueId: string;
  disposedDate: string;
}

export function DisposalListTable({ data }: { data: DisposalRow[] }) {
  const columns = useMemo<ColumnDef<DisposalRow, any>[]>(() => [
    {
      id: "no",
      header: () => "No",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.index + 1}</span>,
      width: "56px", minWidth: "56px", maxWidth: "56px",
    } as any,
    {
      accessorKey: "rfidTagId",
      header: () => "RFID Tag ID",
      cell: ({ getValue }: any) => <span className="text-sm text-default font-medium">{getValue()}</span>,
    },
    {
      accessorKey: "rfidUniqueId",
      header: () => "RFID Unique ID",
      cell: ({ getValue }: any) => <span className="text-sm text-default">{getValue()}</span>,
    },
    {
      accessorKey: "disposedDate",
      header: () => "Disposed Date",
      cell: ({ getValue }: any) => <span className="text-sm text-default">{getValue()}</span>,
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: () => (
        <button type="button" className="p-1.5 rounded-lg text-disabled hover:text-primary hover:bg-default-default transition-colors">
          <Eye size={15} />
        </button>
      ),
      width: "80px", minWidth: "80px", maxWidth: "80px",
    } as any,
  ], []);

  return <TableCustom<DisposalRow> columns={columns} data={data} autoScrollTable={true} />;
}

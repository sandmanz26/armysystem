import { useMemo } from "react";
import { Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";

export interface ActivityRow {
  id: string;
  issuedReason: string;
  assignmentId: string;
  status: "Issued" | "Returned" | "Overdue";
  issuedDate: string;
  returnedDate: string;
}

const STATUS_STYLES: Record<ActivityRow["status"], string> = {
  Issued: "bg-info-invert-default text-info border-invert-info",
  Returned: "bg-success-invert-default text-success border-invert-success",
  Overdue: "bg-danger-invert-default text-danger border-invert-danger",
};

export function ActivitiesTable({ data }: { data: ActivityRow[] }) {
  const columns = useMemo<ColumnDef<ActivityRow, any>[]>(() => [
    {
      id: "no",
      header: () => "No",
      cell: ({ row }: any) => <span className="text-sm text-default">{row.index + 1}</span>,
      width: "56px", minWidth: "56px", maxWidth: "56px",
    } as any,
    {
      accessorKey: "issuedReason",
      header: () => "Issued Reason",
      cell: ({ getValue }: any) => <span className="text-sm text-default">{getValue()}</span>,
    },
    {
      accessorKey: "assignmentId",
      header: () => "Assignment ID",
      cell: ({ getValue }: any) => <span className="text-sm text-default font-mono">{getValue()}</span>,
    },
    {
      accessorKey: "status",
      header: () => "Status",
      cell: ({ getValue }: any) => (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", STATUS_STYLES[getValue() as ActivityRow["status"]])}>
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "issuedDate",
      header: () => "Issued Date",
      cell: ({ getValue }: any) => <span className="text-sm text-default">{getValue()}</span>,
    },
    {
      accessorKey: "returnedDate",
      header: () => "Returned Date",
      cell: ({ getValue }: any) => <span className="text-sm text-default">{getValue() || "—"}</span>,
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

  return <TableCustom<ActivityRow> columns={columns} data={data} autoScrollTable={true} />;
}

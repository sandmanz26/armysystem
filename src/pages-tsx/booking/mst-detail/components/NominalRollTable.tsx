import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/checkbox";

export interface NominalRollTableProps {
  trainees: any[];
  status: string;
  onEdit?: (trainee: any, index: number) => void;
  onDelete?: (index: number) => void;
}

export function NominalRollTable({ trainees, status, onEdit, onDelete }: NominalRollTableProps) {
  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    const cols: ColumnDef<any, any>[] = [
      {
        header: () => <span className="block text-center w-full">No</span>,
        accessorFn: (_, i) => i + 1,
        id: "no",
        compact: true,
        width: "32px",
        minWidth: "32px",
        maxWidth: "32px",
        cell: (info: any) => (
          <span className="block text-center w-full">{info.getValue()}</span>
        ),
      } as ColumnDef<any, any>,
      
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Weapon Type",
        accessorKey: "weaponType",
        cell: (info: any) => info.getValue() ?? "—",
      },
      {
        header: "Service ID",
        accessorKey: "svcId",
      },
      {
        header: "Last Updated",
        accessorKey: "lastUpdated",
        cell: () => "—",
      },
      {
        header: "Platoon Number",
        accessorKey: "platoon",
      },
    ];

    if (status !== "Overdue") {
      cols.push({
        header: "Actions",
        id: "action",
        cell: (info: any) => {
          const rowIndex = info.row.index;
          const trainee = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(trainee, rowIndex)}
                className="p-1.5 rounded-md text-gray-400 hover:text-brand-primary hover:bg-red-50 transition-colors"
                title="Edit trainee"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(rowIndex)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete trainee"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        },
      });
    }

    if (status === "Upcoming") {
      cols.unshift({
        header: () => (
          <span className="flex w-full justify-center">
            <Checkbox size={12} />
          </span>
        ),
        id: "selection",
        compact: true,
        width: "32px",
        minWidth: "32px",
        maxWidth: "32px",
        cell: () => (
          <span className="flex w-full justify-center">
            <Checkbox size={12} />
          </span>
        ),
      } as ColumnDef<any, any>);
    }

    return cols;
  }, [status, onEdit, onDelete]);

  return (
    <TableCustom
      data={trainees}
      columns={columns}
      autoScrollTable={true}
      tableFixed={true}
      classThead="bg-red-50/70"
      classTheadTh="text-brand-primary text-xs font-semibold"
    />
  );
}

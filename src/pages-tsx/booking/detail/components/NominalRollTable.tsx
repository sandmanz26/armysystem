import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/checkbox";

export interface NominalRollTableProps {
  trainees: any[];
  status: string;
  onEdit?: (trainee: any, index: number) => void;
  onDelete?: (index: number) => void;
  selected?: Set<number>;
  onToggleSelect?: (index: number) => void;
  onToggleSelectAll?: () => void;
}

export function NominalRollTable({ trainees, status, onEdit, onDelete, selected, onToggleSelect, onToggleSelectAll }: NominalRollTableProps) {
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
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(info.row.original, rowIndex)}
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
            <Checkbox
              size={12}
              checked={!!selected && trainees.length > 0 && selected.size === trainees.length}
              onChange={() => onToggleSelectAll?.()}
            />
          </span>
        ),
        id: "selection",
        compact: true,
        width: "32px",
        minWidth: "32px",
        maxWidth: "32px",
        cell: (info: any) => (
          <span className="flex w-full justify-center">
            <Checkbox
              size={12}
              checked={!!selected?.has(info.row.index)}
              onChange={() => onToggleSelect?.(info.row.index)}
            />
          </span>
        ),
      } as ColumnDef<any, any>);
    }

    return cols;
  }, [status, onEdit, onDelete, selected, onToggleSelect, onToggleSelectAll, trainees.length]);

  return (
    <TableCustom
      data={trainees}
      columns={columns}
      autoScrollTable={true}
      tableFixed={true}
      actionSticky={true}
      classThead="bg-red-50/70"
      classTheadTh="text-brand-primary text-xs font-semibold"
    />
  );
}

import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { type ColumnDef } from "@tanstack/react-table";

export interface LaneConfigTableProps {
  laneConfig: any[];
}

function LaneStatusPill({ status }: { status: string }) {
  if (status === "Closed") return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Closed</span>;
  if (status === "On")     return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">On</span>;
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">Off</span>;
}

export function LaneConfigTable({ laneConfig }: LaneConfigTableProps) {
  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      header: "Lane",
      accessorKey: "lane",
      compact: true,
      width: "62px",
      minWidth: "62px",
    } as any,
    {
      header: "Weapon",
      accessorKey: "weapon",
      compact: true,
      width: "72px",
      minWidth: "72px",
    } as any,
    {
      header: "Status",
      accessorKey: "status",
      compact: true,
      width: "60px",
      minWidth: "60px",
      cell: (info: any) => <LaneStatusPill status={info.getValue()} />,
    } as any,
  ], []);

  return (
    <TableCustom
      data={laneConfig}
      columns={columns}
      autoScrollTable={true}
      tableFixed={true}
      classTheadTh="py-2 px-1.5 text-[11px] overflow-hidden text-ellipsis"
      classTBodyTd="h-9 py-1.5 px-1.5 overflow-hidden text-ellipsis"
    />
  );
}

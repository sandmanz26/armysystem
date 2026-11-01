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
    },
    {
      header: "Weapon Type",
      accessorKey: "weapon",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => <LaneStatusPill status={info.getValue()} />,
    },
  ], []);

  return <TableCustom data={laneConfig} columns={columns} autoScrollTable={false} />;
}

import { useMemo } from "react";
import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { RfidStatusPill } from "./RfidStatusPill";
import type { Asset } from "@/data/systemHardware";

interface RfidRow {
  name: string;
  value: ReactNode;
  lastCheckedOn: ReactNode;
}

interface RfidTableProps {
  asset: Asset;
  activeRfid: 1 | 2;
}

// "Last Checked On" reflects the RFID tag as a whole (not each individual
// field), so it's only shown once — stacked date/time on the first row —
// and left blank for the rest.
function LastCheckedOnCell({ createdDate }: { createdDate?: string }) {
  const match = createdDate?.match(/^(.*\d{4})\s+(.+)$/);
  const [datePart, timePart] = match ? [match[1], match[2]] : ["—", "—"];
  return (
    <div className="text-sm text-body whitespace-nowrap">
      {datePart}
      <br />
      <span className="text-xs text-disabled">{timePart}</span>
    </div>
  );
}

export function RfidTable({ asset, activeRfid }: RfidTableProps) {
  const tagId = activeRfid === 1 ? asset.rfidTag1Id : asset.rfidTag2Id;
  const tagStatus = activeRfid === 1 ? asset.rfidTag1Status : asset.rfidTag2Status;
  const hasTag = !!tagId && tagId !== "—";

  const rows: RfidRow[] = useMemo(() => {
    if (!hasTag) return [];
    return [
      {
        name: "RFID Tag ID",
        value: <span className="text-sm text-default font-medium">{tagId || "—"}</span>,
        lastCheckedOn: <LastCheckedOnCell createdDate={asset.createdDate} />,
      },
      {
        name: "RFID Unique ID",
        value: <span className="text-sm text-default font-medium">{asset.rfidUniqueId || "—"}</span>,
        lastCheckedOn: null,
      },
      {
        name: "RFID Status",
        value: <RfidStatusPill status={tagStatus || "No RFID"} />,
        lastCheckedOn: null,
      },
      {
        name: "Location",
        value: <span className="text-sm text-default">{asset.rfidLocation || "Operator Room"}</span>,
        lastCheckedOn: null,
      },
    ];
  }, [asset, hasTag, tagId, tagStatus]);

  const columns = useMemo<ColumnDef<RfidRow, any>[]>(
    () => [
      {
        id: "name",
        header: () => "Name",
        cell: (info) => (
          <div className="text-sm text-caption">{info.row.original.name}</div>
        ),
      },
      {
        id: "value",
        header: () => "Value",
        cell: (info) => <div>{info.row.original.value}</div>,
      },
      {
        id: "lastCheckedOn",
        header: () => "Last Checked On",
        cell: (info) => info.row.original.lastCheckedOn,
      },
    ],
    []
  );

  if (!hasTag) {
    return (
      <div className="py-10 text-center text-sm text-disabled">
        No RFID Tag {activeRfid} assigned to this asset
      </div>
    );
  }

  return <TableCustom columns={columns} data={rows} autoScrollTable={false} />;
}

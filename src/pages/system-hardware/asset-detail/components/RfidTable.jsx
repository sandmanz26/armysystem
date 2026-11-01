import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { RfidStatusPill } from "./RfidStatusPill";
export function RfidTable({ asset, activeRfid }) {
    const rows = useMemo(() => {
        if (activeRfid === 1) {
            return [
                {
                    name: "RFID Tag ID",
                    value: <span className="text-sm text-gray-800 font-medium">{asset.rfidTag1Id || "—"}</span>,
                    lastCheckedOn: "—",
                },
                {
                    name: "RFID Unique ID",
                    value: <span className="text-sm text-gray-800 font-medium">{asset.rfidUniqueId || "—"}</span>,
                    lastCheckedOn: "—",
                },
                {
                    name: "RFID Status",
                    value: <RfidStatusPill status={asset.rfidTag1Status || "No RFID"}/>,
                    lastCheckedOn: "—",
                },
                {
                    name: "Location",
                    value: <span className="text-sm text-gray-700">{asset.rfidLocation || "Operator Room"}</span>,
                    lastCheckedOn: "—",
                },
            ];
        }
        return [];
    }, [asset, activeRfid]);
    const columns = useMemo(() => [
        {
            id: "name",
            header: () => "Name",
            cell: (info) => (<div className="text-sm text-gray-600">{info.row.original.name}</div>),
        },
        {
            id: "value",
            header: () => "Value",
            cell: (info) => <div>{info.row.original.value}</div>,
        },
        {
            id: "lastCheckedOn",
            header: () => "Last Checked On",
            cell: (info) => (<div className="text-sm text-gray-400">{info.row.original.lastCheckedOn}</div>),
        },
    ], []);
    if (activeRfid === 2) {
        return (<div className="py-10 text-center text-sm text-gray-400">
        No RFID Tag 2 assigned to this asset
      </div>);
    }
    return <TableCustom columns={columns} data={rows} autoScrollTable={false}/>;
}

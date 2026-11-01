import { useMemo } from "react";
import { TableCustom } from "@/components/table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
export function NominalRollTable({ trainees, status, onDelete }) {
    const columns = useMemo(() => {
        const cols = [
            {
                header: "No",
                accessorFn: (_, i) => i + 1,
                id: "no",
                compact: true,
                width: "32px",
                minWidth: "32px",
                maxWidth: "32px",
            },
            {
                header: "Rank",
                accessorKey: "rank",
            },
            {
                header: "Name",
                accessorKey: "name",
            },
            {
                header: "Weapon Type",
                accessorKey: "weaponType",
                cell: (info) => info.getValue() ?? "—",
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
                                cell: (info) => (<div className="flex items-center gap-1">
                        <Button className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-brand-primary hover:bg-red-50">
                            <Pencil size={14}/>
                        </Button>
                        {status === "Upcoming" && (<Button onClick={() => onDelete?.(info.row.index)} className="p-1.5 w-auto bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-50">
                                <Trash2 size={14}/>
                            </Button>)}
                    </div>),
            });
        }
        if (status === "Upcoming") {
            cols.unshift({
                                header: () => (<span className="flex w-full justify-center">
                        <Checkbox size={12}/>
                    </span>),
                id: "selection",
                                compact: true,
                                width: "32px",
                                minWidth: "32px",
                                maxWidth: "32px",
                                cell: () => (<span className="flex w-full justify-center">
                        <Checkbox size={12}/>
                    </span>),
            });
        }
        return cols;
    }, [status, onDelete]);
    return <TableCustom data={trainees} columns={columns} autoScrollTable={true}/>;
}

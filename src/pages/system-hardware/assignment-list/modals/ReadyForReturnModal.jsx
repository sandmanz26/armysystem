import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Checkbox } from "@/components/checkbox";
import { Button } from "@/components/button";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { AssignmentStatusBadge } from "../components/AssignmentStatusBadge";
export function ReadyForReturnModal({ candidates, onClose }) {
    const [selected, setSelected] = useState(new Set());
    const allSelected = candidates.length > 0 && selected.size === candidates.length;
    const someSelected = selected.size > 0 && selected.size < candidates.length;
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(candidates.map((a) => a.id)));
    const toggleOne = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const rows = candidates.map((a, idx) => ({ ...a, _idx: idx + 1 }));
    const columns = [
        {
            id: "select",
            header: () => (<Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} size={16}/>),
            cell: ({ row }) => (<div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected.has(row.original.id)} onChange={() => toggleOne(row.original.id)} size={16}/>
        </div>),
        },
        {
            id: "no",
            header: () => "No",
            cell: ({ row }) => <div className="text-sm text-gray-600">{row.original._idx}</div>,
        },
        {
            id: "assignmentId",
            header: () => "Assignment ID",
            cell: ({ row }) => (<div className="text-sm font-semibold text-gray-800">{row.original.assignmentId}</div>),
        },
        {
            id: "assignmentType",
            header: () => "Assignment Type",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.assignmentType}</div>),
        },
        {
            id: "bookings",
            header: () => "Booking(s)",
            cell: ({ row }) => {
                const count = row.original.bookings.length;
                return (<div className="text-sm text-gray-700">
            {count} Booking{count !== 1 ? "s" : ""}
          </div>);
            },
        },
        {
            id: "status",
            header: () => "Assignment status",
            cell: ({ row }) => <AssignmentStatusBadge status={row.original.status}/>,
        },
        {
            id: "baseStations",
            header: () => "Base Station(s)",
            cell: ({ row }) => (<div className="text-sm text-gray-700">{row.original.baseStations.join(", ")}</div>),
        },
        {
            id: "assetQty",
            header: () => "Asset Qty",
            cell: ({ row }) => {
                const qty = row.original.assetQty;
                return (<div className="text-sm text-gray-700">
            {qty} Asset{qty !== 1 ? "s" : ""}
          </div>);
            },
        },
    ];
    return (<Modal open={true} onClose={onClose} width={900} isUseX={false}>
      {/* Header */}
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100 -mt-2">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={28} className="text-green-500" strokeWidth={1.8}/>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 leading-tight">
            Select Assignment For Ready To Return
          </h2>
          <p className="text-sm text-gray-500 mt-1">Please select at least one assignment</p>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[50vh] overflow-auto mt-4">
        <TableCustom columns={columns} data={rows} autoScrollTable={true}/>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-100">
        <Pagination currentPage={1} itemsPerPage={10} totalItems={candidates.length} setCurrentPage={() => { }}/>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
        <Button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-brand-primary bg-red-50 border border-red-100 hover:bg-red-100">
          Cancel
        </Button>
        <Button disabled={selected.size === 0} className="flex-1 py-3 text-sm font-semibold bg-brand-primary hover:bg-brand-primary-hover text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
          Confirm
        </Button>
      </div>
    </Modal>);
}

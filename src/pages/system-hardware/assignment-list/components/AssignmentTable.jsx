import { useMemo } from "react";
import { Eye, PackageCheck, ArrowRightToLine, MoreVertical } from "lucide-react";
import Dropdown from "@/components/dropdown";
import { TableCustom } from "@/components/table";
import { Pagination } from "@/components/ui/Pagination";
import { AssignmentStatusBadge } from "./AssignmentStatusBadge";
import { BookingSubTable } from "./BookingSubTable";
import { PER_PAGE } from "../constants";
export function AssignmentTable({ data, currentPage, onPageChange, onNavigate }) {
    const totalPages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const rows = useMemo(() => data
        .slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
        .map((asgn, idx) => ({
        ...asgn,
        _idx: (currentPage - 1) * PER_PAGE + idx + 1,
    })), [currentPage, data]);
    const columns = useMemo(() => [
        {
            id: "no",
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            header: () => "No",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original._idx}</div>),
        },
        {
            id: "assignmentId",
            accessorKey: "assignmentId",
            header: () => "Assignment ID",
            cell: (info) => (<div className="text-sm text-gray-800 font-semibold">{info.row.original.assignmentId}</div>),
        },
        {
            id: "assignmentType",
            header: () => "Assignment Type",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.assignmentType}</div>),
        },
        {
            id: "bookings",
            header: () => "Booking(s)",
            cell: (info) => {
                const count = info.row.original.bookings.length;
                return (<div className="text-sm text-gray-700">
              {count} Booking{count !== 1 ? "s" : ""}
            </div>);
            },
        },
        {
            id: "status",
            header: () => "Assignment Status",
            cell: (info) => <AssignmentStatusBadge status={info.row.original.status}/>,
        },
        {
            id: "baseStations",
            header: () => "Base Station(s)",
            cell: (info) => (<div className="text-sm text-gray-700">{info.row.original.baseStations.join(", ")}</div>),
        },
        {
            id: "assetQty",
            header: () => "Asset Qty",
            cell: (info) => {
                const qty = info.row.original.assetQty;
                return (<div className="text-sm text-gray-700">
              {qty} Asset{qty !== 1 ? "s" : ""}
            </div>);
            },
        },
        {
            id: "issuedDate",
            accessorKey: "issuedDate",
            header: () => "Issued Date",
            // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
            normalWhitespace: "true",
            cell: (info) => (<div className="text-sm text-gray-700 whitespace-pre-line leading-snug">
            {info.row.original.issuedDate ?? "—"}
          </div>),
        },
        {
            id: "returnedDate",
            header: () => "Returned Date",
            // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
            normalWhitespace: "true",
            cell: (info) => (<div className="text-sm text-gray-700 whitespace-pre-line leading-snug">
            {info.row.original.returnedDate ?? <span className="text-gray-300">—</span>}
          </div>),
        },
        {
            // accessorKey "action" triggers TableCustom's built-in ChevronDown expand toggle
            accessorKey: "action",
            header: () => "Actions",
            cell: () => (<Dropdown Icon={<MoreVertical size={16} className="text-gray-400"/>} positionType="bottom-right" className="w-52 py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Eye size={15} className="text-gray-400"/>
                View Details
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <PackageCheck size={15} className="text-gray-400"/>
                Return Assets
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <ArrowRightToLine size={15} className="text-gray-400"/>
                Top Up Assets
              </button>
            </Dropdown>),
        },
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    return (<div>
      <TableCustom columns={columns} data={rows} autoScrollTable={true}
        classThead="bg-red-50/70"
        classTheadTh="text-brand-primary text-xs font-semibold"
        classTBody="hover:bg-gray-50/80 cursor-pointer transition-colors"
        getNestedComponent={(row) => {
            const asgn = row.original;
            return <BookingSubTable assignment={asgn} parentNo={asgn._idx} onNavigate={onNavigate}/>;
        }}/>
      <Pagination currentPage={currentPage} itemsPerPage={PER_PAGE} totalItems={data.length} setCurrentPage={onPageChange}/>
    </div>);
}

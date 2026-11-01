import { useMemo } from "react";
import { Eye } from "lucide-react";
import { TableCustom } from "@/components/table";
import { BOOKING_DETAILS } from "../constants";
import { BookingStatusPill } from "./BookingStatusPill";
export function BookingSubTable({ assignment, parentNo, onNavigate }) {
    const rows = useMemo(() => assignment.bookings.map((bkId, bkIdx) => {
        const detail = BOOKING_DETAILS[bkId];
        return {
            rowLabel: `${parentNo}-${bkIdx + 1}`,
            bookingId: bkId,
            program: detail?.program ?? bkId,
            displayBookingId: detail?.bookingId ?? bkId,
            trainingType: detail?.trainingType ?? "—",
            trainingMode: detail?.trainingMode ?? "—",
            bookingTime: detail?.bookingTime ?? "—",
            status: detail?.status ?? "",
            trainees: detail?.trainees ?? "—",
        };
    }), [assignment.bookings, parentNo]);
    const handleRowClick = () => {
        if (onNavigate) {
            const baseStation = assignment.baseStations?.[0] ?? "TRX-01";
            onNavigate(`/system-hardware/assignment-detail?baseStation=${baseStation}&assignmentId=${assignment.id}&assetsQty=${assignment.assetQty ?? 1}`);
        }
    };

    const columns = useMemo(() => [
        {
            id: "rowLabel",
            header: () => "No",
            cell: (info) => (<div className="text-sm text-gray-500 cursor-pointer" onClick={handleRowClick}>{info.row.original.rowLabel}</div>),
        },
        {
            id: "bookingInfo",
            header: () => "Booking ID",
            cell: (info) => (<div className="cursor-pointer group" onClick={handleRowClick}>
            <p className="text-sm font-medium text-gray-800 leading-snug group-hover:text-brand-primary transition-colors">{info.row.original.program}</p>
            <p className="text-xs text-gray-400 mt-0.5">Booking ID - {info.row.original.displayBookingId}</p>
          </div>),
        },
        {
            id: "trainingType",
            header: () => "Training Type",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={handleRowClick}>{info.row.original.trainingType}</div>),
        },
        {
            id: "trainingMode",
            header: () => "Training Mode",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={handleRowClick}>{info.row.original.trainingMode}</div>),
        },
        {
            id: "bookingTime",
            header: () => "Booking Time",
            // @ts-ignore — normalWhitespace is a custom extension read by TableCustom
            normalWhitespace: "true",
            cell: (info) => (<div className="text-sm text-gray-700 whitespace-pre-line leading-snug cursor-pointer" onClick={handleRowClick}>
            {info.row.original.bookingTime}
          </div>),
        },
        {
            id: "status",
            header: () => "Status",
            cell: (info) => (<div className="cursor-pointer" onClick={handleRowClick}>
            {info.row.original.status ? (<BookingStatusPill status={info.row.original.status}/>) : (<span className="text-gray-400 text-sm">—</span>)}
          </div>),
        },
        {
            id: "unitName",
            header: () => "Unit Name",
            cell: (info) => (<div className="text-sm text-gray-700 cursor-pointer" onClick={handleRowClick}>{String(info.row.original.trainees)}</div>),
        },
        {
            id: "action",
            width: "70px",
            minWidth: "70px",
            maxWidth: "70px",
            header: () => "Actions",
            cell: () => (<button onClick={handleRowClick} className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-red-50 rounded-lg transition-colors" title="View assignment details">
            <Eye size={15}/>
          </button>),
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [assignment, onNavigate]);
    return (<div className="bg-red-50/30 border-t border-red-100">
      <TableCustom
        columns={columns}
        data={rows}
        autoScrollTable={false}
        actionSticky={true}
        classThead="bg-red-50/60"
        classTheadTh="text-brand-primary text-xs font-semibold"
        classTBody="hover:bg-red-50/40 cursor-pointer transition-colors"
      />
    </div>);
}

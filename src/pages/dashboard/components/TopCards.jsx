import { cn } from "@/lib/utils";
import { TOP_CARDS_DATA } from "../constants";
export function TopCards({ view }) {
    const d = TOP_CARDS_DATA[view];
    const bookingPct = Math.round((d.booking.done / d.booking.total) * 100);
    const ongoingPct = Math.round((d.booking.ongoing / d.booking.total) * 100);
    const awaitingPct = 100 - bookingPct - ongoingPct;
    const assetPct = Math.round((d.asset.returned / d.asset.issued) * 100);
    const pendingPct = 100 - assetPct;
    return (<div className="grid grid-cols-2 gap-4 mb-4">
      {/* Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{d.bookingLabel}</span>
          <span className="text-xs font-bold text-green-600">{bookingPct}% done</span>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-3">
          {[
            { label: "Total", value: d.booking.total, color: "text-gray-800" },
            { label: "Done", value: d.booking.done, color: "text-green-600" },
            { label: "Ongoing", value: d.booking.ongoing, color: "text-yellow-500" },
            { label: "Awaiting", value: d.booking.awaiting, color: "text-red-500" },
        ].map(({ label, value, color }) => (<div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className={cn("text-3xl font-bold", color)}>{value}</p>
            </div>))}
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex gap-0.5">
          <div className="bg-green-500 rounded-full transition-all duration-500" style={{ width: `${bookingPct}%` }}/>
          {ongoingPct > 0 && <div className="bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${ongoingPct}%` }}/>}
          {awaitingPct > 0 && <div className="bg-red-300 rounded-full transition-all duration-500" style={{ width: `${awaitingPct}%` }}/>}
        </div>
      </div>

      {/* Asset Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset Overview</span>
          <span className="text-xs font-bold text-green-600">{assetPct}% returned</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[
            { label: "Total Issued", value: d.asset.issued, color: "text-gray-800" },
            { label: "Returned", value: d.asset.returned, color: "text-green-600" },
            { label: "Pending Return", value: d.asset.pending, color: "text-yellow-500" },
        ].map(({ label, value, color }) => (<div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className={cn("text-3xl font-bold", color)}>{value}</p>
            </div>))}
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex gap-0.5">
          <div className="bg-green-500 rounded-full transition-all duration-500" style={{ width: `${assetPct}%` }}/>
          {pendingPct > 0 && <div className="bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }}/>}
        </div>
      </div>
    </div>);
}

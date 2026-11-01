import { ArrowLeft, ChevronRight, Clock, AlertCircle, Cpu, Layers } from "lucide-react";
import { TableCustom } from "@/components/table";
import { cn } from "@/lib/utils";
import { oaMonths } from "@/data/operationalAvailability";
function UptimePill({ value }) {
    const zero = value === "0m 0s";
    return (<span className={cn("inline-block font-mono text-xs px-2 py-0.5 rounded", zero ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-700 font-medium")}>
      {value}
    </span>);
}
function DowntimePill({ value }) {
    const zero = value === "0m 0s";
    return (<span className={cn("inline-block font-mono text-xs px-2 py-0.5 rounded", zero ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-600 font-semibold")}>
      {value}
    </span>);
}
export function OperationalAvailabilityDetail({ monthId, bookingId, onNavigate }) {
    const record = oaMonths.find((m) => m.id === monthId);
    const booking = record?.bookings.find((b) => b.id === bookingId);
    if (!record || !booking) {
        return (<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Booking not found.
      </div>);
    }
    const totalLanes = booking.devices.reduce((s, d) => s + d.lanes.length, 0);
    const hasDowntime = booking.dt !== "0m 0s";
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 flex-wrap">
          <button onClick={() => onNavigate?.("/operational-availability")} className="hover:text-brand-primary transition-colors">
            Operational Availability
          </button>
          <ChevronRight size={13}/>
          <button onClick={() => onNavigate?.(`/operational-availability/${monthId}`)} className="hover:text-brand-primary transition-colors">
            {record.month}
          </button>
          <ChevronRight size={13}/>
          <span className="text-gray-700 font-medium truncate max-w-[260px]">{booking.name}</span>
        </div>

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate?.(`/operational-availability/${monthId}`)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-brand-primary transition-colors">
            <ArrowLeft size={16}/>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-brand-primary">{booking.name}</h1>
              <span className="text-xs font-medium text-brand-primary bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
                {booking.bookingRef}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Device and lane-level availability breakdown</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
                icon: <Clock size={18} className="text-blue-500"/>,
                bg: "bg-blue-50",
                label: "Operation Time",
                value: booking.ot,
                valueClass: "text-gray-800 font-mono",
            },
            {
                icon: <AlertCircle size={18} className="text-red-400"/>,
                bg: "bg-red-50",
                label: "Down Time",
                value: booking.dt,
                valueClass: hasDowntime ? "text-red-500 font-mono font-semibold" : "text-gray-400 font-mono",
            },
            {
                icon: <Cpu size={18} className="text-purple-500"/>,
                bg: "bg-purple-50",
                label: "Devices Used",
                value: booking.devices.length.toString(),
                valueClass: "text-gray-800",
            },
            {
                icon: <Layers size={18} className="text-amber-500"/>,
                bg: "bg-amber-50",
                label: "Total Lanes",
                value: totalLanes.toString(),
                valueClass: "text-gray-800",
            },
        ].map((card) => (<div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", card.bg)}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400">{card.label}</p>
                <p className={cn("text-2xl font-bold mt-0.5 leading-none", card.valueClass)}>
                  {card.value}
                </p>
              </div>
            </div>))}
        </div>

        {/* Device × Lane tables */}
        {booking.devices.map((device) => {
            const laneData = device.lanes.map((lane, idx) => ({
                ...lane,
                _idx: idx + 1,
            }));
            // Columns defined inline per-device — no hook dependency issue
            const laneColumns = [
                {
                    id: "no",
                    header: () => "#",
                    cell: (info) => (<div className="text-xs text-gray-400">{info.row.original._idx}</div>),
                },
                {
                    id: "lane",
                    header: () => "Lane",
                    cell: (info) => (<div className="text-sm font-medium text-gray-700">{info.row.original.lane}</div>),
                },
                {
                    id: "uptime",
                    header: () => "Uptime Duration",
                    cell: (info) => <UptimePill value={info.row.original.uptime}/>,
                },
                {
                    id: "downtime",
                    header: () => "Downtime Duration",
                    cell: (info) => <DowntimePill value={info.row.original.downtime}/>,
                },
                {
                    id: "status",
                    header: () => "Status",
                    cell: (info) => {
                        const laneOk = info.row.original.downtime === "0m 0s";
                        return (<span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", laneOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", laneOk ? "bg-green-500" : "bg-red-500")}/>
                    {laneOk ? "Operational" : "Downtime"}
                  </span>);
                    },
                },
            ];
            return (<div key={device.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              {/* Device header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                    <Cpu size={15} className="text-brand-primary"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-primary">{device.name}</p>
                    <p className="text-xs text-gray-400">{device.lanes.length} lanes</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Uptime</p>
                    <p className="text-sm font-bold text-green-600 font-mono">{device.totalUptime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Downtime</p>
                    <p className={cn("text-sm font-bold font-mono", device.totalDowntime !== "0m 0s" ? "text-red-500" : "text-gray-400")}>
                      {device.totalDowntime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lane rows via TableCustom */}
              <TableCustom columns={laneColumns} data={laneData} autoScrollTable={true}/>
            </div>);
        })}

      </div>
    </div>);
}

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeviceCell } from "./DeviceCell";
export function BookingRows({ record }) {
    const [expandedBookings, setExpandedBookings] = useState({});
    const toggleBooking = (id) => {
        setExpandedBookings((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    return (<div className="bg-red-50/60 px-6 pb-2">
      {/* Sub-table header */}
      <div className="grid pt-2 pb-0" style={{ gridTemplateColumns: "280px 160px 160px 1fr 1fr" }}>
        <div className="py-2 text-[11px] font-semibold text-brand-primary pl-2">Booking ID</div>
        <div className="py-2 text-[11px] font-semibold text-brand-primary">Duration Activity Operation Time (OT)</div>
        <div className="py-2 text-[11px] font-semibold text-brand-primary">Duration Activity Down Time (DT)</div>
        <div className="py-2 text-[11px] font-semibold text-brand-primary">Uptime Duration</div>
        <div className="py-2 text-[11px] font-semibold text-brand-primary">Downtime Duration</div>
      </div>

      {/* Booking rows */}
      {record.bookings.map((booking) => (<div key={booking.id} onClick={() => toggleBooking(booking.id)} className="grid border-b border-gray-100 last:border-b-0 hover:bg-red-50/30 cursor-pointer transition-colors" style={{ gridTemplateColumns: "280px 160px 160px 1fr 1fr" }}>
          {/* Booking ID */}
          <div className="py-3 pr-3 pl-2 align-top">
            <div className="text-sm font-medium text-gray-700">{booking.name}</div>
            <div className="text-xs text-brand-primary mt-0.5">{booking.bookingRef}</div>
          </div>

          {/* OT */}
          <div className="py-3 pr-3 align-top">
            <span className="text-sm font-mono text-gray-700">{booking.ot}</span>
          </div>

          {/* DT */}
          <div className="py-3 pr-3 align-top">
            <span className={cn("text-sm font-mono", booking.dt !== "0m 0s" ? "text-red-500 font-semibold" : "text-gray-400")}>
              {booking.dt}
            </span>
          </div>

          {/* Uptime Duration */}
          <div className="py-3 pr-3 align-top">
            {expandedBookings[booking.id] ? (<div className="space-y-1">
                {booking.devices.map((device) => (<DeviceCell key={device.id} deviceId={device.id} deviceName={device.name} total={device.totalUptime} laneNames={device.lanes.map((l) => l.lane)} laneValues={device.lanes.map((l) => l.uptime)} highlight="uptime"/>))}
              </div>) : (<span className="text-sm font-mono text-green-600">
                {booking.devices.reduce((_, d) => d.totalUptime, booking.ot)}
              </span>)}
          </div>

          {/* Downtime Duration */}
          <div className="py-3 align-top">
            <div className="flex items-start justify-between">
              {expandedBookings[booking.id] ? (<div className="space-y-1 flex-1">
                  {booking.devices.map((device) => (<DeviceCell key={device.id} deviceId={device.id} deviceName={device.name} total={device.totalDowntime} laneNames={device.lanes.map((l) => l.lane)} laneValues={device.lanes.map((l) => l.downtime)} highlight="downtime"/>))}
                </div>) : (<span className={cn("text-sm font-mono flex-1", booking.dt !== "0m 0s" ? "text-red-500 font-semibold" : "text-gray-400")}>
                  {booking.dt}
                </span>)}
              <span className="ml-2 text-gray-400 flex-shrink-0 mt-0.5">
                {expandedBookings[booking.id]
                ? <ChevronUp size={14}/>
                : <ChevronDown size={14}/>}
              </span>
            </div>
          </div>
        </div>))}
    </div>);
}

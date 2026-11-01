import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
export function DeviceCell({ deviceId, deviceName, total, laneValues, laneNames, highlight }) {
    const [open, setOpen] = useState(false);
    const isUp = highlight === "uptime";
    return (<div className="mb-1 last:mb-0">
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className={cn("flex items-center justify-between w-full px-2 py-1 rounded text-xs font-medium transition-colors", isUp ? "bg-green-50 hover:bg-green-100 text-green-700" : "bg-red-50 hover:bg-red-100 text-red-600")}>
        <span className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", isUp ? "bg-green-500" : "bg-red-500")}/>
          {deviceName}
        </span>
        <span className="flex items-center gap-1 ml-2 font-mono text-[11px]">
          {total}
          {open ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
        </span>
      </button>
      {open && (<div className="pl-3 pt-0.5">
          {laneNames.map((lane, i) => (<div key={`${deviceId}-${lane}`} className="flex justify-between text-[11px] py-0.5 text-gray-500">
              <span>{lane}</span>
              <span className={cn("font-mono", isUp ? "text-green-600" : laneValues[i] !== "0m 0s" ? "text-red-500" : "text-gray-400")}>
                {laneValues[i]}
              </span>
            </div>))}
        </div>)}
    </div>);
}

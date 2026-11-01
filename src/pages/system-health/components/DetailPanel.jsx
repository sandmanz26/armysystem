import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSectionData } from "../constants";
import { statusDot } from "../utils";
import { StatusBadge } from "./StatusBadge";
export function DetailPanel({ sectionId, itemLabel, onSelectItem }) {
    if (!sectionId) {
        return (<div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <Activity size={32} className="text-gray-200"/>
        <span>Select an item from the left panel</span>
      </div>);
    }
    const data = getSectionData(sectionId);
    if (!data)
        return (<div className="flex items-center justify-center h-64 text-gray-400 text-sm">No detail available</div>);
    const selectedItem = data.items.find((i) => i.label === itemLabel) ?? null;
    return (<div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{data.title}</h3>
        <StatusBadge status={data.overallStatus}/>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">
        {data.items.map((item) => {
            const isActive = item.label === itemLabel;
            return (<button key={item.label} onClick={() => onSelectItem(item.label)} className={cn("w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors", isActive ? "bg-red-50/70" : "bg-white hover:bg-gray-50")}>
              <div className="flex items-center gap-2.5">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(item.status))}/>
                <span className={cn("text-gray-700", isActive && "font-medium text-brand-primary")}>
                  {item.label}
                </span>
              </div>
              <StatusBadge status={item.status}/>
            </button>);
        })}
      </div>

      {selectedItem?.info && (<div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{selectedItem.label}</span>
            <StatusBadge status={selectedItem.status}/>
          </div>
          <div className="text-xs text-gray-500 space-y-1.5">
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 flex-shrink-0">Description</span>
              <span className="text-gray-700">{selectedItem.info.description}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 flex-shrink-0">Error</span>
              <span className={selectedItem.info.errorMessage ? "text-red-500 font-medium" : "text-gray-400"}>
                {selectedItem.info.errorMessage || "—"}
              </span>
            </div>
          </div>
        </div>)}
    </div>);
}

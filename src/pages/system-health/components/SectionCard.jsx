import { ChevronRight, Wifi, Server, Database, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { isGood, statusColor } from "../utils";
import { OverallIcon } from "./OverallIcon";
function sectionIcon(title) {
    if (title === "Network")
        return <Wifi size={16}/>;
    if (title === "Microservices")
        return <Server size={16}/>;
    if (title === "Database")
        return <Database size={16}/>;
    return <Activity size={16}/>;
}
export function SectionCard({ section, onDetail }) {
    const passedCount = section.items.filter((i) => isGood(i.status)).length;
    const total = section.items.length;
    const pct = Math.round((passedCount / total) * 100);
    return (<div onClick={() => onDetail(section.id)} className="flex-1 min-w-[220px] bg-white rounded-xl border border-gray-200 hover:border-brand-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
      {/* Card header */}
      <div className={cn("px-4 py-3 flex items-center justify-between border-b", isGood(section.overallStatus) ? "bg-green-50 border-green-100"
            : section.overallStatus === "Failed" ? "bg-red-50 border-red-100"
                : "bg-amber-50 border-amber-100")}>
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", isGood(section.overallStatus) ? "bg-green-100 text-green-600"
            : section.overallStatus === "Failed" ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-600")}>
            {sectionIcon(section.title)}
          </div>
          <span className="text-sm font-semibold text-gray-800">{section.title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <OverallIcon status={section.overallStatus}/>
          <span className={cn("text-xs font-semibold", statusColor(section.overallStatus))}>
            {section.overallStatus}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">{passedCount}/{total} passed</span>
          <span className="text-xs font-semibold text-gray-600">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", isGood(section.overallStatus) ? "bg-green-500" : "bg-red-500")} style={{ width: `${pct}%` }}/>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pb-4 pt-2">
        {section.items.map((item) => (<div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-600">{item.label}</span>
            <span className={cn("text-xs font-semibold", statusColor(item.status))}>{item.status}</span>
          </div>))}
      </div>

      <div className="px-4 pb-3 flex justify-end">
        <span className="text-xs text-brand-primary group-hover:underline flex items-center gap-1">
          View details <ChevronRight size={11}/>
        </span>
      </div>
    </div>);
}

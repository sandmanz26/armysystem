import { Settings, Monitor, BookOpen, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
export function TeamBar() {
    const roles = [
        { label: "ADMIN", count: 3, color: "text-brand-primary", Icon: Settings, bg: "bg-brand-primary/10 border-brand-primary/20" },
        { label: "OPERATOR", count: 3, color: "text-blue-700", Icon: Monitor, bg: "bg-blue-50 border-blue-200" },
        { label: "INSTRUCTOR", count: 3, color: "text-purple-700", Icon: BookOpen, bg: "bg-purple-50 border-purple-200" },
        { label: "MAINTAINER", count: 3, color: "text-amber-700", Icon: Wrench, bg: "bg-amber-50 border-amber-200" },
    ];
    return (<div className="bg-white rounded-xl border border-gray-200 px-5 py-3 mb-4 flex items-center gap-4">
      <div className="flex items-center gap-2 mr-2">
        <span className="text-xs font-semibold text-gray-500">TEAM</span>
        <span className="text-sm font-bold text-gray-800">12</span>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-3">
        {roles.map(({ label, count, color, Icon, bg }) => (<div key={label} className={cn("flex items-center justify-between px-4 py-2 rounded-lg border", bg)}>
            <div className="flex items-center gap-2">
              <Icon size={13} className={color}/>
              <span className={cn("text-xs font-bold", color)}>{label}</span>
            </div>
            <span className={cn("text-sm font-bold", color)}>{count}</span>
          </div>))}
      </div>
    </div>);
}

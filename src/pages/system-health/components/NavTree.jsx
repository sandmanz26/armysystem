import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusColor, statusDot } from "../utils";
export function NavTree({ nodes, expanded, onToggle, selected, onSelect }) {
    return (<ul className="space-y-0.5">
      {nodes.map((node) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expanded.has(node.id);
            const isSelected = node.id === selected;
            return (<li key={node.id}>
            <button onClick={() => {
                    if (hasChildren)
                        onToggle(node.id);
                    if (node.sectionId || (!hasChildren && node.status))
                        onSelect(node);
                }} className={cn("w-full flex items-center justify-between gap-1 px-3 py-2 text-sm rounded-lg transition-colors min-w-0", isSelected ? "bg-red-50 text-brand-primary" : "text-gray-700 hover:bg-gray-50")}>
              <span className={cn("font-medium truncate flex-1 text-left", isSelected && "text-brand-primary")}>{node.label}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                {node.status && !hasChildren && (<span className={cn("text-xs font-semibold", statusColor(node.status))}>{node.status}</span>)}
                {hasChildren && (isExpanded
                    ? <ChevronUp size={13} className="text-gray-400"/>
                    : <ChevronDown size={13} className="text-gray-400"/>)}
              </span>
            </button>

            {hasChildren && isExpanded && (<ul className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                {node.children.map((child) => {
                        const childSelected = child.id === selected;
                        return (<li key={child.id}>
                      <button onClick={() => onSelect(child)} className={cn("w-full flex items-center justify-between gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors min-w-0", childSelected ? "bg-red-50" : "hover:bg-gray-50")}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {child.status && (<span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(child.status))}/>)}
                          <span className={cn("text-gray-600 truncate text-xs", childSelected && "text-brand-primary font-medium")}>
                            {child.label}
                          </span>
                        </div>
                        {child.status && (<span className={cn("text-[10px] font-semibold flex-shrink-0", statusColor(child.status))}>
                            {child.status}
                          </span>)}
                      </button>
                    </li>);
                    })}
              </ul>)}
          </li>);
        })}
    </ul>);
}

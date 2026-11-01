import { useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import { NAV_TREE } from "../constants";
import { NavTree } from "./NavTree";
import { DetailPanel } from "./DetailPanel";
export function SystemInformation({ initialSection, onBack }) {
    const [expanded, setExpanded] = useState(() => new Set(["bit-toms", "bit-trx", "hums-trx"]));
    const [selectedNodeId, setSelectedNodeId] = useState(initialSection ?? "");
    const [activeSectionId, setActiveSectionId] = useState(initialSection);
    const [selectedItemLabel, setSelectedItemLabel] = useState(null);
    const toggleExpand = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const handleSelectNode = (node) => {
        setSelectedNodeId(node.id);
        setActiveSectionId(node.sectionId ?? null);
        setSelectedItemLabel(null);
    };
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="flex items-center gap-1.5 px-6 py-3 text-sm text-gray-500 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="hover:text-brand-primary transition-colors"><Home size={14}/></button>
        <ChevronRight size={13} className="text-gray-300"/>
        <button onClick={onBack} className="hover:text-brand-primary transition-colors">System Health</button>
        <ChevronRight size={13} className="text-gray-300"/>
        <span className="text-gray-800 font-medium">System Information</span>
      </div>

      <div className="p-6">
        <div className="flex gap-5">
          <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">System Information</h2>
            <NavTree nodes={NAV_TREE} expanded={expanded} onToggle={toggleExpand} selected={selectedNodeId} onSelect={handleSelectNode}/>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5">
            <DetailPanel sectionId={activeSectionId} itemLabel={selectedItemLabel} onSelectItem={setSelectedItemLabel}/>
          </div>
        </div>
      </div>
    </div>);
}

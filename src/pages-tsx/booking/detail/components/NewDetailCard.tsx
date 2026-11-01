import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { NEW_DETAIL_LANES } from "../constants";
import { type AssignedTrainee } from "./SelectTraineePage";

export function NewDetailCard({
  stages,
  station,
  laneAssignments,
  onAddToLane,
  onRemoveFromLane,
  onDelete,
  onConfirm,
}: {
  stages: string[];
  station: string;
  laneAssignments: Record<number, AssignedTrainee>;
  onAddToLane: (laneNo: number) => void;
  onRemoveFromLane: (laneNo: number) => void;
  onDelete: () => void;
  onConfirm: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const assignedCount = Object.keys(laneAssignments).length;
  const availableCount = NEW_DETAIL_LANES.filter((l) => l.state === "available").length - assignedCount;
  const label = `New Detail (${stages.join(", ")})`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-800">{label}</span>
          <span className="text-xs text-gray-400">{station}</span>
          <span className="text-xs text-gray-500">{availableCount}/10 seats available</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="outline"
            onClick={onDelete}
            className="px-3 py-1.5 text-xs font-semibold text-red-500 w-auto border border-red-200 hover:bg-red-50"
          >
            Delete Detail
          </Button>
          <Button
            type="outline"
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 w-auto border border-gray-200 hover:bg-gray-50"
          >
            Edit Stage
          </Button>
          <Button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            Confirm New Detail
          </Button>
          <Button
            type="outline"
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 p-0 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-gray-50 w-auto"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4">
          <div className="grid grid-cols-5 gap-3">
            {NEW_DETAIL_LANES.map(({ lane, state }) => {
              const isClosed = state === "closed";
              const isOff = state === "off";
              const unavailable = isClosed || isOff;
              const assigned = laneAssignments[lane];

              if (assigned) {
                return (
                  <div key={lane} className="relative border border-green-200 bg-green-50 rounded-lg px-3 py-2.5 min-h-[64px]">
                    <Button
                      onClick={() => onRemoveFromLane(lane)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 p-0 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 w-auto"
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </Button>
                    <div className="text-xs font-semibold text-gray-800 pr-5">{assigned.rank} {assigned.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{assigned.svcId} | {assigned.weapon}</div>
                    <div className="text-[10px] text-gray-400 mt-1 text-right">Lane {lane}</div>
                  </div>
                );
              }

              return (
                <div
                  key={lane}
                  onClick={unavailable ? undefined : () => onAddToLane(lane)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-3 rounded-lg border min-h-[64px]",
                    unavailable ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white hover:border-brand-primary/30 cursor-pointer"
                  )}
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                    {unavailable ? (
                      <span className="text-[10px] text-gray-400 font-bold">—</span>
                    ) : (
                      <Plus size={12} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-700">Lane {lane}</div>
                    {isClosed && <div className="text-[10px] text-red-400 font-medium">(Closed)</div>}
                    {isOff && <div className="text-[10px] text-red-400 font-medium">(Off)</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

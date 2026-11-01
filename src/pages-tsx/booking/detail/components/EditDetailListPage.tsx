import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { EDIT_DETAILS } from "../constants";

const DragHandle = () => (
  <span className="text-gray-300 cursor-grab flex-shrink-0">
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
      <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
      <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
      <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
    </svg>
  </span>
);

export function EditDetailListPage({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0 gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Edit Detail List</h2>
          <p className="text-xs text-gray-400 mt-0.5">Update the detail list</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="outline"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 w-auto border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <ArrowRight size={14} /> Confirm
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EDIT_DETAILS.map((detail: any) => (
            <div key={detail.label} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">{detail.label}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {detail.lanes.map((row: any, laneIdx: number) => {
                  const laneNum = laneIdx + 1;
                  if (row.type === "closed") return (
                    <div key={laneIdx} className="flex items-center gap-2 px-3 py-2.5 bg-red-50">
                      <DragHandle />
                      <span className="flex-1 text-xs font-medium text-red-400 italic">Closed for maintenance</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">Lane {laneNum}</span>
                    </div>
                  );
                  if (row.type === "available") return (
                    <div key={laneIdx} className="flex items-center gap-2 px-3 py-2.5 bg-green-50">
                      <DragHandle />
                      <span className="flex-1 text-xs font-medium text-green-600">Available</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">Lane {laneNum}</span>
                    </div>
                  );
                  return (
                    <div key={laneIdx} className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <DragHandle />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-800 truncate">{row.rank} {row.name}</div>
                        <div className="text-[10px] text-gray-400">{row.svcId}</div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">Lane {laneNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

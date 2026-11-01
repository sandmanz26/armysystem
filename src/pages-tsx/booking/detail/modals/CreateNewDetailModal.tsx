import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { BASE_STATION_OPTIONS, STAGE_OPTIONS } from "../constants";

export function CreateNewDetailModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (stages: string[], station: string) => void;
}) {
  const [stageOpen, setStageOpen] = useState(true);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [station, setStation] = useState("");
  const [stationOpen, setStationOpen] = useState(false);
  const stationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (stationRef.current && !stationRef.current.contains(e.target as Node)) setStationOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allSelected = selectedStages.length === STAGE_OPTIONS.length;
  const toggleAll = () => setSelectedStages(allSelected ? [] : [...STAGE_OPTIONS]);
  const toggleStage = (s: string) =>
    setSelectedStages((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const gridItems = [{ label: "Select All", special: true }, ...STAGE_OPTIONS.map((s) => ({ label: s, special: false }))];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-brand-primary" />
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-gray-800">Create New Detail</div>
              <div className="text-sm text-gray-400 mt-0.5">Please fill all the information.</div>
            </div>
            <Button
              onClick={onCancel}
              className="p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent flex-shrink-0"
            >
              <X size={18} />
            </Button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setStageOpen(!stageOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3"
            >
              Booking Type
              {stageOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {stageOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {gridItems.map(({ label, special }) => {
                  const checked = special ? allSelected : selectedStages.includes(label);
                  return (
                    <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        size={16}
                        checked={checked}
                        onChange={special ? toggleAll : () => toggleStage(label)}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Station <span className="text-brand-primary">*</span>
            </div>
            <div ref={stationRef} className="relative">
              <Button
                type="outline"
                onClick={() => setStationOpen(!stationOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-sm bg-white",
                  stationOpen ? "border-brand-primary" : "border-gray-200 hover:border-gray-300",
                  station ? "text-gray-800" : "text-gray-400"
                )}
              >
                <span>{station || "Select base station"}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </Button>
              {stationOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {BASE_STATION_OPTIONS.map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => { setStation(opt); setStationOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span>{opt}</span>
                      {station === opt && <Check size={13} className="text-brand-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 pb-6">
          <Button
            type="outline"
            onClick={onCancel}
            className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedStages, station)}
            disabled={!station || selectedStages.length === 0}
            className={cn(
              "py-3 text-sm font-semibold w-full justify-center",
              (!station || selectedStages.length === 0) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-primary text-white hover:bg-brand-primary-hover"
            )}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

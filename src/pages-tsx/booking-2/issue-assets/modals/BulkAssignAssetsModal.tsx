import { useState } from "react";
import { Modal } from "@/components/modal-1";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { BASE_STATION_OPTIONS, getLaneOptions } from "../constants";

export function BulkAssignAssetsModal({
  open, onClose, count, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (station: string, lane: string) => void;
}) {
  const [station, setStation] = useState("");
  const [lane, setLane] = useState("");
  const [stationDdOpen, setStationDdOpen] = useState(false);
  const [laneDdOpen, setLaneDdOpen] = useState(false);

  const laneOptions = station ? getLaneOptions(station) : [];

  const handleConfirm = () => {
    if (!station || !lane) return;
    onConfirm(station, lane);
    setStation("");
    setLane("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="500px">
      <div className="flex items-center gap-4 mb-8 -mt-2">
        <div className="w-14 h-14 rounded-full bg-primary-default/10 flex items-center justify-center flex-shrink-0">
          <LayoutGrid size={24} className="text-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-default">Bulk Assign</h3>
          <p className="text-sm text-body mt-0.5">Applies to {count} selected asset{count !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-default mb-2">
            Target Base Station <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Button
              type="outline"
              onClick={() => { setStationDdOpen(!stationDdOpen); setLaneDdOpen(false); }}
              className={cn("w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-sm",
                stationDdOpen ? "border-default" : "border-invert-default hover:border-disabled")}
            >
              <span className={station ? "text-default" : "text-disabled"}>{station || "Select base station"}</span>
              <ChevronDown size={18} className="text-body" />
            </Button>
            {stationDdOpen && (
              <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {BASE_STATION_OPTIONS.map((s) => (
                  <button key={s} type="button"
                    onClick={() => { setStation(s); setLane(""); setStationDdOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-default hover:bg-default-hovered border-b border-invert-default last:border-b-0">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-default mb-2">
            Target Lane <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Button
              type="outline"
              disabled={!station}
              onClick={() => setLaneDdOpen(!laneDdOpen)}
              className={cn("w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed",
                laneDdOpen ? "border-default" : "border-invert-default hover:border-disabled")}
            >
              <span className={lane ? "text-default" : "text-disabled"}>{lane || (station ? "Select lane" : "Select a base station first")}</span>
              <ChevronDown size={18} className="text-body" />
            </Button>
            {laneDdOpen && station && (
              <div className="absolute z-10 mt-1 w-full bg-surface border border-invert-default rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                {laneOptions.map((l) => (
                  <button key={l} type="button"
                    onClick={() => { setLane(l); setLaneDdOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-default hover:bg-default-hovered border-b border-invert-default last:border-b-0">
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
        <Button
          className="w-full justify-center bg-primary-default hover:bg-primary-hovered border-transparent disabled:opacity-50"
          onClick={handleConfirm}
          disabled={!station || !lane}
        >
          Assign
        </Button>
      </div>
    </Modal>
  );
}

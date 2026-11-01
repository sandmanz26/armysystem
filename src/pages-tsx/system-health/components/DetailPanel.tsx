import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSectionData } from "../constants";
import { statusDot, overallOf } from "../utils";
import type { CheckItem, Status } from "../types";
import { StatusBadge } from "./StatusBadge";

interface DetailPanelProps {
  sectionId: string | null;
  itemLabel: string | null;
  onSelectItem: (label: string) => void;
}

// TRX hardware (BIT (TRX), HUMS (TRX)) exists per base station — when every
// item carries a `perStation` breakdown, a station tab lets the reader see
// that specific station's status instead of the item's headline status.
function statusForStation(item: CheckItem, stationIdx: number | null): Status {
  if (stationIdx === null || !item.perStation) return item.status;
  return item.perStation[stationIdx]?.status ?? item.status;
}

export function DetailPanel({ sectionId, itemLabel, onSelectItem }: DetailPanelProps) {
  const [stationIdx, setStationIdx] = useState<number | null>(null);

  useEffect(() => {
    setStationIdx(null);
  }, [sectionId]);

  if (!sectionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <Activity size={32} className="text-gray-200" />
        <span>Select an item from the left panel</span>
      </div>
    );
  }

  const data = getSectionData(sectionId);
  if (!data) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No detail available</div>
  );

  const selectedItem = data.items.find((i) => i.label === itemLabel) ?? null;
  const stations = data.items[0]?.perStation?.map((s) => s.station) ?? [];
  const hasStations = stations.length > 0;

  const displayOverallStatus = hasStations && stationIdx !== null
    ? overallOf(data.items.map((i) => ({ ...i, status: statusForStation(i, stationIdx) })))
    : data.overallStatus;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{data.title}</h3>
        <StatusBadge status={displayOverallStatus} />
      </div>

      {hasStations && (
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          <button
            onClick={() => setStationIdx(null)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              stationIdx === null
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            All Stations
          </button>
          {stations.map((station, i) => (
            <button
              key={station}
              onClick={() => setStationIdx(i)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                stationIdx === i
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {station}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">
        {data.items.map((item) => {
          const isActive = item.label === itemLabel;
          const status = statusForStation(item, stationIdx);
          return (
            <button
              key={item.label}
              onClick={() => onSelectItem(item.label)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors",
                isActive ? "bg-red-50/70" : "bg-white hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusDot(status))} />
                <span className={cn("text-gray-700", isActive && "font-medium text-brand-primary")}>
                  {item.label}
                </span>
              </div>
              <StatusBadge status={status} />
            </button>
          );
        })}
      </div>

      {selectedItem?.subChecks && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">{selectedItem.label}:</h4>
          {selectedItem.subChecks.map((sub) => (
            <div key={sub.label} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{sub.label}</span>
                <StatusBadge status={sub.status} />
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-400 flex-shrink-0">Error Message:</span>
                <span className={sub.errorMessage ? "text-red-500 font-medium" : "text-gray-400"}>
                  {sub.errorMessage || "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedItem?.subChecks && selectedItem?.info && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {selectedItem.label}
              {hasStations && stationIdx !== null && (
                <span className="ml-2 text-xs font-normal text-gray-400">({stations[stationIdx]})</span>
              )}
            </span>
            <StatusBadge status={statusForStation(selectedItem, stationIdx)} />
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
        </div>
      )}
    </div>
  );
}

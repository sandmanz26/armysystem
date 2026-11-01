// Booking 2.0 Onboarding — "Move Trainee" drawer, per the reference
// screenshot. Lets the user reassign a trainee from Detail List into a
// different Base Station / Detail / Lane — only an "Available" (currently
// unoccupied) lane can be picked as the destination.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingTrainee } from "../types";

export interface DestinationLaneRow {
  lane: number;
  occupant?: { name: string; svcId: string };
}

interface MoveTraineeModalProps {
  trainee: OnboardingTrainee;
  currentStation: string;
  currentDetail: number;
  currentLane: number;
  stationOptions: string[];
  detailOptionsFor: (station: string) => number[];
  destinationRowsFor: (station: string, detail: number) => DestinationLaneRow[];
  onClose: () => void;
  onConfirm: (station: string, detail: number, lane: number) => void;
}

export function MoveTraineeModal({
  trainee, currentStation, currentDetail, currentLane,
  stationOptions, detailOptionsFor, destinationRowsFor, onClose, onConfirm,
}: MoveTraineeModalProps) {
  const [station, setStation] = useState(currentStation);
  const [detail, setDetail] = useState(currentDetail);
  const [lane, setLane] = useState<number | null>(null);

  const detailOptions = detailOptionsFor(station);
  const rows = destinationRowsFor(station, detail);

  useEffect(() => {
    setLane(null);
  }, [station, detail]);

  return (
    <>
      <div className="fixed inset-0 z-[2300] bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[2400] w-[520px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-figma-default">Move Trainee</h2>
          <button type="button" onClick={onClose} className="text-figma-disabled hover:text-figma-default"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-figma-default mb-2">Trainee to Move</p>
            <div className="border border-figma-subtle rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-figma-body">Trainee</p>
                <p className="text-sm font-semibold text-figma-default">{trainee.rank} {trainee.name}</p>
                <p className="text-xs text-figma-body font-mono">{trainee.svcId}</p>
              </div>
              <div>
                <p className="text-xs text-figma-body">Current Position</p>
                <p className="text-sm font-semibold text-figma-default">{currentStation}, Detail {currentDetail}, Lane {currentLane}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-figma-default mb-1.5">Base Station <span className="text-figma-primary">*</span></label>
            <div className="flex gap-2">
              {stationOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStation(s)}
                  className={cn("flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg border", station === s ? "border-figma-primary text-figma-primary bg-figma-dangersoft" : "border-figma-subtle text-figma-body hover:bg-gray-50")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-figma-default mb-1.5">Detail <span className="text-figma-primary">*</span></label>
            <div className="flex gap-2">
              {detailOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDetail(d)}
                  className={cn("flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg border", detail === d ? "border-figma-primary text-figma-primary bg-figma-dangersoft" : "border-figma-subtle text-figma-body hover:bg-gray-50")}
                >
                  Detail {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-figma-default mb-1.5">Destination Lane <span className="text-figma-primary">*</span></label>
            <div className="border border-figma-subtle rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-figma-dangersoft text-figma-primary text-xs">
                    <th className="w-10" />
                    <th className="text-left font-semibold px-4 py-2">Lane</th>
                    <th className="text-left font-semibold px-4 py-2">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isCurrent = station === currentStation && detail === currentDetail && r.lane === currentLane;
                    const available = !r.occupant || isCurrent;
                    return (
                      <tr key={r.lane} className={cn("border-t border-gray-50", available && !isCurrent && "bg-figma-successbg")}>
                        <td className="px-4 py-2.5">
                          <input
                            type="radio"
                            checked={lane === r.lane}
                            disabled={!available}
                            onChange={() => setLane(r.lane)}
                            className="accent-brand-primary"
                          />
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-figma-default">Lane {r.lane}</td>
                        <td className="px-4 py-2.5">
                          {isCurrent ? (
                            <span className="text-figma-body">{trainee.name} (current)</span>
                          ) : r.occupant ? (
                            <div>
                              <p className="font-semibold text-figma-default">{r.occupant.name}</p>
                              <p className="text-xs text-figma-body font-mono">{r.occupant.svcId}</p>
                            </div>
                          ) : (
                            <span className="text-figma-success font-semibold">Available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-gray-50 bg-white">
            Cancel
          </button>
          <button
            type="button"
            disabled={lane === null}
            onClick={() => lane !== null && onConfirm(station, detail, lane)}
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg", lane !== null ? "bg-figma-primary text-white hover:bg-figma-primaryhover" : "bg-gray-300 text-white cursor-not-allowed")}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}

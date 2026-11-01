import { useState, useEffect, useMemo, useRef } from "react";
import { Users, Monitor, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { LiveResultsPage } from "./LiveResultsPage";
import { SelectTraineePage, type AssignedTrainee } from "./SelectTraineePage";
import { NewDetailCard } from "./NewDetailCard";
import { CreateNewDetailModal } from "../modals/CreateNewDetailModal";
import { LIVE_DETAIL_GROUPS, NEW_DETAIL_LANES } from "../constants";
import { StatusPill } from "./StatusPill";
import { useBookingStore } from "../store/useBookingStore";
import type { BookingTrainee } from "../types";

export function LiveTrainingDashboard() {
  const booking = useBookingStore((s) => s.booking);
  const [secondsLeft, setSecondsLeft] = useState(3599);
  const [showLiveResults, setShowLiveResults] = useState(false);
  const [showCreateDetail, setShowCreateDetail] = useState(false);
  const [newDetail, setNewDetail] = useState<{ stages: string[]; station: string } | null>(null);
  const [selectingForLane, setSelectingForLane] = useState<number | null>(null);
  const [laneAssignments, setLaneAssignments] = useState<Record<number, AssignedTrainee>>({});
  const [detailGroups, setDetailGroups] = useState(LIVE_DETAIL_GROUPS);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const totalDetails = detailGroups.reduce((s, g) => s + g.details.length, 0);
  const detailCountByStation = useMemo(
    () => Object.fromEntries(detailGroups.map((g) => [g.station, g.details.length])),
    [detailGroups]
  );

  const addReshootDetail = (station: string, coursewares: string[], trainees: BookingTrainee[]) => {
    const capacity = NEW_DETAIL_LANES.filter((l) => l.state === "available").length;
    const assignedCount = Math.min(trainees.length, capacity);
    const skipped = trainees.length - assignedCount;
    const nextNum = (detailCountByStation[station] ?? 0) + 1;
    const newDetail = {
      label: `Detail ${nextNum} (${coursewares.join(",")})`,
      assignedStation: station,
      trainees: assignedCount,
      status: "Pending",
    };

    setDetailGroups((prev) => {
      const idx = prev.findIndex((g) => g.station === station);
      if (idx === -1) return [...prev, { station, details: [newDetail] }];
      return prev.map((g, i) => i === idx ? { ...g, details: [...g.details, newDetail] } : g);
    });

    toastIdRef.current += 1;
    setToast({
      id: toastIdRef.current,
      message: skipped > 0
        ? `New detail created. ${skipped} trainee(s) skipped — no matching lane (weapon, role, or station type).`
        : "New detail created.",
    });
  };

  if (!booking) return null;

  if (showLiveResults) {
    return (
      <LiveResultsPage
        onBack={() => setShowLiveResults(false)}
        onReshoot={(station, coursewares, trainees) => {
          addReshootDetail(station, coursewares, trainees);
          setShowLiveResults(false);
        }}
        detailCountByStation={detailCountByStation}
      />
    );
  }

  if (selectingForLane !== null) {
    return (
      <SelectTraineePage
        laneNo={selectingForLane}
        onBack={() => setSelectingForLane(null)}
        onSave={(t) => {
          setLaneAssignments((prev) => ({ ...prev, [selectingForLane]: t }));
          setSelectingForLane(null);
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6 flex-shrink-0">
        <div className="flex items-center gap-6 flex-1">
          <div>
            <div className="text-sm font-bold text-gray-800">{booking.title}</div>
            <div className="text-xs text-gray-400">{booking.id}</div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Training Mode</div>
            <div className="text-sm font-bold text-gray-800">{booking.trainingMode}</div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Courseware</div>
            <div className="text-sm font-bold text-gray-800">{booking.courseware}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Marksmanship Trainee(s)", color: "blue", Icon: Users },
            { label: "Pass Trainee(s)", color: "green", Icon: Users },
            { label: "Fail Trainee(s)", color: "red", Icon: Users },
          ].map(({ label, color, Icon }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                color === "blue" ? "bg-blue-100" : color === "green" ? "bg-green-100" : "bg-red-100")}>
                <Icon size={14} className={cn(color === "blue" ? "text-blue-500" : color === "green" ? "text-green-500" : "text-brand-primary")} />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">{label}</div>
                <div className="text-sm font-bold text-gray-800"><span className="text-xl">0</span> /{booking.traineesCount} Trainee(s)</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4f4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-lg font-bold text-brand-primary tracking-widest font-mono">{hh}:{mm}:{ss}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">
            Details <span className="font-normal text-gray-400">({totalDetails} Details)</span>
          </h3>
          <div className="flex items-center gap-3">
            <Button
              type="outline"
              onClick={() => setShowCreateDetail(true)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 w-auto border border-gray-200"
            >
              Create New Detail
            </Button>
            <Button
              onClick={() => setShowLiveResults(true)}
              className="px-4 py-2 text-sm font-bold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Live Results
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {newDetail && (
            <NewDetailCard
              stages={newDetail.stages}
              station={newDetail.station}
              laneAssignments={laneAssignments}
              onAddToLane={(laneNo) => setSelectingForLane(laneNo)}
              onRemoveFromLane={(laneNo) => setLaneAssignments((prev) => {
                const next = { ...prev };
                delete next[laneNo];
                return next;
              })}
              onDelete={() => { setNewDetail(null); setLaneAssignments({}); }}
              onConfirm={() => { setNewDetail(null); setLaneAssignments({}); }}
            />
          )}

          {detailGroups.map((group) => (
            <div key={group.station}>
              <div className="text-sm font-bold text-gray-800 mb-3">
                {group.station}{" "}
                <span className="text-gray-400 font-normal">({group.details.length} Details)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.details.map((detail, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-gray-800">{detail.label}</span>
                      <Monitor size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Station</div>
                        <div className="text-xs font-bold text-gray-800">{detail.assignedStation}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Trainees</div>
                        <div className="text-xs font-bold text-gray-800">{detail.trainees} Trainees</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                        <StatusPill status={detail.status} />
                      </div>
                    </div>
                    <Button className="w-full py-2.5 text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover">
                      View Detail List
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateDetail && (
        <CreateNewDetailModal
          onCancel={() => setShowCreateDetail(false)}
          onConfirm={(stages, station) => { setNewDetail({ stages, station }); setShowCreateDetail(false); }}
        />
      )}

      {toast && (
        <div key={toast.id} className="fixed top-6 right-6 z-[100] flex items-start gap-2.5 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={12} className="text-green-600" strokeWidth={3} />
          </div>
          <p className="text-sm text-green-700 flex-1">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

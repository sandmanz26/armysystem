// Booking 2.0 Onboarding — "Scan ID" modal, per the screenshots. Simulates
// scanning existing (Registered) trainees present-in-order across BOTH
// Flat Screen and C-Shaped rolls at once (a single physical scanner covers
// the whole booking, not one station-type tab at a time), then a few
// walk-in (Non-Registered) arrivals — a Non-Registered arrival must have its
// profile (Rank/Platoon/Role/Weapon, plus which station type it belongs to
// if the booking has both) filled in via "Complete Data" before Finish Scanning is
// allowed (PRD Sec. 8.3's Status Matrix + the mandatory-fields gate).
import { useState, useEffect, useRef, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { TableCustom } from "@/components/table";
import { Toast } from "@/components/toast";
import { stationLabel, FLAT_LANE_COUNT } from "../laneConfigTypes";
import { WALKIN_NAMES, isComplete, formattedToday, type OnboardingTrainee } from "../types";
import { EditTraineeDrawer } from "./EditTraineeDrawer";
import { CompleteTraineeDetailsModal } from "./CompleteTraineeDetailsModal";
import { LeaveIncompleteDialog } from "./LeaveIncompleteDialog";

// F-009 (O-4): Figma `Scan ID - Empty` (5348:102170) — the modal opens on the empty
// state ("No trainee scanned yet" / "No data to show right now") and the simulated
// scanner starts reading after this delay, so the empty state is actually seen.
const FIRST_SCAN_DELAY_MS = 1500;
// F-009 (O-4): Figma `Scan ID - If Trainee Double Scan` (5474:158145) — the simulated
// queue re-reads the first scanned registered trainee after this many scans.
const DOUBLE_SCAN_AFTER = 3;

const columnHelper = createColumnHelper<OnboardingTrainee>();

function pad(n: number, w: number) {
  return String(n).padStart(w, "0");
}

function randomSvcId() {
  return `*****${pad(Math.floor(Math.random() * 1000), 3)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

function laneOptionsFor(type: "flat" | "cshaped") {
  const count = type === "flat" ? FLAT_LANE_COUNT : 4;
  return Array.from({ length: count }, (_, i) => `Lane ${i + 1}`);
}

interface ScanIdModalProps {
  flatRoll: OnboardingTrainee[];
  cshapedRoll: OnboardingTrainee[];
  hasCShaped: boolean;
  numBase: number;
  numCShaped: number;
  unitName: string;
  roleOptions: string[];
  weaponOptions: string[];
  /** F-009 (O-4) — Figma `Scan ID - Scanner Inactive` (5474:158048). There is no real
   *  scanner signal in this prototype; the onboarding page raises it with `?scanner=inactive`. */
  scannerInactive?: boolean;
  onClose: () => void;
  /** `pending` (F-009, O-5): walk-ins the user left incomplete at a booking with both Flat
   *  Screen and C-Shaped — they have no Base Station Type yet, so they are held out of both
   *  rolls until completed (Figma 5622:159529). */
  onFinish: (flat: OnboardingTrainee[], cshaped: OnboardingTrainee[], pending?: OnboardingTrainee[]) => void;
}

type QueueItem = { existingId?: string; stationType?: "flat" | "cshaped"; walkin?: string; repeatOfFirst?: boolean };

export function ScanIdModal({ flatRoll, cshapedRoll, hasCShaped, numBase, numCShaped, unitName, roleOptions, weaponOptions, scannerInactive = false, onClose, onFinish }: ScanIdModalProps) {
  const flatStationLabels = Array.from({ length: Math.max(1, numBase) }, (_, i) => stationLabel(i));
  const cshapedStationLabels = Array.from({ length: Math.max(1, numCShaped) }, (_, i) => stationLabel(i));
  const [scanned, setScanned] = useState<OnboardingTrainee[]>([]);
  const [scanning, setScanning] = useState(!scannerInactive);
  const [fillTarget, setFillTarget] = useState<OnboardingTrainee | null>(null);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [incompleteError, setIncompleteError] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [doubleScanToast, setDoubleScanToast] = useState<string | null>(null);
  const queueRef = useRef<QueueItem[]>([]);

  useEffect(() => {
    const flatAbsentees: QueueItem[] = flatRoll.filter((t) => t.attendance === "Absent").map((t) => ({ existingId: t.id, stationType: "flat" as const }));
    const cshapedAbsentees: QueueItem[] = cshapedRoll.filter((t) => t.attendance === "Absent").map((t) => ({ existingId: t.id, stationType: "cshaped" as const }));
    const registered = [...flatAbsentees, ...cshapedAbsentees];
    // One repeated read of the first registered trainee, after DOUBLE_SCAN_AFTER scans.
    if (registered.length > DOUBLE_SCAN_AFTER) registered.splice(DOUBLE_SCAN_AFTER, 0, { repeatOfFirst: true });
    const walkins = WALKIN_NAMES.map((name) => ({ walkin: name }));
    queueRef.current = [...registered, ...walkins];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scanning) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const startTimer = setTimeout(() => {
      timer = setInterval(() => {
        const next = queueRef.current.shift();
        if (!next) {
          setScanning(false);
          clearInterval(timer);
          return;
        }
        if (next.repeatOfFirst) {
          // Same Service ID read twice: not added again, attendance already Present.
          setScanned((prev) => {
            const first = prev.find((t) => t.registration === "Registered");
            if (first) setDoubleScanToast(`Service ID ${first.svcId} (${first.name}) has already been scanned. Attendance is marked as present.`);
            return prev;
          });
          return;
        }
        if (next.existingId) {
          const base = (next.stationType === "flat" ? flatRoll : cshapedRoll).find((t) => t.id === next.existingId)!;
          const labels = next.stationType === "flat" ? flatStationLabels : cshapedStationLabels;
          const station = labels[Math.floor(Math.random() * labels.length)];
          const lane = laneOptionsFor(next.stationType!)[Math.floor(Math.random() * 12)];
          setScanned((prev) => [...prev, { ...base, attendance: "Present", baseStation: station, lane }]);
        } else if (next.walkin) {
          // Bounded so the index is valid whichever station type the walk-in
          // is eventually assigned to via "Complete Data".
          const boundedCount = Math.max(1, hasCShaped ? Math.min(numBase, numCShaped) : numBase);
          const station = stationLabel(Math.floor(Math.random() * boundedCount));
          const lane = laneOptionsFor("flat")[Math.floor(Math.random() * 12)];
          setScanned((prev) => [
            ...prev,
            {
              id: `walkin-${next.walkin}`,
              rank: "", name: next.walkin!, svcId: randomSvcId(), platoon: "", role: "", weapon: [],
              registration: "Non-Registered", attendance: "Present", lastUpdatedOn: formattedToday(), baseStation: station, lane,
              stationType: hasCShaped ? undefined : "flat",
            },
          ]);
        }
      }, 350);
    }, FIRST_SCAN_DELAY_MS);
    return () => { clearTimeout(startTimer); if (timer) clearInterval(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const latest = scanned[scanned.length - 1] ?? null;
  const incomplete = scanned.filter((t) => !isComplete(t, hasCShaped));

  const applyFillIn = (id: string, values: { name: string; rank: string; svcId: string; platoon: string; role: string; weapon: string[]; stationType?: "flat" | "cshaped" }) => {
    setScanned((prev) => prev.map((t) => (t.id === id ? { ...t, ...values } : t)));
    setFillTarget(null);
  };

  const handleFinishClick = () => {
    if (incomplete.length > 0) {
      setIncompleteError(false);
      setShowIncomplete(true);
      return;
    }
    finalize();
  };

  const finalize = (leaveIncomplete = false) => {
    // Existing roll rows: replaced with their scanned (Present) version if
    // scanned, otherwise left as-is (still Absent). New walk-ins (Non-
    // Registered) are appended to whichever roll their Base Station Type
    // says they belong to.
    const updatedFlat = flatRoll.map((t) => scanned.find((s) => s.id === t.id) ?? t);
    const updatedCshaped = cshapedRoll.map((t) => scanned.find((s) => s.id === t.id) ?? t);
    const walkins = scanned.filter((t) => !flatRoll.some((r) => r.id === t.id) && !cshapedRoll.some((r) => r.id === t.id));
    // F-009 (O-5): leaving with incomplete walk-ins. FS & CS — they have no Base Station
    // Type, so they stay out of both rolls ("won't appear in the Nominal Roll List", 5622:159529).
    // FS only — "They'll be saved to the Nominal Roll" (5626:192274): they go into the flat roll.
    const pending = leaveIncomplete && hasCShaped ? walkins.filter((t) => !isComplete(t, hasCShaped)) : [];
    const placed = walkins.filter((t) => !pending.includes(t));
    const flatWalkins = placed.filter((t) => t.stationType !== "cshaped");
    const cshapedWalkins = placed.filter((t) => t.stationType === "cshaped");
    onFinish([...updatedFlat, ...flatWalkins], [...updatedCshaped, ...cshapedWalkins], pending);
  };

  // F-009 (O-5): Figma `Confirmation - Close` (5622:159529 / 5626:192274) — an attempt to close
  // while a scanned walk-in is still incomplete asks first. Without incomplete walk-ins Close
  // keeps its old behaviour (closes without saving the scan).
  const requestClose = () => {
    if (incomplete.length > 0) setShowLeave(true);
    else onClose();
  };

  const scannedColumns = useMemo(() => [
    columnHelper.display({ id: "no", width: 56, header: () => "No.", cell: (info: any) => <span className="text-sm text-figma-body">{info.row.index + 1}</span> } as any),
    columnHelper.accessor("name", { width: 200, header: () => "Name", cell: (info: any) => <span className="text-sm font-semibold text-figma-default">{info.getValue()}</span> } as any),
    columnHelper.accessor("svcId", { width: 120, header: () => "Service ID", cell: (info: any) => <span className="text-sm text-figma-default">{info.getValue()}</span> } as any),
    columnHelper.display({ id: "baseStation", width: 120, header: () => "Base Station", cell: (info: any) => <span className="text-sm text-figma-default">{info.row.original.baseStation || "—"}</span> } as any),
    columnHelper.display({ id: "lane", width: 120, header: () => "Lane", cell: (info: any) => <span className="text-sm text-figma-default">{info.row.original.lane || "—"}</span> } as any),
    columnHelper.display({
      id: "registration",
      width: 160,
      header: () => "Registration",
      cell: (info: any) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full border text-xs font-semibold",
          info.row.original.registration === "Registered" ? "bg-figma-muted border-figma-subtle text-figma-default" : "bg-figma-infobg border-figma-infoborder text-figma-info"
        )}>
          {info.row.original.registration}
        </span>
      ),
    } as any),
    columnHelper.display({
      id: "actions",
      width: 140,
      header: () => <span className="block text-right">Actions</span>,
      cell: (info: any) => (
        <div className="flex justify-end">
          {!isComplete(info.row.original, hasCShaped) && (
            <button type="button" onClick={() => setFillTarget(info.row.original)} className="px-3 py-1 text-xs font-semibold text-figma-primary border border-figma-primary rounded-lg hover:bg-figma-primarysoft whitespace-nowrap">
              Complete Data
            </button>
          )}
        </div>
      ),
    } as any),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [hasCShaped]);

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={requestClose} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[min(94vw,1360px)] h-[min(91vh,820px)] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
            <h3 className="text-lg font-bold text-figma-default">Scan ID</h3>
            <button type="button" onClick={requestClose} aria-label="Close" className="text-figma-default hover:text-figma-body"><Icon name="x" size={18} /></button>
          </div>

          <div className="px-8 py-0 overflow-y-auto flex-1 grid grid-cols-[320px_1fr] gap-5">
            <div className="space-y-5">
              <div className="border border-figma-subtle rounded-lg p-5">
                <p className="text-base font-semibold text-figma-default mb-5">Scanner</p>
                {/* Figma `Scan ID - Scanner Inactive` (5474:158048): 12/500 danger Alert, 16px circle-alert. */}
                {scannerInactive && (
                  <div role="alert" className="mb-5 flex items-start gap-2.5 p-3 rounded-lg border border-danger bg-danger-invert-default text-danger">
                    <Icon name="circle-alert" size={16} className="flex-shrink-0" />
                    <p className="text-xs font-medium">Not detecting a scanner. Reconnect it or contact your admin if this continues.</p>
                  </div>
                )}
                <p className="text-xs text-figma-body mb-1">Scanner Status</p>
                <span className={cn(
                  "inline-block px-2 py-0.5 rounded-full border text-xs font-semibold",
                  scannerInactive ? "bg-figma-muted border-figma-subtle text-figma-default"
                    : scanning ? "bg-figma-successbg border-figma-successborder text-figma-success" : "bg-figma-muted border-figma-subtle text-figma-body"
                )}>
                  {scannerInactive ? "Inactive" : scanning ? "Scanning" : "Idle"}
                </span>
              </div>

              <div className="border border-figma-subtle rounded-lg p-5">
                <p className="text-base font-semibold text-figma-default mb-5">New Scanned Trainee</p>
                {!latest ? (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-12 h-12 rounded-full bg-figma-muted flex items-center justify-center">
                      <Icon name="user-round" size={24} className="text-figma-disabled" />
                    </div>
                    <p className="text-sm font-semibold text-figma-body">No trainee scanned yet</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {latest.registration === "Non-Registered" && !isComplete(latest, hasCShaped) && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-figma-infobg border border-figma-infoborder rounded-lg text-xs text-figma-info">
                        <Icon name="circle-alert" size={13} className="flex-shrink-0 mt-0.5" />
                        New non-registered trainee scanned. Please fill in the data
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs text-figma-body">Name</p>
                        <p className="text-sm font-semibold text-figma-default">{latest.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-figma-body">Service ID</p>
                        <p className="text-sm font-semibold text-figma-default font-mono">{latest.svcId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-figma-body">Base Station</p>
                        <p className="text-sm font-semibold text-figma-default">{latest.baseStation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-figma-body">Lane</p>
                        <p className="text-sm font-semibold text-figma-default">{latest.lane || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-figma-body mb-1">Registration</p>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-full border text-xs font-semibold",
                        latest.registration === "Registered" ? "bg-figma-muted border-figma-subtle text-figma-default" : "bg-figma-infobg border-figma-infoborder text-figma-info"
                      )}>
                        {latest.registration}
                      </span>
                    </div>
                    {!isComplete(latest, hasCShaped) && (
                      <button
                        type="button"
                        onClick={() => setFillTarget(latest)}
                        className="w-full py-2 text-sm font-semibold text-figma-primary border border-figma-primary rounded-lg hover:bg-figma-primarysoft"
                      >
                        Complete Data
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border border-figma-subtle rounded-lg overflow-hidden flex flex-col">
              <div className="p-5 flex items-center gap-2">
                <p className="text-base font-semibold text-figma-default">Scanned Trainees</p>
                <span className="text-base font-semibold text-figma-body">{scanned.length}</span>
              </div>
              <TableCustom
                columns={scannedColumns}
                data={scanned}
                actionSticky={false}
              classThead="bg-figma-dangersoft/70"
                classTheadTh="text-figma-primary text-xs font-semibold"
                className={scanned.length === 0 ? "[&_tbody_td>div]:py-[180px]" : undefined}
                getRowClass={(t: OnboardingTrainee) => (!isComplete(t, hasCShaped) ? "[&>td:first-child]:shadow-[inset_4px_0_0_rgb(var(--color-text-danger))]" : "")}
                emptyIcon={<Icon name="save-all" size={24} className="text-disabled" />}
                emptySubtitle="This table will be automatically updated once users take action"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 flex-shrink-0">
            <button type="button" onClick={requestClose} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Close
            </button>
            <button type="button" onClick={handleFinishClick} className="px-4 py-2 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg">
              Finish Scanning
            </button>
          </div>
        </div>
      </div>

      {fillTarget && (
        <EditTraineeDrawer
          mode="edit"
          initial={fillTarget}
          unitName={unitName}
          roleOptions={roleOptions}
          weaponOptions={weaponOptions}
          hasCShaped={hasCShaped}
          onClose={() => setFillTarget(null)}
          onSubmit={(values) => applyFillIn(fillTarget.id, values)}
        />
      )}

      {showIncomplete && (
        <CompleteTraineeDetailsModal
          trainees={incomplete}
          showError={incompleteError}
          onCompleteDetails={setFillTarget}
          onClose={() => (incomplete.length > 0 ? setShowLeave(true) : setShowIncomplete(false))}
          onConfirm={() => {
            if (incomplete.length > 0) { setIncompleteError(true); return; }
            setShowIncomplete(false);
            finalize();
          }}
        />
      )}

      <LeaveIncompleteDialog
        open={showLeave}
        count={incomplete.length}
        hasCShaped={hasCShaped}
        onContinue={() => setShowLeave(false)}
        onLeave={() => { setShowLeave(false); setShowIncomplete(false); finalize(true); }}
      />

      <Toast tone="warning" placement="top-right" offsetTop={24} open={!!doubleScanToast} message={doubleScanToast ?? ""} duration={4000} onDismiss={() => setDoubleScanToast(null)} />
    </>
  );
}

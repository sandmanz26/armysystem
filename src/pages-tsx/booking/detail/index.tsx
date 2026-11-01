import { useState, useRef, useEffect, useMemo } from "react";
import type { Booking } from "./types";
import { useBookingStore } from "./store/useBookingStore";
import { NominalRollTable } from "./components/NominalRollTable";
import { LaneConfigTable } from "./components/LaneConfigTable";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { ReissueModal } from "./modals/ReissueModal";
import { ReassignBaseStationModal } from "./modals/ReassignBaseStationModal";
import { MassAssignTraineesModal } from "./modals/MassAssignTraineesModal";
import { AddTraineeModal } from "./modals/AddTraineeModal";
import { EditTraineeSidebar } from "./components/EditTraineeSidebar";
import type { EditTraineeValues } from "./components/EditTraineeSidebar";
import { Button } from "@/components/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import {
  ChevronDown, ChevronUp, Check, Upload,
  MoreVertical, Plus, X, Calendar, Clock, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bookings } from "@/data/mock";

// ── Booking structure data (weapons / stations / lanes) ──────────────────────
// Used for building the BOOKING object and the Zustand store.
// NOT used for Booking Detail Nominal Roll.
const BOOKING_DATA = {
  weapons: [
    { type: "SAR21", units: 1 },
    { type: "LMG", units: 1 },
  ],
  baseStations: [
    { label: "05 Jun 2026 in station WPT-01", value: "WPT-01" },
  ],
  cShapedStations: [],
  laneConfig: [
    { lane: "Lane 1", weapon: "SAR21", status: "On" },
    { lane: "Lane 2", weapon: "SAR21", status: "On" },
    { lane: "Lane 3", weapon: "SAR21", status: "On" },
    { lane: "Lane 4", weapon: "SAR21", status: "On" },
    { lane: "Lane 5", weapon: "SAR21", status: "On" },
    { lane: "Lane 6", weapon: "SAR21", status: "On" },
    { lane: "Lane 7", weapon: "SAR21", status: "On" },
    { lane: "Lane 8", weapon: "SAR21", status: "On" },
    { lane: "Lane 9", weapon: "SAR21", status: "On" },
    { lane: "Lane 10", weapon: "SAR21", status: "On" },
  ],
  // Onboarding attendance list — fed into the Zustand store so OnboardingFlow
  // (AttendanceStep) can load it.  Completely separate from Detail Nominal Roll.
  trainees: Array.from({ length: 32 }, (_, i) => ({
    no: i + 1,
    rank: "REC",
    name: [
      "Roger Botosh","Davis Culhane","Kadin Torff","Craig Septimus","Roger Septimus",
      "Jaxson Donin","James Lubin","Jakob Vaccaro","Ruben Calzoni","Jake Pascal",
      "Ahmad Rizal","David Tan","Ravi Kumar","Jason Lim","Mohamed Ali",
      "Wei Ming Lee","Kai En Tan","Ismail Yusof","Guo Liang Chen","Farid Rahman",
      "Zhen Wei Liu","Hari Kumar","Siva Nathan","Yong Sheng Ng","Boon Kiat Lim",
      "Jun Wei Chua","Kai Xuan Teo","Shi Hao Sim","Reuben Tan","Ethan Yap",
      "Dylan Koh","Marcus Low",
    ][i] ?? `Trainee ${i + 1}`,
    svcId: "****212A",
    platoon: `Platoon ${(i % 2) + 1}`,
    weaponType: "SAR21",
  })),
};

// ── Booking Detail Nominal Roll — independent dataset ─────────────────────────
// This is the registered trainee list shown in the Booking Detail tab.
// Managed via local React state in BookingDetail; never shared with OnboardingFlow.
const NOMINAL_ROLL_NAMES = [
  "Roger Botosh","Davis Culhane","Kadin Torff","Craig Septimus","Roger Septimus",
  "Jaxson Donin","James Lubin","Jakob Vaccaro","Ruben Calzoni","Jake Pascal",
  "Ahmad Rizal","David Tan","Ravi Kumar","Jason Lim","Mohamed Ali",
  "Wei Ming Lee","Kai En Tan","Ismail Yusof","Guo Liang Chen","Farid Rahman",
  "Zhen Wei Liu","Hari Kumar","Siva Nathan","Yong Sheng Ng","Boon Kiat Lim",
  "Jun Wei Chua","Kai Xuan Teo","Shi Hao Sim","Reuben Tan","Ethan Yap",
  "Dylan Koh","Marcus Low",
];
const makeDetailTrainees = (count: number) => Array.from({ length: count }, (_, i) => ({
  rank: "REC",
  name: NOMINAL_ROLL_NAMES[i] ?? `Trainee ${i + 1}`,
  svcId: "****212A",
  platoon: `Platoon ${(i % 2) + 1}`,
  weaponType: "SAR21",
}));

// Flat Screen / C-Shaped master station lists — used to populate the
// "Reassign Base Station" dropdown options (mirrors src/data/mock.ts naming).
const FLAT_STATION_OPTIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05", "WPT-06"];
const CSHAPED_STATION_OPTIONS = ["C-Shaped 01", "C-Shaped 02", "C-Shaped 03", "C-Shaped 04"];

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-gray-800">{value ?? "—"}</dd>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOKING DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════════

type DetailTab = "Booking Details" | "Nominal Rolls" | "Lane Configuration" | "Errors";

// One entry per Service ID conflict raised by Add Trainee — the new row is held here
// (never merged into `trainees`) until Admin picks Keep New or Keep Old.
interface TraineeConflict {
  id: string;
  newData: { rank: string; name: string; svcId: string; platoon: string; weaponType: string };
  existingIndex: number;
}

export function BookingDetail() {
  const [activeTab, setActiveTab] = useState<DetailTab>("Booking Details");
  const [issueDropOpen, setIssueDropOpen] = useState(false);
  const [showReissue, setShowReissue] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddTrainee, setShowAddTrainee] = useState(false);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [editTrainee, setEditTrainee] = useState<EditTraineeValues | null>(null);
  const [traineeDeleteConfirm, setTraineeDeleteConfirm] = useState<number | null>(null);
  const [selectedTrainees, setSelectedTrainees] = useState<Set<number>>(new Set());
  const [showMassAssign, setShowMassAssign] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<{ station: string; type: "Flat Screen" | "C-Shaped" } | null>(null);
  const [stationOverrides, setStationOverrides] = useState<Record<string, string>>({});
  const [errorTrainees, setErrorTrainees] = useState<TraineeConflict[]>([]);
  const dotMenuRef = useRef<HTMLDivElement>(null);
  const setBooking = useBookingStore((s) => s.setBooking);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target as Node)) setShowDotMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // The Errors tab only exists while there's something to resolve — once the
  // last conflict is cleared, fall back to Nominal Rolls instead of showing
  // an empty/missing tab.
  useEffect(() => {
    if (activeTab === "Errors" && errorTrainees.length === 0) setActiveTab("Nominal Rolls");
  }, [activeTab, errorTrainees.length]);

  const tabs: DetailTab[] = [
    "Booking Details", "Nominal Rolls", "Lane Configuration",
    ...(errorTrainees.length > 0 ? (["Errors"] as DetailTab[]) : []),
  ];

  const getBookingData = () => {
    const params = new URLSearchParams(window.location.search);
    let bookingId = params.get("id");
    if (!bookingId) {
      const hashMatch = window.location.hash.match(/\?id=([^&]+)/);
      if (hashMatch) bookingId = hashMatch[1];
    }
    return bookings.find(b => b.id === (bookingId || "1"));
  };

  const selectedBooking = getBookingData();

  // Booking Detail Nominal Roll — independent from OnboardingFlow trainee list.
  // Seeded from the booking's actual traineesCount so it matches the "N Trainee(s)" shown above.
  const [trainees, setTrainees] = useState<any[]>(() => makeDetailTrainees(selectedBooking?.traineesCount ?? 0));

  const BOOKING = useMemo<Booking>(() => selectedBooking ? {
    ...BOOKING_DATA,
    id: selectedBooking.bookingId,
    title: selectedBooking.program,
    status: selectedBooking.status,
    date: selectedBooking.bookingDate,
    time: selectedBooking.bookingTime,
    program: selectedBooking.program,
    trainingMode: selectedBooking.trainingMode,
    briefingRoom: selectedBooking.briefingRoom ?? "Briefing Room 1",
    sectionType: "Standalone",
    courseware: selectedBooking.courseware,
    weapons: (selectedBooking.weaponTypes && selectedBooking.weaponTypes.length > 0
      ? selectedBooking.weaponTypes
      : selectedBooking.weapon.split(",").map((w) => w.trim())
    ).map((type) => ({ type, units: 1 })),
    baseStations: (selectedBooking.assignedStations && selectedBooking.assignedStations.length > 0
      ? selectedBooking.assignedStations
      : Array.from({ length: selectedBooking.baseStationQty ?? 1 }, (_, i) => `WPT-${String(i + 1).padStart(2, "0")}`)
    ).map((name) => ({ label: `${selectedBooking.bookingDate} in station ${name}`, value: name })),
    cShapedStations: (selectedBooking.assignedCShapedStations ?? []).map((label) => ({ label, value: label })),
    traineesCount: selectedBooking.traineesCount ?? 0,
    trainingType: selectedBooking.trainingType,
    assignmentId: selectedBooking.assetIssued ? (selectedBooking.assignmentId ?? "—") : "—",
    ftmsFile: selectedBooking.ftmsFileId != null ? String(selectedBooking.ftmsFileId) : "—",
    isIntegrated: false,
    operatorName: "Liam Johansson",
    instructorName: selectedBooking.instructorName ?? "—",
    unitContactDetails: "0191 8912 81",
  } : {
    ...BOOKING_DATA,
    id: "#111024-KC0004",
    title: "WPT Training for Unit 19",
    status: "Upcoming",
    date: "10 January 2025",
    time: "08:00 AM – 06:00 PM (Full Day)",
    program: "WPT Training",
    trainingMode: "Collective",
    briefingRoom: "Briefing Room 1",
    sectionType: "Standalone",
    courseware: "Component Type Training B",
    traineesCount: 32,
    trainingType: "Group",
    assignmentId: "—",
    ftmsFile: "202412231456",
    isIntegrated: false,
    operatorName: "Liam Johansson",
    instructorName: "—",
    unitContactDetails: "0191 8912 81",
  }, [selectedBooking]);

  useEffect(() => {
    setBooking(BOOKING);
  }, [BOOKING, setBooking]);

  // ── Nominal Roll: per-courseware station config (mirrors Create Booking logic) ──
  const coursewareList = useMemo(
    () => (BOOKING.courseware ? BOOKING.courseware.split(",").map((c) => c.trim()).filter(Boolean) : []),
    [BOOKING.courseware]
  );
  const [activeCourseware, setActiveCourseware] = useState(() => coursewareList[0] ?? "");
  const [activeStationType, setActiveStationType] = useState<"Flat Screen" | "C-Shaped">("Flat Screen");

  useEffect(() => {
    setActiveCourseware(coursewareList[0] ?? "");
  }, [coursewareList]);

  // Station counts sourced from the actual booking's assigned stations
  // (BOOKING.baseStations / BOOKING.cShapedStations, synced from mock booking
  // data) — the mock model doesn't track station allocation per-courseware,
  // so the same real totals apply regardless of which courseware is active.
  const showCShapedTab = BOOKING.cShapedStations.length > 0;

  useEffect(() => {
    setActiveStationType("Flat Screen");
  }, [activeCourseware]);

  if (showOnboarding) {
    return <OnboardingFlow onClose={() => setShowOnboarding(false)} />;
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-1 gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-xl font-semibold text-brand-primary">{BOOKING.title}</h1>
                {BOOKING.status === "Completed with Missing Assets" ? (
                  <>
                    <StatusBadge status="Completed" size="sm" />
                    <span className="text-xs font-medium text-red-500">- with Missing Assets</span>
                  </>
                ) : (
                  <StatusBadge status={BOOKING.status} size="sm" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{BOOKING.id}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                  {BOOKING.date}
                </span>
                {(() => {
                  const raw = BOOKING.time ?? "";
                  const timeMatch = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)).*?[-–].*?(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                  const labelMatch = raw.match(/\(([^)]+(?:Schedule|Session|Day))\)/i);
                  return (
                    <>
                      {timeMatch && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} className="text-gray-400 flex-shrink-0" />
                          {timeMatch[1]} – {timeMatch[2]}
                        </span>
                      )}
                      {labelMatch && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
                          {labelMatch[1]}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Issue Assets dropdown — Group only */}
              {BOOKING.trainingType === "Group" && BOOKING.status !== "Overdue" && (
                <div className="relative">
                  <Button
                    type="outline"
                    onClick={() => setIssueDropOpen(!issueDropOpen)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 w-auto border border-gray-300"
                  >
                    Issue Assets
                    {issueDropOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                  {issueDropOpen && (
                    <div className="absolute right-0 mt-1 w-68 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button type="button" onClick={() => { setIssueDropOpen(false); window.location.href = `/system-hardware/assignments/new?bookingId=${selectedBooking?.id}&fromBooking=true`; }}
                        className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">
                        Issue Assets
                      </button>
                      <button type="button" onClick={() => { setIssueDropOpen(false); setShowReissue(true); }}
                        className="w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
                        Reissue Assets from Another Booking
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Start Onboarding / Continue Session — Group only */}
              {BOOKING.trainingType === "Group" && ["Ongoing", "Upcoming", "Return Assets", "Completed"].includes(BOOKING.status) && (
                <Button
                  disabled={!selectedBooking?.assetIssued}
                  onClick={() => {
                    if (!selectedBooking?.assetIssued) return;
                    setShowOnboarding(true);
                  }}
                  title={!selectedBooking?.assetIssued ? "Issue assets first to enable this action" : undefined}
                  className={cn(
                    "px-5 py-2.5 text-sm font-semibold w-auto",
                    selectedBooking?.assetIssued
                      ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                      : "bg-gray-400 text-white"
                  )}
                >
                  {BOOKING.status === "Ongoing" ? "Continue Session" : "Start Onboarding"}
                </Button>
              )}

              {BOOKING.status === "Return Assets" && (
                <Button
                  type="button"
                  className="px-5 py-2.5 text-sm font-semibold w-auto bg-[#7B2D1E] text-white hover:bg-[#5E1E12]"
                >
                  Complete With Missing Assets
                </Button>
              )}

              <div className="relative" ref={dotMenuRef}>
                <Button
                  type="outline"
                  onClick={() => setShowDotMenu(v => !v)}
                  className="h-10 w-auto px-2.5 flex items-center justify-center border border-gray-200 text-gray-500 aspect-square"
                >
                  <MoreVertical size={16} />
                </Button>

                {showDotMenu && ["Upcoming", "Return Assets", "Completed with Missing Assets"].includes(BOOKING.status) && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                    {((): { icon: React.ReactNode; label: string; danger?: boolean; disabled?: boolean; disabledReason?: string }[] => {
                      const isReturnPhase = BOOKING.status === "Return Assets" || BOOKING.status === "Completed with Missing Assets";
                      const isGroup = BOOKING.trainingType === "Group";
                      return [
                        // Asset actions — Group bookings only
                        ...(isGroup ? [{
                          icon: <Plus size={15} />,
                          label: "Top Up Assets",
                          disabled: isReturnPhase || !selectedBooking?.assetIssued,
                          disabledReason: isReturnPhase ? "Training already completed" : "Issue assets first",
                        }] : []),
                        ...(isGroup ? [{
                          icon: <Check size={15} />,
                          label: "Ready For Return Assets",
                          disabled: BOOKING.status === "Upcoming",
                          disabledReason: "Available after training is complete",
                        }] : []),
                        ...(isGroup && isReturnPhase ? [{
                          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
                          label: "Return Assets",
                        }] : []),
                        // Common actions — both Group and Individual
                        {
                          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                          label: "Reschedule",
                          disabled: isReturnPhase,
                          disabledReason: "Booking already completed",
                        },
                        {
                          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>,
                          label: "Assign Briefing Room",
                          disabled: isReturnPhase,
                          disabledReason: "Booking already completed",
                        },
                        {
                          icon: <X size={15} />,
                          label: "Cancel Booking",
                          danger: true,
                          disabled: isReturnPhase,
                          disabledReason: "Booking already completed",
                        },
                      ];
                    })().map(({ icon, label, danger, disabled, disabledReason }) => (
                      <button key={label} type="button"
                        disabled={disabled}
                        onClick={() => { if (!disabled) setShowDotMenu(false); }}
                        title={disabled ? disabledReason : undefined}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                          disabled
                            ? "text-gray-300 cursor-not-allowed"
                            : danger
                            ? "text-red-500 hover:bg-red-50 cursor-pointer"
                            : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                        )}>
                        <span className={cn("flex-shrink-0", disabled ? "opacity-40" : danger ? "text-red-400" : "text-gray-400")}>
                          {icon}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 border-b border-gray-200 mb-6">
            {tabs.map((tab: any) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={cn("flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700")}>
                {tab}
                {tab === "Errors" && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold">
                    {errorTrainees.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Booking Details */}
          {activeTab === "Booking Details" && (
            <div className="space-y-5">
              {/* Training Information — flat label+value, no chip badges */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-5">Training Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <Field label="Program" value={BOOKING.program} />
                  <Field label="Training Mode" value={BOOKING.trainingMode} />
                  <Field label="Briefing Room" value={BOOKING.briefingRoom} />
                  <Field label="Training Type" value={BOOKING.trainingType} />
                  <Field label="Courseware" value={BOOKING.courseware} />
                  <Field label="Trainee(s)" value={`${BOOKING.traineesCount} Trainee(s)`} />
                  <Field label="FTMS File ID" value={BOOKING.ftmsFile} />
                  <Field
                    label="Assignment ID"
                    value={
                      selectedBooking?.assetIssued ? (
                        <span className="flex items-center gap-2">
                          {BOOKING.assignmentId}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-600">
                            Issued
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-orange-50 text-orange-500 border border-orange-200">
                          Not Issued
                        </span>
                      )
                    }
                  />
                  <Field label="Operator Name" value={BOOKING.operatorName ?? "—"} />
                  <Field label="Instructor Name" value={BOOKING.instructorName ?? "—"} />
                  <Field label="Unit Contact Details" value={BOOKING.unitContactDetails ?? "—"} />
                </dl>
              </div>

              {/* Weapon Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-4">
                  Weapon Type ({BOOKING.weapons.length} Type{BOOKING.weapons.length !== 1 ? "s" : ""})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {BOOKING.weapons.map((w: any) => (
                    <span
                      key={w.type}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
                    >
                      {w.type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Base Station Quantity */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-4">
                  Base Station Quantity ({BOOKING.baseStations.length + BOOKING.cShapedStations.length} Station{(BOOKING.baseStations.length + BOOKING.cShapedStations.length) !== 1 ? "s" : ""})
                </h2>
                <div className="space-y-2">
                  {[
                    ...BOOKING.baseStations.map((s: any) => ({ value: stationOverrides[s.value] ?? s.value, type: "Flat Screen" as const })),
                    ...BOOKING.cShapedStations.map((s: any) => ({ value: stationOverrides[s.value] ?? s.value, type: "C-Shaped" as const })),
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-gray-800">{s.value}</span>
                        <span className={cn(
                          "text-[10px] font-semibold rounded-full px-2.5 py-1",
                          s.type === "Flat Screen" ? "bg-brand-primary/10 text-brand-primary" : "bg-purple-50 text-purple-600"
                        )}>
                          {s.type}
                        </span>
                      </div>
                      {!["Completed", "Completed with Missing Assets", "Cancelled", "Overdue"].includes(BOOKING.status) && (
                        <button
                          type="button"
                          onClick={() => setReassignTarget({ station: s.value, type: s.type })}
                          className="text-xs font-medium text-brand-primary border border-brand-primary rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                          Reassign Base Station
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab: Nominal Rolls */}
          {activeTab === "Nominal Rolls" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-col gap-2.5">
                  {/* Courseware selector — always shown first */}
                  {coursewareList.length > 1 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {coursewareList.map((cw) => (
                        <button
                          key={cw}
                          type="button"
                          onClick={() => setActiveCourseware(cw)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                            activeCourseware === cw
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
                          )}
                        >
                          {cw}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative w-fit">
                      <select className="appearance-none text-sm text-gray-700 border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer min-w-[220px]">
                        <option>{BOOKING.courseware || "Night Test for SAR21/M16 BTP"}</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                  {/* Station type sub-tabs — shown when this booking has C-Shaped stations assigned */}
                  {showCShapedTab && (
                    <div className="flex items-center gap-2">
                      {(["Flat Screen", "C-Shaped"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setActiveStationType(type)}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                            activeStationType === type
                              ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {BOOKING.status === "Upcoming" && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="outline"
                      disabled={selectedTrainees.size === 0}
                      onClick={() => setShowMassAssign(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200 disabled:opacity-50"
                    >
                      Mass Assign{selectedTrainees.size > 0 ? ` (${selectedTrainees.size})` : ""}
                    </Button>
                    <Button
                      type="outline"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 w-auto border border-gray-200"
                    >
                      <Upload size={14} /> Upload List
                    </Button>
                    <Button
                      onClick={() => setShowAddTrainee(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
                    >
                      <Plus size={14} /> Add Trainee
                    </Button>
                  </div>
                )}
              </div>
              <NominalRollTable
                trainees={trainees}
                status={BOOKING.status}
                selected={selectedTrainees}
                onToggleSelect={(idx) => setSelectedTrainees((prev) => {
                  const next = new Set(prev);
                  if (next.has(idx)) next.delete(idx); else next.add(idx);
                  return next;
                })}
                onToggleSelectAll={() => setSelectedTrainees((prev) =>
                  prev.size === trainees.length ? new Set() : new Set(trainees.map((_, i) => i))
                )}
                onEdit={(trainee, _idx) => setEditTrainee({
                  rank: trainee.rank ?? "",
                  name: trainee.name ?? "",
                  svcId: trainee.svcId ?? "",
                  platoon: trainee.platoon ?? "",
                  weaponType: trainee.weaponType ?? "",
                  unitName: BOOKING.title?.replace(/WPT Group Training for Unit */i, "") ?? "",
                })}
                onDelete={(idx) => setTraineeDeleteConfirm(idx)}
              />
            </div>
          )}

          {/* Tab: Errors — Service ID conflicts raised by Add Trainee, held here until resolved */}
          {activeTab === "Errors" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-amber-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-800">Duplicate Service ID — needs resolution</div>
                  <p className="text-xs text-gray-400 mt-0.5">The Service ID below already exists in this Nominal Roll. Pick which data to keep.</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {errorTrainees.map((conflict) => {
                  const existing = trainees[conflict.existingIndex];
                  return (
                    <div key={conflict.id} className="px-5 py-4">
                      <div className="text-xs font-mono text-gray-400 mb-3">Service ID {conflict.newData.svcId}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Existing (already in roll)</div>
                          <dl className="space-y-1 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-400">Rank</dt><dd className="text-gray-800 font-medium">{existing?.rank ?? "—"}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Name</dt><dd className="text-gray-800 font-medium">{existing?.name ?? "—"}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Platoon</dt><dd className="text-gray-800 font-medium">{existing?.platoon ?? "—"}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Weapon</dt><dd className="text-gray-800 font-medium">{existing?.weaponType ?? "—"}</dd></div>
                          </dl>
                        </div>
                        <div className="border border-brand-primary/30 bg-red-50/30 rounded-lg p-3">
                          <div className="text-[11px] font-semibold text-brand-primary uppercase tracking-wide mb-2">New (just added)</div>
                          <dl className="space-y-1 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-400">Rank</dt><dd className="text-gray-800 font-medium">{conflict.newData.rank}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Name</dt><dd className="text-gray-800 font-medium">{conflict.newData.name}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Platoon</dt><dd className="text-gray-800 font-medium">{conflict.newData.platoon}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-400">Weapon</dt><dd className="text-gray-800 font-medium">{conflict.newData.weaponType}</dd></div>
                          </dl>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          type="outline"
                          onClick={() => setErrorTrainees((prev) => prev.filter((c) => c.id !== conflict.id))}
                          className="px-4 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 w-auto"
                        >
                          Keep Old
                        </Button>
                        <Button
                          onClick={() => {
                            setTrainees((prev) => prev.map((t, i) =>
                              i === conflict.existingIndex
                                ? { ...conflict.newData, lastUpdated: new Date().toLocaleDateString() }
                                : t
                            ));
                            setErrorTrainees((prev) => prev.filter((c) => c.id !== conflict.id));
                          }}
                          className="px-4 py-1.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover w-auto"
                        >
                          Keep New
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showAddTrainee && (
            <AddTraineeModal
              isOpen={showAddTrainee}
              onClose={() => setShowAddTrainee(false)}
              onSubmit={(vals) => {
                // Adding a trainee whose Service ID already exists in this roll creates
                // duplicate/conflicting data — route it to the Errors tab instead
                // of merging it straight into the Nominal Roll.
                const existingIndex = trainees.findIndex((t) => t.svcId === vals.svcId);
                if (existingIndex !== -1) {
                  setErrorTrainees((prev) => [
                    ...prev,
                    { id: `conflict-${Date.now()}`, newData: vals, existingIndex },
                  ]);
                  setActiveTab("Errors");
                  return;
                }
                setTrainees((prev) => [...prev, { ...vals, lastUpdated: new Date().toLocaleDateString() }]);
              }}
              unitName={BOOKING.title?.replace(/WPT Group Training for Unit */i, "") ?? ""}
            />
          )}

          <EditTraineeSidebar
            open={editTrainee !== null}
            trainee={editTrainee}
            onClose={() => setEditTrainee(null)}
            onSubmit={(vals) => {
              console.log("Edit trainee:", vals);
              setEditTrainee(null);
            }}
          />

          {/* Tab: Lane Configuration */}
          {activeTab === "Lane Configuration" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 pt-4 flex flex-col gap-2.5">
                {/* Courseware selector — always shown first */}
                {coursewareList.length > 1 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {coursewareList.map((cw) => (
                      <button
                        key={cw}
                        type="button"
                        onClick={() => setActiveCourseware(cw)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                          activeCourseware === cw
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
                        )}
                      >
                        {cw}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative w-fit">
                    <select className="appearance-none text-sm text-gray-700 border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer min-w-[220px]">
                      <option>{BOOKING.courseware || "Night Test for SAR21/M16 BTP"}</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
                {/* Station type sub-tabs — shown when this booking has C-Shaped stations assigned */}
                {showCShapedTab && (
                  <div className="flex items-center gap-2">
                    {(["Flat Screen", "C-Shaped"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveStationType(type)}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                          activeStationType === type
                            ? "bg-brand-primary/10 text-brand-primary border-brand-primary/40"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">Lane Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
                {(activeStationType === "Flat Screen" ? BOOKING.baseStations : BOOKING.cShapedStations).map((station) => (
                  <div key={station.value} className="border border-gray-100 rounded-lg p-4 min-w-0">
                    <p className="text-xs text-gray-400 mb-3">{station.value} — {activeCourseware || BOOKING.courseware}</p>
                    <LaneConfigTable laneConfig={BOOKING.laneConfig} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReissue && <ReissueModal open={showReissue} onClose={() => setShowReissue(false)} />}

      {reassignTarget && (
        <ReassignBaseStationModal
          open={!!reassignTarget}
          onClose={() => setReassignTarget(null)}
          currentStation={reassignTarget.station}
          options={reassignTarget.type === "Flat Screen" ? FLAT_STATION_OPTIONS : CSHAPED_STATION_OPTIONS}
          onConfirm={(newStation) => setStationOverrides((prev) => ({ ...prev, [reassignTarget.station]: newStation }))}
        />
      )}

      {showMassAssign && (
        <MassAssignTraineesModal
          open={showMassAssign}
          onClose={() => setShowMassAssign(false)}
          count={selectedTrainees.size}
          onConfirm={(weaponType) => {
            setTrainees((prev) => prev.map((t, i) => selectedTrainees.has(i) ? { ...t, weaponType } : t));
            setSelectedTrainees(new Set());
          }}
        />
      )}

      {traineeDeleteConfirm !== null && (
        <DeleteConfirmDialog
          message="Are you sure you want to remove this trainee from the nominal roll?"
          onCancel={() => setTraineeDeleteConfirm(null)}
          onConfirm={() => {
            setTrainees((prev) => prev.filter((_, i) => i !== traineeDeleteConfirm));
            setTraineeDeleteConfirm(null);
          }}
        />
      )}

    </>
  );
}

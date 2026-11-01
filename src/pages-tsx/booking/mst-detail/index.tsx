import { useState, useRef, useEffect, useMemo } from "react";
import type { Booking } from "./types";
import { useBookingStore } from "./store/useBookingStore";
import { NominalRollTable } from "./components/NominalRollTable";
import { MSTNominalRollDetail } from "./components/MSTNominalRollDetail";
import { MSTDetailListTab } from "./components/MSTDetailListTab";
import { TCTDetailListTab } from "./components/TCTDetailListTab";
import { LaneConfigTable } from "./components/LaneConfigTable";
import { BookingDetailListTab } from "./components/BookingDetailListTab";
import { MSTCabinConfigStep, BASE_STATION_OPTIONS_TCT } from "../mst-create/components/MSTCabinConfigStep";
import type { CabinRow, IosEntry } from "../mst-create/components/MSTCabinConfigStep";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { MSTOnboardingFlow } from "./components/MSTOnboardingFlow";
import { MSTTCTOnboardingFlow } from "./components/MSTTCTOnboardingFlow";
import { ReissueModal } from "./modals/ReissueModal";
import { AddTraineeModal } from "./modals/AddTraineeModal";
import { ExportBookingModal, type ExportScope, type ExportFormat } from "./modals/ExportBookingModal";
import { Button } from "@/components/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ChevronDown, ChevronUp, Check, Upload, Download,
  MoreVertical, Plus, X, Calendar, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mstBookings as bookings } from "@/data/mst-mock";
import { getMSTLocalBookingById, mstLocalBookingToBooking, getTCTLocalBookingById, tctLocalBookingToBooking } from "@/data/localBookings";
import { useActiveProgramStore } from "@/store/useActiveProgramStore";

// ── Pre-filled cabin data for Booking Detail view (demo) ─────────────────────
const DETAIL_DEMO_CABINS: CabinRow[] = [
  { id: "MST01", occupied: false, selected: true,  callSign: "09",  weaponVariant: "40AGL", role: "VO,VC"     },
  { id: "MST02", occupied: false, selected: true,  callSign: "09Z", weaponVariant: "40AGL", role: "TC/PC,SC"  },
  { id: "MST03", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
  { id: "MST04", occupied: false, selected: true,  callSign: "08",  weaponVariant: "50HMG", role: "SO,VO"     },
  { id: "MST05", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
  { id: "MST06", occupied: false, selected: false, callSign: "08Z", weaponVariant: "50HMG", role: "VC"        },
  { id: "MST07", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
  { id: "MST08", occupied: false, selected: false, callSign: "07",  weaponVariant: "40AGL", role: "TC"        },
  { id: "MST09", occupied: false, unavailable: true, selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "MST10", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
  { id: "MST11", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
  { id: "MST12", occupied: true,  selected: false, callSign: "",    weaponVariant: "",      role: ""          },
];

const DETAIL_DEMO_IOS_LIST: IosEntry[] = [
  { uid: 1, iosDevice: "MSTIOS02", baseStation: "BMS1ForceSide", masterIOS: "Yes",  forceType: "Opposing" },
  { uid: 2, iosDevice: "MSTIOS01", baseStation: "BMS1ForceSide", masterIOS: "No",   forceType: "Friendly" },
];

// ── Pre-filled cluster data for TCT's Cluster Configuration tab (demo) ───────
// Same shape/component as MST's Cabin Configuration — TCT just has more units
// (up to 16 shown here) and includes the SC role.
const DETAIL_DEMO_CLUSTERS: CabinRow[] = [
  { id: "TCT01", occupied: false, selected: true,  callSign: "11Z",  weaponVariant: "40AGL", role: "VO,VC"     },
  { id: "TCT02", occupied: false, selected: true,  callSign: "12Z",  weaponVariant: "40AGL", role: "TC,SC"     },
  { id: "TCT03", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT04", occupied: false, selected: true,  callSign: "13SZ", weaponVariant: "50HMG", role: "SO,VO"     },
  { id: "TCT05", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT06", occupied: false, selected: false, callSign: "14Z",  weaponVariant: "50HMG", role: "VC"        },
  { id: "TCT07", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT08", occupied: false, selected: false, callSign: "15SZ", weaponVariant: "MORTAL", role: "TC"       },
  { id: "TCT09", occupied: false, unavailable: true, selected: false, callSign: "", weaponVariant: "", role: "" },
  { id: "TCT10", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT11", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT12", occupied: true,  selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT13", occupied: false, selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT14", occupied: false, selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT15", occupied: false, selected: false, callSign: "",     weaponVariant: "",      role: ""          },
  { id: "TCT16", occupied: false, selected: false, callSign: "",     weaponVariant: "",      role: ""          },
];

const DETAIL_DEMO_TCT_IOS_LIST: IosEntry[] = [
  { uid: 1, iosDevice: "TCTIOS01", baseStation: "BMS1ForceSide", masterIOS: "Yes",  forceType: "Opposing" },
  { uid: 2, iosDevice: "TCTIOS02", baseStation: "BMS2ForceSide", masterIOS: "No",   forceType: "Friendly" },
];

// ── Mock booking base data ────────────────────────────────────────────────────
const BOOKING_DATA = {
  weapons: [
    { type: "SAR21", units: 1 },
    { type: "SPIKE SR", units: 2 },
    { type: "GPMG", units: 1 },
    { type: "MATADOR", units: 2 },
    { type: "SPIKE LR", units: 1 },
  ],
  baseStations: [
    { label: "Base Station Assignment", value: "MST-01" },
    { label: "Base Station Assignment", value: "MST-02" },
  ],
  cShapedStations: [
    { label: "C-Shaped Station Assignment", value: "MST-04" },
    { label: "C-Shaped Station Assignment", value: "MST-05" },
  ],
  laneConfig: [
    { lane: "Lane 1", weapon: "SAR21", status: "On" },
    { lane: "Lane 2", weapon: "SAR21", status: "On" },
    { lane: "Lane 3", weapon: "SAR21", status: "On" },
    { lane: "Lane 4", weapon: "-", status: "Off" },
    { lane: "Lane 5", weapon: "SAR21", status: "On" },
    { lane: "Lane 6", weapon: "-", status: "Off" },
    { lane: "Lane 7", weapon: "SAR21", status: "On" },
    { lane: "Lane 8", weapon: "SAR21", status: "On" },
    { lane: "Lane 9", weapon: "SAR21", status: "On" },
    { lane: "Lane 10", weapon: "-", status: "Closed" },
  ],
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

type DetailTab = "Booking Details" | "Nominal Rolls" | "Lane Configuration" | "Cabin Configuration" | "Detail List";

export function BookingDetail() {
  const [activeTab, setActiveTab] = useState<DetailTab>("Booking Details");
  const [issueDropOpen, setIssueDropOpen] = useState(false);
  const [showReissue, setShowReissue] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCoursewarePopup, setShowCoursewarePopup] = useState(false);
  const [showAddTrainee, setShowAddTrainee] = useState(false);
  const [showDotMenu,           setShowDotMenu]           = useState(false);
  const [showExportModal,       setShowExportModal]       = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastIdRef = useRef(0);
  const [mstDetailListGenerated, setMstDetailListGenerated] = useState(false);
  // Track unsaved changes in Nominal Roll / Cabin Config after Detail List is generated
  const [showSyncApproval,    setShowSyncApproval]     = useState(false);
  // True once the user explicitly confirms Sync — hides Sync, shows Start Onboarding
  const [isSynced,            setIsSynced]             = useState(false);
  // Timestamp of the last successful Sync, shown next to the Start Onboarding button
  const [lastSyncedAt,        setLastSyncedAt]         = useState<string | null>(null);
  const [msttctActiveTab, setMsttctActiveTab] = useState("Booking Details");
  const dotMenuRef = useRef<HTMLDivElement>(null);
  const setBooking = useBookingStore((s) => s.setBooking);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target as Node)) setShowDotMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleExport = (scope: ExportScope, format: ExportFormat) => {
    setShowExportModal(false);
    toastIdRef.current += 1;
    setToast({
      id: toastIdRef.current,
      message: `${scope} exported as ${format}.`,
    });
  };

  const getBookingData = () => {
    const params = new URLSearchParams(window.location.search);
    let bookingId = params.get("id");
    if (!bookingId) {
      const hashMatch = window.location.hash.match(/\?id=([^&]+)/);
      if (hashMatch) bookingId = hashMatch[1];
    }
    const id = bookingId || "1";
    // Check mock data first
    const mockBooking = bookings.find(b => b.id === id);
    if (mockBooking) return mockBooking;
    // Fall back to locally-saved MST bookings
    const localEntry = getMSTLocalBookingById(id);
    if (localEntry) return mstLocalBookingToBooking(localEntry);
    const tctEntry = getTCTLocalBookingById(id);
    if (tctEntry) return tctLocalBookingToBooking(tctEntry);
    return undefined;
  };

  const selectedBooking = getBookingData();

  // Locally-created MST booking: everything entered in Create Booking is shown back here
  const localData = selectedBooking?.id?.startsWith("mst-local-")
    ? getMSTLocalBookingById(selectedBooking.id)
    : undefined;
  const bd = localData?.bookingDetails;
  // Locally-created TCT booking: shown through the MST+TCT screens, TCT half only
  const tctLocal = selectedBooking?.id?.startsWith("tct-local-")
    ? getTCTLocalBookingById(selectedBooking.id)
    : undefined;
  const cd = tctLocal?.bookingDetails;
  const tctPlatforms = (cd?.platformVariants ?? []).filter(v => v.selected);
  const selectedPlatforms = (bd?.platformVariants ?? []).filter(v => v.selected).map(v => v.label);

  const BOOKING = useMemo<Booking>(() => selectedBooking ? {
    ...BOOKING_DATA,
    id: selectedBooking.bookingId,
    title: selectedBooking.program,
    status: selectedBooking.status,
    date: selectedBooking.bookingDate,
    time: selectedBooking.bookingTime,
    program: selectedBooking.program,
    trainingMode: selectedBooking.trainingMode,
    briefingRoom: "Briefing Room A",
    sectionType: (selectedBooking.isMST || selectedBooking.isMSTTCT) ? "Compartment Selection" : (selectedBooking.sectionType ?? "Standalone"),
    courseware: selectedBooking.courseware,
    traineesCount: selectedBooking.trainees ?? 32,
    trainingType: selectedBooking.trainingType,
    assignmentId: selectedBooking.assignmentId,
    ftmsFile: "202412231456",
    isIntegrated: false,
    isMST: selectedBooking.isMST ?? false,
    isMSTTCT: selectedBooking.isMSTTCT ?? false,
  } : {
    ...BOOKING_DATA,
    id: "#111024-KC0004",
    title: "MST Training for Unit 19",
    status: "Upcoming",
    date: "10 January 2025",
    time: "08:00 AM – 06:00 PM (Full Day)",
    program: "MST Training",
    trainingMode: "Marksmanship",
    briefingRoom: "Briefing Room",
    sectionType: "Standalone",
    courseware: "Component Type Training B",
    traineesCount: 32,
    trainingType: "Group",
    assignmentId: "-",
    ftmsFile: "202412231456",
    isIntegrated: false,
    isMST: false,
  }, [selectedBooking]);

  const tabs: DetailTab[] = BOOKING.isMST
    ? ["Booking Details", "Nominal Rolls", "Cabin Configuration", "Detail List"]
    : ["Booking Details", "Nominal Rolls", "Lane Configuration", "Detail List"];

  useEffect(() => {
    setBooking(BOOKING);
  }, [BOOKING, setBooking]);

  const isMSTTCT = BOOKING.isMSTTCT ?? false;
  // A MST+TCT booking viewed from the TCT (or MST) rail should only show that
  // programme's half — the raw record still has both, but the TCT rail's own
  // Booking List already relabels "MST TCT" -> "TCT" for the same reason.
  const activeProgram = useActiveProgramStore((s) => s.activeProgram);
  const msttctViewMode: "both" | "mst" | "tct" = tctLocal
    ? "tct"
    : isMSTTCT
    ? (activeProgram === "TCT" ? "tct" : activeProgram === "MST" ? "mst" : "both")
    : "both";
  const displayTitle = isMSTTCT && msttctViewMode !== "both" && BOOKING.title
    ? BOOKING.title.replace(/^MST TCT/, msttctViewMode === "tct" ? "TCT" : "MST")
    : BOOKING.title;

  if (showOnboarding) {
    if (BOOKING.isMSTTCT) return <MSTTCTOnboardingFlow onClose={() => setShowOnboarding(false)} only={selectedBooking?.id?.startsWith("tct-local-") ? "TCT" : undefined} />;
    return BOOKING.isMST
      ? <MSTOnboardingFlow onClose={() => setShowOnboarding(false)} />
      : <OnboardingFlow    onClose={() => setShowOnboarding(false)} />;
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-1 gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-xl font-semibold text-brand-primary">{displayTitle}</h1>
                <StatusBadge status={BOOKING.status} size="sm" />
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
              {/* Issue Assets dropdown — hidden for MST Upcoming (no asset management for MST),
                  and hidden entirely for the TCT rail (TCT bookings don't issue physical assets). */}
              {msttctViewMode !== "tct" && BOOKING.status !== "Overdue" && !(BOOKING.isMST && BOOKING.status === "Upcoming") && (
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

              {/* Onboarding for MST+TCT */}
              {["Ongoing", "Upcoming"].includes(BOOKING.status) && isMSTTCT && (
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  {BOOKING.status === "Ongoing" ? "Continue Session" : "Start Onboarding"}
                </Button>
              )}

              {/* Standalone MST — buttons appear only after Detail List is generated */}
              {/* Sync — shown whenever not yet synced (including right after a Nominal Roll / Cabin Config edit re-opens this state) */}
              {BOOKING.isMST && !isMSTTCT && mstDetailListGenerated && !isSynced && (
                <Button
                  type="outline"
                  onClick={() => setShowSyncApproval(true)}
                  className="px-5 py-2.5 text-sm font-semibold w-auto border border-gray-300 text-gray-700"
                >
                  Sync
                </Button>
              )}

              {/* Start Onboarding — appears after user explicitly clicks Sync, alongside the last-synced timestamp */}
              {BOOKING.isMST && !isMSTTCT && isSynced && (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    className="px-5 py-2.5 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover"
                  >
                    Start Onboarding
                  </Button>
                  {lastSyncedAt && (
                    <span className="text-xs text-gray-400">Last synced: <span className="text-gray-600 font-medium">{lastSyncedAt}</span></span>
                  )}
                </div>
              )}

              <div className="relative" ref={dotMenuRef}>
                <Button
                  type="outline"
                  onClick={() => setShowDotMenu(v => !v)}
                  className="h-9 w-auto p-0 flex items-center justify-center border border-gray-200 text-gray-500 aspect-square"
                >
                  <MoreVertical size={16} />
                </Button>

                {showDotMenu && isMSTTCT && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                    <button type="button"
                      onClick={() => { setShowDotMenu(false); setShowExportModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-gray-700 hover:bg-gray-50">
                      <Download size={15} className="text-gray-400 flex-shrink-0" /> Export
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    {[
                      { label: "Cancel", danger: true },
                      { label: "Reschedule" },
                      { label: "Return Assets" },
                      { label: "Manual Issue Assets" },
                    ].map(({ label, danger }: { label: string; danger?: boolean }) => (
                      <button key={label} type="button"
                        onClick={() => setShowDotMenu(false)}
                        className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                          danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50")}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {showDotMenu && !isMSTTCT && BOOKING.status === "Ongoing" && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                    <button type="button"
                      onClick={() => { setShowDotMenu(false); setShowExportModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-gray-700 hover:bg-gray-50">
                      <Download size={15} className="text-gray-400 flex-shrink-0" /> Export
                    </button>
                    <div className="my-1 border-t border-gray-100" />
                    {[
                      { icon: <Plus size={15} className="text-gray-600" />, label: "Top up assets" },
                      { icon: <Check size={15} className="text-gray-400" />, label: "Ready for return assets" },
                      { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>, label: "Return assets" },
                      { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Reschedule" },
                      { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: "Assign briefing Room" },
                      { icon: <X size={15} className="text-gray-400" />, label: "Cancel", danger: true },
                    ].map(({ icon, label, danger }: any) => (
                      <button key={label} type="button"
                        onClick={() => setShowDotMenu(false)}
                        className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                          danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50")}>
                        <span className={cn("flex-shrink-0", danger ? "text-red-400" : "text-gray-400")}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {showDotMenu && !isMSTTCT && BOOKING.status !== "Ongoing" && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                    <button type="button"
                      onClick={() => { setShowDotMenu(false); setShowExportModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-gray-700 hover:bg-gray-50">
                      <Download size={15} className="text-gray-400 flex-shrink-0" /> Export
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 border-b border-gray-200 mb-6">
            {isMSTTCT
              ? ["Booking Details", "Nominal Roll", "Cabin Configuration", "Cluster Configuration", "Detail List", "Assignment List"]
                  .filter((tab) => !(msttctViewMode === "tct" && tab === "Cabin Configuration") && !(msttctViewMode === "mst" && tab === "Cluster Configuration"))
                  // TCT bookings don't issue physical assets, so there's nothing to assign — Assignment List is MST-only.
                  .filter((tab) => !(msttctViewMode === "tct" && tab === "Assignment List"))
                  .map((tab) => (
                  <button key={tab} type="button" onClick={() => setMsttctActiveTab(tab)}
                    className={cn("px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                      msttctActiveTab === tab
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700")}>
                    {tab}
                  </button>
                ))
              : tabs.map((tab: any) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={cn("px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700")}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── MST+TCT tab content ─────────────────────────────────────────── */}
          {isMSTTCT && msttctActiveTab === "Booking Details" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className={cn(
                "grid gap-0 divide-x divide-gray-200",
                msttctViewMode === "both" ? "grid-cols-3" : "grid-cols-2",
              )}>
                {/* MST Column — hidden when viewing this booking from the TCT rail */}
                {msttctViewMode !== "tct" && (
                  <div className="pr-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-800">MST</h3>
                    {[
                      ["Booking Type", "Entire Cabin"],
                      ["Main IOS", "Main IOS 3"],
                      ["Slave IOS", "-"],
                    ].map(([label, value]) => (
                      <Field key={label} label={label} value={value} />
                    ))}
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Cabin</dt>
                      {["Cabin 1","Cabin 2","Cabin 4","Cabin 6"].map(c => (
                        <dd key={c} className="text-sm font-semibold text-gray-800">{c}</dd>
                      ))}
                    </div>
                    {[
                      ["Vehicle Type", "ICV (TERREX)"],
                      ["Weapon Variant", "40AGL (2), 50HMG (2)"],
                    ].map(([label, value]) => (
                      <Field key={label} label={label} value={value} />
                    ))}
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Roles</dt>
                      {["VO","VC","TC","SO"].map(r => (
                        <dd key={r} className="text-sm font-semibold text-gray-800">{r}</dd>
                      ))}
                    </div>
                  </div>
                )}

                {/* TCT Column — hidden when viewing this booking from the MST rail */}
                {msttctViewMode !== "mst" && (
                  <div className={cn(msttctViewMode === "both" ? "px-6" : "pr-6", "space-y-4")}>
                    <h3 className="text-sm font-bold text-gray-800">TCT</h3>
                    {cd ? (
                      <>
                        <Field label="Training Type" value={cd.trainingType} />
                        <Field label="Cluster Amount" value={`${cd.clusterAmount} cluster${cd.clusterAmount > 1 ? "s" : ""}`} />
                        <Field
                          label="Zones"
                          value={(() => {
                            const picked = (tctLocal?.clusters ?? []).filter(c => c.selected && c.zone);
                            const parts = ["A", "B", "C", "D"].map(z => [z, picked.filter(c => c.zone === z).length] as const).filter(([, n]) => n > 0);
                            return parts.length ? parts.map(([z, n]) => `Zone ${z} (${n})`).join(", ") : "—";
                          })()}
                        />
                        <div>
                          <dt className="text-xs text-gray-400 mb-0.5">Vehicle Type</dt>
                          {cd.vehicleTypes.map(v => (
                            <dd key={v} className="text-sm font-semibold text-gray-800">{v}</dd>
                          ))}
                        </div>
                        <div>
                          <dt className="text-xs text-gray-400 mb-0.5">Platform Type</dt>
                          {tctPlatforms.map(v => (
                            <dd key={v.id} className="text-sm font-semibold text-gray-800">{v.label} ({v.qty})</dd>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                    {[
                      ["Main IOS", "Main IOS 3"],
                      ["Slave IOS", "Main IOS 2"],
                    ].map(([label, value]) => (
                      <Field key={label} label={label} value={value} />
                    ))}
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Vehicle Type</dt>
                      {["ICV (TERREX)","Engineer (BRONCO)"].map(v => (
                        <dd key={v} className="text-sm font-semibold text-gray-800">{v}</dd>
                      ))}
                    </div>
                    {[["Vehicle Variant", "TERREX (COMMANDER)"]].map(([label, value]) => (
                      <Field key={label} label={label} value={value} />
                    ))}
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Weapon Variant</dt>
                      {["40AGL","50HMG","MORTAL"].map(v => (
                        <dd key={v} className="text-sm font-semibold text-gray-800">{v}</dd>
                      ))}
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Roles</dt>
                      {["VO","VC","TC","SO","SC"].map(r => (
                        <dd key={r} className="text-sm font-semibold text-gray-800">{r}</dd>
                      ))}
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Cluster</dt>
                      {Array.from({length:16},(_,i)=>`Cluster ${i+1}`).map(c => (
                        <dd key={c} className="text-sm font-semibold text-gray-800">{c}</dd>
                      ))}
                    </div>
                      </>
                    )}
                  </div>
                )}

                {/* Right column */}
                <div className="pl-6 space-y-4">
                  <Field label="Briefing Room" value={cd ? (cd.briefingRooms.join(", ") || "—") : "Briefing Room A"} />
                  <Field label="Trainee(s)" value={cd ? `${tctLocal?.traineesCount ?? 0} Trainee(s)` : "32 Trainee(s)"} />
                  {msttctViewMode !== "tct" && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Cabin</dt>
                      {["Cabin 1","Cabin 2","Cabin 4","Cabin 6"].map(c => (
                        <dd key={c} className="text-sm font-semibold text-gray-800">{c}</dd>
                      ))}
                    </div>
                  )}
                  <Field label="FTMS File" value="202412231456" />
                  {cd && <Field label="Unit Name" value={cd.unitName || "—"} />}
                  {cd && <Field label="Schedule" value={cd.scheduleType ?? "—"} />}
                  <Field label="Instructor Name" value={cd ? cd.instructor || "—" : "Marvin Marched"} />
                  <Field label="Unit Contact Details" value={cd ? cd.unitContactDetails || "—" : "+1 662 222 2323 • contact@example.com"} />
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Operator Name</dt>
                    <dd className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">JJ</div>
                      <span className="text-sm font-semibold text-gray-800">Jake Jelanski</span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nominal Roll — same trainee roster table as MST's, shared regardless of rail */}
          {isMSTTCT && msttctActiveTab === "Nominal Roll" && (
            <MSTNominalRollDetail />
          )}

          {/* Cabin Configuration — identical to MST's, hidden entirely when viewing from the TCT rail */}
          {isMSTTCT && msttctActiveTab === "Cabin Configuration" && (
            <MSTCabinConfigStep
              bookingDetails={null}
              gridCols="grid-cols-[65%_35%]"
              initialCabins={DETAIL_DEMO_CABINS}
              initialIosList={DETAIL_DEMO_IOS_LIST}
              lastUpdated="17 Jan 2025 09:29 AM"
              weaponVariantOptions={["40AGL", "50HMG"]}
            />
          )}

          {/* Cluster Configuration — same component/layout as Cabin Configuration, just relabelled
              (TCT uses "clusters" instead of "cabins", same concept at a larger scale — see TCTDetailListTab) */}
          {isMSTTCT && msttctActiveTab === "Cluster Configuration" && (
            <MSTCabinConfigStep
              // a saved TCT booking is capped at the Cluster Amount it was booked with
              bookingDetails={cd ? ({ cabinAmount: cd.clusterAmount } as any) : null}
              gridCols="grid-cols-[65%_35%]"
              initialCabins={tctLocal && tctLocal.clusters.length > 0
                ? tctLocal.clusters.map<CabinRow>(c => ({
                    id: c.id, occupied: c.occupied, selected: c.selected, callSign: "",
                    weaponVariant: c.vehicleVariant || c.weaponVariant, role: c.roles.join(","),
                  }))
                : DETAIL_DEMO_CLUSTERS}
              initialIosList={tctLocal ? [] : DETAIL_DEMO_TCT_IOS_LIST}
              lastUpdated="17 Jan 2025 09:29 AM"
              weaponVariantOptions={tctLocal && tctPlatforms.length > 0 ? tctPlatforms.map(v => v.label) : ["40AGL", "50HMG", "MORTAL"]}
              roleOptions={["VO", "VC", "TC", "SC", "SO"]}
              baseStationOptions={BASE_STATION_OPTIONS_TCT}
              unitLabel="Cluster"
            />
          )}

          {isMSTTCT && msttctActiveTab === "Detail List" && (
            <TCTDetailListTab status={BOOKING.status} />
          )}

          {isMSTTCT && msttctActiveTab === "Assignment List" && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
              Assignment List content
            </div>
          )}

          {/* Tab: Booking Details */}
          {!isMSTTCT && activeTab === "Booking Details" && (() => {
            const sessionLabel = BOOKING.time?.match(/\(([^)]+)\)/)?.[1] ?? "—";
            return (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-5">Training Information</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Section Type</dt>
                    <dd className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{BOOKING.sectionType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Training Mode</dt>
                    <dd className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{BOOKING.trainingMode}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Training Type</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {(bd?.compartments?.length ? bd.compartments : [BOOKING.trainingType]).map(t => (
                        <span key={t} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{t}</span>
                      ))}
                    </dd>
                  </div>
                  <Field label="Program" value={BOOKING.program} />
                  <Field label="Briefing Room" value={bd?.briefingRooms?.length ? bd.briefingRooms.join(", ") : BOOKING.briefingRoom} />
                  {bd && <Field label="Cabin Amount" value={`${bd.cabinAmount} cabin${bd.cabinAmount > 1 ? "s" : ""}`} />}
                  {!(BOOKING.isMST && BOOKING.status === "Upcoming") && (
                    <Field label="Courseware" value={BOOKING.courseware} />
                  )}
                  <Field label="Trainee" value={`${BOOKING.traineesCount} Trainee(s)`} />
                  <Field label="Assignment ID" value={<span className="text-gray-400">—</span>} />
                  <Field label="FTMS File" value={BOOKING.ftmsFile} />
                </dl>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-5">Training Schedule</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <Field label="Schedule Type" value={bd?.scheduleType ?? "Fixed Schedule"} />
                  <Field label="Training Date" value={BOOKING.date} />
                  <Field label="Training Time" value={BOOKING.time} />
                  <Field label="Session Type" value={sessionLabel} />
                </dl>
              </div>

              {BOOKING.isMST ? (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-5">Platform Configuration</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                      <Field label="Booking Type" value="Compartment Selection" />
                      <Field label="Vehicle Type" value={bd?.vehicleType ?? "ICV (TERREX)"} />
                      <div>
                        <dt className="text-xs text-gray-400 mb-1">Platform Type</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {(() => {
                            // Counts come from the cabins actually configured in this booking
                            const cabinSource = localData?.cabins ?? DETAIL_DEMO_CABINS;
                            const counts = cabinSource
                              .filter(c => c.selected && c.weaponVariant)
                              .reduce<Record<string, number>>((acc, c) => {
                                acc[c.weaponVariant] = (acc[c.weaponVariant] || 0) + 1;
                                return acc;
                              }, {});
                            // Every platform type picked in Booking Details is listed, even with 0 cabins yet
                            const names = bd ? selectedPlatforms : Object.keys(counts);
                            return names.map((variant) => {
                              const count = counts[variant] ?? 0;
                              return (
                                <span key={variant} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  {variant} ({count} unit{count === 1 ? "" : "s"})
                                </span>
                              );
                            });
                          })()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-5">IOS Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const iosList = localData?.iosList ?? DETAIL_DEMO_IOS_LIST;
                        return iosList.map((entry, idx) => (
                          <div key={entry.uid} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs font-bold text-gray-700 mb-2">IOS {idx + 1}</p>
                            <dl className="grid grid-cols-2 gap-y-2 gap-x-3">
                              <Field label="IOS Device" value={entry.iosDevice || "—"} />
                              <Field label="Base Station" value={entry.baseStation || "—"} />
                              <Field label="Master IOS" value={entry.masterIOS || "—"} />
                              <Field label="Force Type" value={entry.forceType || "—"} />
                            </dl>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-5">Unit Information</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                      <Field label="Unit Name" value={selectedBooking?.unitName ?? "Unit 10"} />
                      <Field label="Instructor" value={bd ? bd.instructor || "—" : "CPT Ahmad Rizal"} />
                      <Field label="Unit Contact Details" value={bd ? bd.unitContactDetails || "—" : "+1 9123 4567 • ahmad.rizal@mil.example"} />
                    </dl>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-4">
                      Weapon List ({BOOKING.weapons.reduce((a, w) => a + w.units, 0)} Units)
                    </h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      {BOOKING.weapons.map((w: any) => (
                        <div key={w.type}>
                          <dt className="text-xs text-gray-400 mb-0.5">Weapon Type</dt>
                          <dd className="text-sm font-semibold text-gray-800">{w.type} ({w.units} Units)</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-sm font-bold text-gray-700 mb-4">Base Station ({BOOKING.baseStations.length} Stations)</h2>
                      <dl className="space-y-3">
                        {BOOKING.baseStations.map((s: any, i: any) => (
                          <div key={i}>
                            <dt className="text-xs text-gray-400 mb-0.5">{s.label}</dt>
                            <dd className="text-sm font-semibold text-gray-800">{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h2 className="text-sm font-bold text-gray-700 mb-4">C-Shaped Station ({BOOKING.cShapedStations.length} Stations)</h2>
                      <dl className="space-y-3">
                        {BOOKING.cShapedStations.map((s: any, i: any) => (
                          <div key={i}>
                            <dt className="text-xs text-gray-400 mb-0.5">{s.label}</dt>
                            <dd className="text-sm font-semibold text-gray-800">{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </>
              )}
            </div>
            );
          })()}

          {/* Tab: Nominal Rolls */}
          {!isMSTTCT && activeTab === "Nominal Rolls" && (
            BOOKING.isMST ? (
              /* MST — use the same table as the create-booking flow */
              <MSTNominalRollDetail
                onDataChange={() => {
                  if (mstDetailListGenerated) setIsSynced(false);
                }}
              />
            ) : (
              /* Non-MST — original nominal roll table */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
                  <div className="relative">
                    <select className="appearance-none text-sm text-gray-700 border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer min-w-[220px]">
                      <option>{BOOKING.courseware || "Night Test for SAR21/M16 BTP"}</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {BOOKING.status === "Upcoming" && (
                    <div className="flex items-center gap-2">
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
                <NominalRollTable trainees={BOOKING.trainees} status={BOOKING.status} />
              </div>
            )
          )}

          {showAddTrainee && (
            <AddTraineeModal
              isOpen={showAddTrainee}
              onClose={() => setShowAddTrainee(false)}
              onSubmit={(vals) => console.log(vals)}
              unitName={BOOKING.title?.replace(/^MST( TCT)? Training for Unit */i, "") ?? ""}
            />
          )}

          {/* Tab: Lane Configuration */}
          {!isMSTTCT && activeTab === "Lane Configuration" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-700">Lane Configuration</h2>
                <p className="text-xs text-gray-400 mt-0.5">MST-01 — {BOOKING.courseware}</p>
              </div>
              <LaneConfigTable laneConfig={BOOKING.laneConfig} />
            </div>
          )}

          {!isMSTTCT && activeTab === "Cabin Configuration" && (() => {
            // Load cabin + IOS data from localStorage for locally-created MST bookings
            return (
              <MSTCabinConfigStep
                bookingDetails={bd ?? null}
                gridCols="grid-cols-[65%_35%]"
                initialCabins={localData?.cabins ?? DETAIL_DEMO_CABINS}
                initialIosList={localData?.iosList ?? DETAIL_DEMO_IOS_LIST}
                lastUpdated="17 Jan 2025 09:29 AM"
                weaponVariantOptions={selectedPlatforms.length > 0 ? selectedPlatforms : ["40AGL", "50HMG"]}
                onUserEdit={() => {
                  if (mstDetailListGenerated) setIsSynced(false);
                }}
              />
            );
          })()}

          {!isMSTTCT && activeTab === "Detail List" && (
            BOOKING.isMST
              ? <MSTDetailListTab status={BOOKING.status} isGenerated={mstDetailListGenerated} onGenerated={() => setMstDetailListGenerated(true)} />
              : (
                <BookingDetailListTab
                  bookingTitle={BOOKING.title}
                  bookingId={BOOKING.id}
                  unitName={BOOKING.program}
                  courseware={BOOKING.courseware ?? "—"}
                  status={BOOKING.status}
                />
              )
          )}
        </div>
      </div>

      {showReissue && <ReissueModal open={showReissue} onClose={() => setShowReissue(false)} />}

      {showExportModal && (
        <ExportBookingModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      {toast && (
        <div key={toast.id} className="fixed top-6 right-6 z-[100] flex items-start gap-2.5 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm">
          <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 flex-1">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sync approval popup */}
      {showSyncApproval && (
        <div className="fixed inset-0 bg-black/40 z-[1200] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[440px] p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M21.5 2v6h-6"/><path d="M2.5 12a9 9 0 0 1 15-6.7L21.5 8"/>
                  <path d="M2.5 22v-6h6"/><path d="M21.5 12a9 9 0 0 1-15 6.7L2.5 16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Confirm Sync</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Are you sure you want to sync? This will finalise the current Detail List and enable onboarding.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSyncApproval(false)}
                className="py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setLastSyncedAt(
                    `${now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                  );
                  setIsSynced(true);
                  setShowSyncApproval(false);
                }}
                className="py-2.5 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
              >
                Yes, Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {showCoursewarePopup && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 px-8 py-8 text-center relative">
            <Button
              onClick={() => setShowCoursewarePopup(false)}
              className="absolute top-4 right-4 p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent"
            >
              <X size={18} />
            </Button>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select Courseware</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Choose the courseware you want to begin training with.<br />
              You can only select one course to proceed.
            </p>
            <div className="relative mb-6 text-left">
              <select
                defaultValue={BOOKING.courseware || "Night Test for SAR21/M16 BTP"}
                className="w-full appearance-none text-sm text-gray-800 border-2 border-gray-800 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-medium"
              >
                <option>{BOOKING.courseware || "Night Test for SAR21/M16 BTP"}</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            </div>
            <Button
              onClick={() => {
                setShowCoursewarePopup(false);
                setShowOnboarding(true);
              }}
              className="w-full py-3 bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover"
            >
              Onboard Trainees
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from "react";
import { Clock, UserCheck, UserX, Download, Upload, FileText, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

// ── Mock detail groups ─────────────────────────────────────────────────────────

const DETAIL_GROUPS = [
  {
    station: "MST-01",
    details: [
      { label: "Detail 1  (Day Test for SAR21/M16 BTP)", assignedStation: "MST-01", trainees: 10, status: "Completed" },
      { label: "Detail 2  (Day Test for SAR21/M16 BTP)", assignedStation: "MST-01", trainees: 2,  status: "Ready"     },
    ],
  },
  {
    station: "MST-02",
    details: [
      { label: "Detail 1  (Day Test for SAR21/M16 BTP)", assignedStation: "MST-02", trainees: 4,  status: "Completed" },
      { label: "Detail 2  (Day Test for SAR21/M16 BTP)", assignedStation: "MST-02", trainees: 1,  status: "Ready"     },
    ],
  },
];

const TOTAL_DETAILS  = DETAIL_GROUPS.reduce((s, g) => s + g.details.length, 0);
const TOTAL_TRAINEES = 14;

// ── Countdown timer ────────────────────────────────────────────────────────────

function useCountdown(initial: number) {
  const [secs, setSecs] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ── Status pill ────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "Completed";
  return (
    <span className={cn(
      "text-xs font-semibold",
      isCompleted ? "text-green-600" : "text-blue-500"
    )}>
      {status}
    </span>
  );
}

// ── Verification card ──────────────────────────────────────────────────────────

function VerificationCard({
  title, description, checked, onToggle,
}: {
  title: string; description: string; checked: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-start gap-3 w-full text-left p-4 rounded-xl border-2 transition-all",
        checked
          ? "border-green-500 bg-green-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      {checked
        ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
        : <Circle      size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
      }
      <div>
        <p className={cn("text-sm font-semibold", checked ? "text-green-700" : "text-gray-700")}>
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BookingDetailListTab({
  bookingTitle = "MST Training for Unit 2SIR",
  bookingId    = "#260116-PTC002",
  unitName     = "Unit 2SIR",
  courseware   = "20260116-BCW001",
  status       = "Upcoming",
}: {
  bookingTitle?: string;
  bookingId?:    string;
  unitName?:     string;
  courseware?:   string;
  status?:       string;
}) {
  const timer = useCountdown(20 * 60 + 18);

  // ── Empty-state flow ──────────────────────────────────────────────────────
  const [nominalRollDone,  setNominalRollDone]  = useState(false);
  const [cabinConfigDone,  setCabinConfigDone]  = useState(false);
  const [confirmed,        setConfirmed]        = useState(false);
  const [isGenerated,      setIsGenerated]      = useState(false);
  const [uploadedFile,     setUploadedFile]     = useState<string | null>(null);

  const bothChecked = nominalRollDone && cabinConfigDone;

  const passCount = 6;
  const failCount = 3;
  const marksman  = 5;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!isGenerated) {
    return (
      <div className="flex items-start justify-center pt-10 pb-16">
        <div className="w-full max-w-2xl space-y-5">

          {/* Header */}
          <div className="text-center mb-2">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-brand-primary" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Generate Detail List</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Before generating the detail list, please verify that you have completed
              both Nominal Roll upload and Cabin Configuration.
            </p>
          </div>

          {/* Verification cards */}
          <div className="grid grid-cols-2 gap-3">
            <VerificationCard
              title="Nominal Roll"
              description="Upload your trainee nominal roll data"
              checked={nominalRollDone}
              onToggle={() => { setNominalRollDone(v => !v); setConfirmed(false); }}
            />
            <VerificationCard
              title="Cabin Configuration"
              description="Complete the cabin assignment configuration"
              checked={cabinConfigDone}
              onToggle={() => { setCabinConfigDone(v => !v); setConfirmed(false); }}
            />
          </div>

          {/* Download template + Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Template &amp; Upload
            </p>
            <div className="flex items-center gap-3">
              {/* Download template */}
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center"
              >
                <Download size={15} className="text-gray-500" />
                Download Template
              </button>

              {/* Upload file */}
              <label className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-red-50 transition-colors flex-1 justify-center cursor-pointer">
                <Upload size={15} />
                {uploadedFile ? uploadedFile : "Upload File"}
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadedFile(f.name);
                  }}
                />
              </label>
            </div>
            {uploadedFile && (
              <p className="text-xs text-green-600 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                File "{uploadedFile}" ready to upload
              </p>
            )}
          </div>

          {/* Confirmation toggle */}
          <button
            type="button"
            disabled={!bothChecked}
            onClick={() => setConfirmed(v => !v)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left",
              !bothChecked
                ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                : confirmed
                  ? "border-brand-primary bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
              confirmed ? "bg-brand-primary border-brand-primary" : "border-gray-300"
            )}>
              {confirmed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={cn(
              "text-sm font-medium",
              confirmed ? "text-brand-primary" : "text-gray-600"
            )}>
              Yes, I have completed the Nominal Roll upload and Cabin Configuration
            </span>
          </button>

          {/* Generate button — only visible after confirmation */}
          {confirmed && (
            <Button
              onClick={() => setIsGenerated(true)}
              className="w-full py-3 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover flex items-center justify-center gap-2"
            >
              Generate Detail List
              <ChevronRight size={16} />
            </Button>
          )}

        </div>
      </div>
    );
  }

  // ── Generated state — stats bar + detail cards ────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Stats bar — only when training has started ────────────────────── */}
      {["Ongoing", "Completed"].includes(status) && (
      <div className="bg-white rounded-xl border border-gray-200 flex items-center divide-x divide-gray-100 overflow-hidden">

        {/* Booking info */}
        <div className="flex flex-col justify-center px-4 py-3 flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 leading-tight truncate">{bookingTitle}</p>
          <p className="text-xs text-gray-400 mt-0.5">{bookingId}</p>
        </div>

        {/* Unit Name */}
        <div className="flex flex-col justify-center px-4 py-3 shrink-0">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Unit Name</p>
          <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{unitName}</p>
        </div>

        {/* Courseware */}
        <div className="flex flex-col justify-center px-4 py-3 shrink-0">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Courseware</p>
          <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{courseware}</p>
        </div>

        {/* Marksman */}
        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <UserCheck size={13} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Marksman (%)</p>
            <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
              {marksman} <span className="font-normal text-gray-500">/ {TOTAL_TRAINEES}</span>
            </p>
          </div>
        </div>

        {/* Pass */}
        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <UserCheck size={13} className="text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pass (%)</p>
            <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
              {passCount} <span className="font-normal text-gray-500">/ {TOTAL_TRAINEES}</span>
            </p>
          </div>
        </div>

        {/* Fail */}
        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <UserX size={13} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fail (%)</p>
            <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
              {failCount} <span className="font-normal text-gray-500">/ {TOTAL_TRAINEES}</span>
            </p>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center px-4 py-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
            <Clock size={12} className="text-brand-primary flex-shrink-0" />
            <span className="text-xs font-bold text-brand-primary font-mono">{timer}</span>
          </div>
        </div>
      </div>
      )}

      {/* ── Detail groups ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Detail{" "}
            <span className="text-gray-400 font-normal">({TOTAL_DETAILS} Details)</span>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              type="outline"
              className="px-4 py-2 text-sm font-semibold w-auto border border-brand-primary text-brand-primary hover:bg-red-50"
            >
              Create New Detail
            </Button>
            <Button className="px-4 py-2 text-sm font-semibold w-auto bg-brand-primary text-white hover:bg-brand-primary-hover">
              Live Results
            </Button>
          </div>
        </div>

        {/* Groups */}
        <div className="p-5 space-y-6">
          {DETAIL_GROUPS.map((group) => (
            <div key={group.station}>
              <p className="text-sm font-bold text-gray-800 mb-3">
                {group.station}{" "}
                <span className="text-gray-400 font-normal">({group.details.length} Details)</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.details.map((detail, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-800">{detail.label}</p>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Base Station</p>
                        <p className="text-xs font-bold text-gray-800">{detail.assignedStation}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Trainee</p>
                        <p className="text-xs font-bold text-gray-800">
                          {detail.trainees} {detail.trainees === 1 ? "trainee" : "trainees"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
                        <StatusPill status={detail.status} />
                      </div>
                    </div>
                    <Button className="w-full py-2.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover">
                      View Detail List
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

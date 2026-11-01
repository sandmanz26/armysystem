import { useBookingStore } from "../store/useBookingStore";
import { useState, useEffect } from "react";
import { Clock, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MstDetailCard {
  detailNumber:  number;
  cabin:         string;
  trainees:      number;
  weaponVariant: string;
  roles:         number;
}

interface TctDetailCard {
  detailNumber:   number;
  cluster:        string;
  trainees:       number;
  vehicleVariant: string;
  roles:          number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MST_LIVE_DETAILS: MstDetailCard[] = Array.from({ length: 5 }, (_, i) => ({
  detailNumber:  i + 1,
  cabin:         `MST_CABIN_0${i + 1}`,
  trainees:      5,
  weaponVariant: "40AGL",
  roles:         5,
}));

const TCT_LIVE_DETAILS: TctDetailCard[] = Array.from({ length: 16 }, (_, i) => ({
  detailNumber:   i + 1,
  cluster:        `TCT_CLUSTER_${String(i + 1).padStart(2, "0")}`,
  trainees:       5,
  vehicleVariant: "40AGL",
  roles:          5,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimer(secs: number): string {
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MstLiveCard({ card }: { card: MstDetailCard }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Detail {card.detailNumber}</span>
        <span className="text-xs font-semibold text-orange-500">Ongoing</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Cabin</div>
          <div className="text-xs font-bold text-gray-800">{card.cabin}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Trainees</div>
          <div className="text-xs font-bold text-gray-800">{card.trainees} Trainees</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Weapon Variant</div>
          <div className="text-xs font-bold text-gray-800">{card.weaponVariant}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Roles</div>
          <div className="text-xs font-bold text-gray-800">{card.roles} Roles</div>
        </div>
      </div>
      <button
        type="button"
        className="w-full py-2.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors mt-auto"
      >
        View Detail List
      </button>
    </div>
  );
}

function TctLiveCard({ card }: { card: TctDetailCard }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800">Detail {card.detailNumber}</span>
        <span className="text-xs font-semibold text-orange-500">Ongoing</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Cluster</div>
          <div className="text-xs font-bold text-gray-800">{card.cluster}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Trainees</div>
          <div className="text-xs font-bold text-gray-800">{card.trainees} Trainees</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Vehicle Variant</div>
          <div className="text-xs font-bold text-gray-800">{card.vehicleVariant}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Roles</div>
          <div className="text-xs font-bold text-gray-800">{card.roles} Roles</div>
        </div>
      </div>
      <button
        type="button"
        className="w-full py-2.5 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors mt-auto"
      >
        View Detail List
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MSTTCTLiveTrainingDashboard({ only }: { only?: "MST" | "TCT" }) {
  const booking = useBookingStore((s) => s.booking);
  const [activeTab,     setActiveTab]     = useState<"MST" | "TCT">(only ?? "MST");
  const [totalSeconds,  setTotalSeconds]  = useState(59 * 60 + 59); // 00:59:59

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalDetails   = activeTab === "MST" ? MST_LIVE_DETAILS.length : TCT_LIVE_DETAILS.length;
  const miosLabel      = activeTab === "MST" ? "MST_MIOS_01" : "TCT_MIOS_01";
  const trainingTitle  = only && booking?.title ? booking.title : activeTab === "MST" ? "MST Training for Unit 19" : "TCT Training for Unit 19";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-3 flex-shrink-0 overflow-x-auto">

        {/* Training info panel */}
        <div className="flex items-center gap-5 flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl">
          <div className="min-w-[140px]">
            <div className="text-sm font-bold text-gray-800 truncate">{trainingTitle}</div>
            <div className="text-xs text-gray-400 mt-0.5">#111024-KC001</div>
          </div>
          <div className="hidden sm:block border-l border-gray-100 pl-5">
            <div className="text-xs text-gray-400">Training Type</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">Individual</div>
          </div>
          <div className="hidden md:block border-l border-gray-100 pl-5">
            <div className="text-xs text-gray-400">Vehicle Type</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">ICV (TERREX)</div>
          </div>
          <div className="hidden lg:block border-l border-gray-100 pl-5">
            <div className="text-xs text-gray-400">Vehicle Variant</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">40AGL (2), 50HMG (2)</div>
          </div>
        </div>

        {/* Pass Trainee(s) */}
        <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
            <UserCheck size={17} className="text-green-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Pass Trainee(s)</div>
            <div className="text-sm font-bold text-gray-800 mt-0.5">
              0{" "}
              <span className="text-xs text-gray-400 font-normal">/28 Trainee(s)</span>
            </div>
          </div>
        </div>

        {/* Fail Trainee(s) */}
        <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <UserX size={17} className="text-brand-primary" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Fail Trainee(s)</div>
            <div className="text-sm font-bold text-gray-800 mt-0.5">
              0{" "}
              <span className="text-xs text-gray-400 font-normal">/28 Trainee(s)</span>
            </div>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-full flex-shrink-0">
          <Clock size={14} />
          <span className="font-mono font-bold text-sm">{formatTimer(totalSeconds)}</span>
        </div>

      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 md:p-6">

        {/* MST/TCT tabs */}
        <div className="flex gap-2 mb-5">
          {(only ? ([] as ("MST" | "TCT")[]) : (["MST", "TCT"] as ("MST" | "TCT")[])).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-semibold border transition-colors",
                activeTab === tab
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Details{" "}
              <span className="font-normal text-gray-400">({totalDetails} Details)</span>
            </h3>
            {activeTab === "MST" ? (
              <Button
                type="outline"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 w-auto border border-gray-200"
              >
                Create New Detail
              </Button>
            ) : (
              <Button
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover w-auto"
              >
                Edit detail list
              </Button>
            )}
          </div>

          {/* MIOS section label */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-600">
              {miosLabel}{" "}
              <span className="font-normal text-gray-400">({totalDetails} Details)</span>
            </span>
          </div>

          {/* MST detail cards */}
          {activeTab === "MST" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MST_LIVE_DETAILS.map(card => (
                <MstLiveCard key={card.detailNumber} card={card} />
              ))}
            </div>
          )}

          {/* TCT detail cards */}
          {activeTab === "TCT" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TCT_LIVE_DETAILS.map(card => (
                <TctLiveCard key={card.detailNumber} card={card} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

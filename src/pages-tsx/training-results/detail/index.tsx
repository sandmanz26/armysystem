// Training Result Details — Figma `Training Result Details (Multiple CW)`
// (5839:44906), frames `Details` 5839:44920 and `Dropdown - CW` 5839:44922.
//
// This replaces the old single-courseware layout. The page is now scoped to one
// courseware at a time: a selector card sits above the tabs, and the booking
// details, the performance chart and every tab below it follow whichever
// courseware is active.
import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainingPerformanceTab } from "./components/TrainingPerformanceTab";
import { NominalRollTab } from "./components/NominalRollTab";
import { DetailListTab } from "./components/DetailListTab";
import { LeaderboardTab } from "./components/LeaderboardTab";
import { CoursewareSelector, isCoursewareAvailable } from "./components/CoursewareSelector";
import { Icon } from "@/components/icon";
import { BookingDetailsCard } from "./components/BookingDetailsCard";
import { DETAIL, TABS } from "./constants";
import type { Tab } from "./types";

export function TrainingDetail({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("Training Performance");
  const [dlOpen, setDlOpen] = useState(false);
  const [cwIndex, setCwIndex] = useState(0);
  const dlRef = useRef<HTMLDivElement>(null);

  const courseware = DETAIL.coursewares[cwIndex];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setDlOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-4 md:p-6 flex flex-col gap-6">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-xl font-semibold text-default">{DETAIL.program}</h1>
            {/* Figma `Badge`: background/default/invert/default on a border/base
                outline, radius 4, label in color/text/base. */}
            <span className="inline-flex w-fit items-center rounded border border-base bg-default-invert-default px-2 py-0.5 text-sm font-medium text-invert-default">
              ID {DETAIL.bookingId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("/bookings/detail")}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-invert-default bg-surface text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
            >
              <Eye size={18} />
              View Booking Details
            </button>

            <div className="relative" ref={dlRef}>
              <button
                type="button"
                onClick={() => setDlOpen((v) => !v)}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary-default text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
              >
                <Download size={18} />
                Download
                <ChevronDown
                  size={18}
                  className={cn("transition-transform", dlOpen && "rotate-180")}
                />
              </button>
              {dlOpen && (
                <div className="absolute right-0 mt-1 w-52 z-[1100] rounded-lg bg-surface shadow-lg overflow-hidden py-1">
                  {["Training Results", "Take Home Package"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDlOpen(false)}
                      className="w-full px-4 py-2.5 text-sm text-default hover:bg-default-hovered transition-colors text-left"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Courseware list (left) + the selected courseware's tabs/content (right) — Figma 5839:44920 ── */}
        <div className="flex items-start gap-6">
          <CoursewareSelector
            coursewares={DETAIL.coursewares}
            activeIndex={cwIndex}
            onSelect={setCwIndex}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {!isCoursewareAvailable(courseware) ? (
              /* Figma 8171:144746 — selected courseware has not been completed. */
              <div className="flex flex-col items-center gap-2 rounded-xl border border-invert-default bg-surface-lv1 px-6 py-12 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-default-default">
                  <Icon name="graduation-cap" size={18} className="text-body" />
                </span>
                <p className="text-sm font-semibold text-default">Results not available yet</p>
                <p className="text-xs text-body">Courseware has not been completed. Results appear here once the session ends.</p>
              </div>
            ) : (
              <>
            {/* ── Tabs — Figma `Tab Group v2`, each with a count badge ────────── */}
            <div className="flex items-center border-b border-invert-default overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium relative transition-colors whitespace-nowrap",
                    activeTab === tab ? "text-primary" : "text-body hover:text-default",
                  )}
                >
                  {tab}
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold",
                      activeTab === tab
                        ? "bg-primary-default text-invert-default"
                        : "bg-disabled text-body",
                    )}
                  >
                    1
                  </span>
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-default rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Figma puts Booking Details directly under the tabs, above the
                chart + trainee table, and scopes it to the active courseware. */}
            <BookingDetailsCard courseware={courseware} />

            {activeTab === "Training Performance" && <TrainingPerformanceTab courseware={courseware} />}
            {activeTab === "Nominal Roll" && <NominalRollTab courseware={courseware} />}
            {activeTab === "Detail List" && <DetailListTab courseware={courseware} />}
            {activeTab === "Leaderboard" && <LeaderboardTab courseware={courseware} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

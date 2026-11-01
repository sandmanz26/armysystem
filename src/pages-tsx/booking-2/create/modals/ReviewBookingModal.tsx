// Booking 2.0 — "Review Your Booking" modal (Create Booking Step 5).
//
// Figma (WPT, page 6183:504759): 6183:504764 Collective CW 1 · 6183:504766 Collective CW >1 ·
// 6183:504768 Judgemental · 6183:504770 Marksmanship · 6183:504772 trainee hover.
//   Modal 1024 wide, radius 16, header 32px padding (20/600 title + 40px x button), content 32px
//   side padding with the 14/400 subtitle, then two #f9fafb sub-section cards (Booking Summary
//   384px | Courseware (n) fill) 20px apart, footer 32px padding with Cancel / Confirm.
//
// Every value comes from the wizard's actual selections — nothing hard-coded:
//   Training Details  "<Training Type> · <Training Mode>" + "Include / Not Include Dry Run Training"
//   Role              Collective only (Judgemental frame has no Role row)
//   Briefing Room     the room picked in Step 1, "—" when none (Judgemental frame)
//   Courseware rows   date (600) + session (400), courseware name, station counts with the
//                     nominal-roll trainee count + hover list, Lane Assigned badge.
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { isRangeType, type CoursewareSchedule } from "../components/ScheduleStep";
import { stationProgress, type CoursewareLaneData } from "../laneConfigTypes";
import type { Trainee } from "../nominalRollTypes";
import type { Booking2DetailsSnapshot } from "../types";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Figma "10 Nov 2025". */
const fmtDate = (d: Date) => `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Session wording per Figma: "AM Session (08:00 AM - 12:00 PM)", "Full Day (08:00 AM - 05:00 PM)", "Ad-hoc". */
const SESSION_TEXT: Record<string, string> = {
  AM: "AM Session (08:00 AM - 12:00 PM)",
  PM: "PM Session (01:00 PM - 05:00 PM)",
  FullDaySingle: "Full Day (08:00 AM - 05:00 PM)",
  FullDayMultiple: "Full Day (08:00 AM - 05:00 PM)",
  AdHoc: "Ad-hoc",
};

function scheduleParts(sch: CoursewareSchedule | undefined): { date: string; session: string } {
  if (!sch?.scheduleType) return { date: "Not scheduled", session: "" };
  let date: string;
  if (isRangeType(sch.scheduleType)) {
    const s = sch.range?.start, e = sch.range?.end;
    date = s && e ? (s.toDateString() === e.toDateString() ? fmtDate(s) : `${fmtDate(s)} - ${fmtDate(e)}`) : "—";
  } else {
    date = sch.singleDate ? fmtDate(sch.singleDate) : "—";
  }
  // Ad-hoc (6183:504770): the clock range sits with the date — "24 Nov 2025 09:00 AM - 03:00 PM" | "Ad-hoc".
  if (sch.scheduleType === "AdHoc" && sch.startTime && sch.endTime) date = `${date} ${sch.startTime} - ${sch.endTime}`;
  return { date, session: SESSION_TEXT[sch.scheduleType] ?? "" };
}

const traineeWord = (n: number) => `${n} Trainee${n > 1 ? "s" : ""}`;

function TraineeHoverPreview({ trainees }: { trainees: Trainee[] }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Icon name="info" size={12} className="text-figma-body cursor-help" />
      {open && trainees.length > 0 && (
        <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 max-h-64 overflow-y-auto bg-white border border-figma-subtle rounded-lg shadow-xl p-2">
          {trainees.map((t) => (
            <div key={t.id} className="px-2 py-1.5 border-b border-gray-50 last:border-0">
              <p className="text-xs font-semibold text-figma-default">{t.name}</p>
              <p className="text-[11px] text-figma-disabled font-mono">{t.svcId}</p>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

/** Figma `Key Value`: 12/400 body title, 4px gap, 14/600 default value. */
function KeyValue({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-figma-body">{title}</p>
      <div className="text-sm font-semibold text-figma-default">{children}</div>
    </div>
  );
}

function StationCount({ count, label, trainees }: { count: number; label: string; trainees: Trainee[] }) {
  return (
    <span className="flex items-center gap-1">
      <span className="font-medium">{count} {label}</span>
      <span className="flex items-center gap-0.5">
        ({traineeWord(trainees.length)} <TraineeHoverPreview trainees={trainees} /> )
      </span>
    </span>
  );
}

interface ReviewBookingModalProps {
  detailsSnapshot: Booking2DetailsSnapshot;
  schedules: Record<string, CoursewareSchedule>;
  laneData: Record<string, CoursewareLaneData>;
  rolls: Record<string, Trainee[]>;
  trainingMode: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReviewBookingModal({ detailsSnapshot, schedules, laneData, rolls, trainingMode, onCancel, onConfirm }: ReviewBookingModalProps) {
  const isCollective = trainingMode === "Collective";
  const coursewareList = detailsSnapshot.courseware ? detailsSnapshot.courseware.split(",").map((c) => c.trim()).filter(Boolean) : [];
  const trainingDetails = [detailsSnapshot.trainingType, trainingMode].filter(Boolean).join(" · ");

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onCancel} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-[1024px] max-w-full h-[min(820px,calc(100vh-32px))] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-center gap-6 p-8 flex-shrink-0">
            <h3 className="flex-1 text-xl font-semibold text-figma-default">Review Your Booking</h3>
            <button
              type="button"
              aria-label="Close"
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-figma-default hover:bg-figma-soft"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <div className="px-8 flex-1 min-h-0 flex flex-col gap-5">
            <p className="text-sm text-figma-default">Verify the information before confirming.</p>

            <div className="flex items-stretch gap-5 flex-1 min-h-0">
              <div className="w-[384px] flex-shrink-0 self-start max-h-full overflow-y-auto bg-figma-soft border border-figma-subtle rounded-xl">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-figma-default">Booking Summary</h4>
                </div>
                <div className="px-4 pb-4 flex flex-col gap-4">
                  <KeyValue title="Training Details">
                    <p>{trainingDetails || "—"}</p>
                    <p>{detailsSnapshot.dryRun ? "Include Dry Run Training" : "Not Include Dry Run Training"}</p>
                  </KeyValue>
                  <KeyValue title="FTMS ID">{detailsSnapshot.ftmsId || "—"}</KeyValue>
                  <KeyValue title="Unit Name">{detailsSnapshot.unitName || "—"}</KeyValue>
                  <KeyValue title="Instructor">
                    <div className="flex flex-col gap-0.5">
                      <p>{detailsSnapshot.instructor || "—"}</p>
                      <p className="font-normal">{detailsSnapshot.unitContact || "—"}</p>
                    </div>
                  </KeyValue>
                  <KeyValue title="Weapon Type">{detailsSnapshot.weapons.join(", ") || "—"}</KeyValue>
                  {isCollective && <KeyValue title="Role">{detailsSnapshot.roles.join(", ") || "—"}</KeyValue>}
                  <KeyValue title="Briefing Room">{detailsSnapshot.briefingRoomName || "—"}</KeyValue>
                </div>
              </div>

              <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-figma-soft border border-figma-subtle rounded-xl">
                <div className="p-4 flex-shrink-0">
                  <h4 className="text-sm font-semibold text-figma-default">Courseware ({coursewareList.length})</h4>
                </div>
                {/* Fixed-height card: the list scrolls inside it (Figma shows a scrollbar on the right). */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {coursewareList.map((cw) => {
                    const { date, session } = scheduleParts(schedules[cw]);
                    const cwLanes = laneData[cw] ?? { flat: [], cshaped: [] };
                    const flatTrainees = rolls[`${cw}::flat`] ?? [];
                    const cshapedTrainees = rolls[`${cw}::cshaped`] ?? [];
                    const allComplete =
                      cwLanes.flat.every((s) => stationProgress(s, true, isCollective).complete) &&
                      cwLanes.cshaped.every((s) => stationProgress(s, false, isCollective).complete);
                    const nFlat = cwLanes.flat.length;
                    const nC = cwLanes.cshaped.length;
                    return (
                      <div key={cw} className="px-5 py-3 flex flex-col gap-2 border-t border-figma-subtle first:border-t last:border-b">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm text-figma-default flex flex-wrap gap-x-2">
                            <span className="font-semibold">{date}</span>
                            {session && <span>{session}</span>}
                          </p>
                          <p className="text-sm font-medium text-figma-body">{cw}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-nowrap whitespace-nowrap text-xs text-figma-body">
                          {nFlat > 0 && <StationCount count={nFlat} label={nFlat > 1 ? "Flat Screens" : "Flat Screen"} trainees={flatTrainees} />}
                          {nFlat > 0 && nC > 0 && <span>·</span>}
                          {nC > 0 && <StationCount count={nC} label="C-Shaped" trainees={cshapedTrainees} />}
                          <span className="pl-0.5">
                            {/* Figma Badge (success): 16px tall pill, 12px check, 12/500 text. The
                                incomplete variant is app-only (Figma has no such frame). */}
                            <span className={cn(
                              "inline-flex items-center gap-1 h-4 px-1 rounded-full border text-xs font-medium",
                              allComplete ? "bg-figma-successbg border-figma-successborder text-figma-success" : "bg-amber-50 border-amber-200 text-amber-700"
                            )}>
                              {allComplete && <Icon name="check" size={12} />}
                              {allComplete ? "Lane Assigned" : "Lane Incomplete"}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-8 flex-shrink-0">
            <Button type="button" onClick={onCancel} className="h-10 px-4 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white w-auto">
              Cancel
            </Button>
            <Button type="button" onClick={onConfirm} className="h-10 px-4 text-sm font-semibold text-white bg-figma-primary hover:bg-figma-primaryhover rounded-lg w-auto">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect } from "react";
import { Button } from "@/components/button";
import { Alert } from "@/components/alert";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";

/*
 * Review Your Booking — Data Import step after a successful Import.
 *
 * Figma `Review Booking - Import - All Lane Incomplete` (6046:35437) and
 * `… - Some Lane Incomplete` (6046:35458), section `Action - Import (Booking
 * Details)`. Both are an instance of the Create Booking review modal
 * (`Create Booking - Review Booking - Nominal Separate`) with one extra block, an
 * `Alert` (Kind outlined, Status warning, Description on) between the subtitle
 * and the two sub-section cards.
 *
 * Flow: Import Booking `Import - Filled Ready` (6046:35426) → this modal →
 * Confirm → `Toast - Success` (6046:35439, "Booking imported").
 *
 *   modal      1024 wide, 820 tall, radius 16. Header 32px padding, 20/600 title +
 *              40px `x` button. Content 32px side padding, 20px gap: subtitle 14/400,
 *              Alert, then Row (gap 20) = Booking Summary 384 + Courseware (n) fill.
 *              Footer 32px padding, Cancel + Confirm right-aligned, gap 12.
 *   item       `Courseware Item`: 20/12 padding, 8 gap. Date 14/600 + session 14/400 on
 *              one line, courseware name 14/500 `text/body`, metadata 12px `text/body`:
 *              "<n> Flat Screens (<n> Trainees ⓘ) · <n> C-Shaped (<n> Trainees ⓘ)" + the
 *              lane badge. A not-assigned item also has a 4px `background/warning/default`
 *              `Error Indicator` bar on its left edge. 1px `background/divider` under every item.
 *   badge      Lane Not Assigned = warning Badge with a 12px `triangle-alert`;
 *              Lane Assigned = success Badge with a 12px `check`.
 *
 * The import mock (a file name and "18 rows ready to import") carries no booking
 * content, so every value below is Figma's own sample data — see the report in
 * docs/figma-audit/FIXES.md (F-012). The two variants alternate import by import
 * so both Figma frames are reachable.
 */

export type ImportReviewVariant = "all" | "some";

interface ReviewStations {
  count: number;
  trainees: number;
}

interface ReviewCourseware {
  id: string;
  date: string;
  session: string;
  name: string;
  flat: ReviewStations;
  cshaped?: ReviewStations;
  laneAssigned: boolean;
}

const SUMMARY = {
  trainingDetails: "Group · Collective",
  dryRun: "Include Dry Run Training",
  ftmsId: "—",
  unitName: "Unit Alpha",
  instructor: "CPT Daren Ong",
  instructorContact: "+1 91234567",
  weaponType: "GPMG, LMG, M110, M203, MATADOR, PSLAM, SAR21, SPIKE LR, SPIKE SR",
  role: "F.O / OC, GPMG Team (STEELNET), M110 Team (SNIPERS), M203, MATADOR",
  briefingRoom: "L1BR-01, L4BR-01, L4BR-02",
};

const COURSEWARE: Record<ImportReviewVariant, ReviewCourseware[]> = {
  // 6046:35437 — every session is "Lane Not Assigned".
  all: [
    { id: "cw1", date: "10 Nov 2025", session: "AM Session (08:00 AM - 12:00 PM)", name: "Blockforce Training", flat: { count: 5, trainees: 32 }, cshaped: { count: 2, trainees: 10 }, laneAssigned: false },
    { id: "cw2", date: "10 Nov 2025", session: "PM Session (01:00 PM - 05:00 PM)", name: "Component Type Training (A-E)", flat: { count: 5, trainees: 0 }, cshaped: { count: 2, trainees: 10 }, laneAssigned: false },
    { id: "cw3", date: "11 Nov 2025", session: "Full Day (08:00 AM - 05:00 PM)", name: "Component Type Training (F-J)", flat: { count: 5, trainees: 32 }, cshaped: { count: 2, trainees: 10 }, laneAssigned: false },
  ],
  // 6046:35458 — the first session is not assigned, the other two are.
  some: [
    { id: "cw1", date: "10 Nov 2025", session: "AM Session (08:00 AM - 12:00 PM)", name: "Blockforce Training", flat: { count: 5, trainees: 32 }, cshaped: { count: 2, trainees: 10 }, laneAssigned: false },
    { id: "cw2", date: "10 Nov 2025", session: "PM Session (01:00 PM - 05:00 PM)", name: "Component Type Training (A-E)", flat: { count: 1, trainees: 0 }, laneAssigned: true },
    { id: "cw3", date: "11 Nov 2025", session: "Full Day (08:00 AM - 05:00 PM)", name: "Component Type Training (F-J)", flat: { count: 5, trainees: 32 }, cshaped: { count: 2, trainees: 10 }, laneAssigned: true },
  ],
};

const traineeWord = (n: number) => `${n} Trainee${n > 1 ? "s" : ""}`;

/** Figma `Key Value`: 12/400 body title, 4px gap, 14/600 default value. */
function KeyValue({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-body">{title}</p>
      <div className="text-sm font-semibold text-default">{children}</div>
    </div>
  );
}

/** "5 Flat Screens (32 Trainees ⓘ)" — the ⓘ is hidden by Figma when the count is 0. */
function StationCount({ label, stations }: { label: string; stations: ReviewStations }) {
  return (
    <span className="flex items-center gap-1">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-0.5">
        ({traineeWord(stations.trainees)}
        {stations.trainees > 0 && <Icon name="info" size={12} className="text-body" />})
      </span>
    </span>
  );
}

function CoursewareItem({ item }: { item: ReviewCourseware }) {
  const { flat, cshaped } = item;
  return (
    <div className="relative">
      <div className="flex flex-col gap-2 px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="flex flex-wrap gap-x-2 text-sm text-default">
            <span className="font-semibold">{item.date}</span>
            <span>{item.session}</span>
          </p>
          <p className="text-sm font-medium text-body">{item.name}</p>
        </div>
        <div className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-xs text-body">
          <StationCount label={`${flat.count} Flat Screen${flat.count > 1 ? "s" : ""}`} stations={flat} />
          {cshaped && (
            <>
              <span>·</span>
              <StationCount label={`${cshaped.count} C-Shaped`} stations={cshaped} />
            </>
          )}
          <span className="flex px-0.5">
            {item.laneAssigned ? (
              <StatusBadge tone="success" className="h-4 gap-1 py-0 pl-1">
                <Icon name="check" size={12} />
                Lane Assigned
              </StatusBadge>
            ) : (
              <StatusBadge tone="warning" className="h-4 gap-1 py-0 pl-1">
                <Icon name="triangle-alert" size={12} />
                Lane Not Assigned
              </StatusBadge>
            )}
          </span>
        </div>
      </div>
      {!item.laneAssigned && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-warning-default" />}
      <div className="h-px bg-divider" />
    </div>
  );
}

export interface ImportReviewModalProps {
  variant: ImportReviewVariant;
  /** Cancel, the X, the scrim and Escape all dismiss without importing. */
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImportReviewModal({ variant, onCancel, onConfirm }: ImportReviewModalProps) {
  const courseware = COURSEWARE[variant];
  const hasUnassigned = courseware.some((c) => !c.laneAssigned);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onCancel} />
      <div className="pointer-events-none fixed inset-0 z-[2100] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-review-title"
          className="pointer-events-auto flex h-[min(820px,calc(100vh-32px))] w-[1024px] max-w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        >
          <div className="flex flex-shrink-0 items-center gap-6 p-8">
            <h3 id="import-review-title" className="flex-1 text-xl font-semibold text-default">
              Review Your Booking
            </h3>
            <button
              type="button"
              aria-label="Close"
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-default hover:bg-default-soft"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-5 px-8">
            <p className="text-sm text-default">Verify the information before confirming.</p>

            {hasUnassigned && (
              <Alert
                message="Lane configuration is incomplete"
                description="Some courseware sessions do not have a lane assignment. You can confirm the booking and configure lanes later."
              />
            )}

            <div className="flex min-h-0 flex-1 items-stretch gap-5">
              <div className="max-h-full w-[384px] flex-shrink-0 self-start overflow-y-auto rounded-xl border border-invert-default bg-default-soft">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-default">Booking Summary</h4>
                </div>
                <div className="flex flex-col gap-4 px-4 pb-4">
                  <KeyValue title="Training Details">
                    <p>{SUMMARY.trainingDetails}</p>
                    <p>{SUMMARY.dryRun}</p>
                  </KeyValue>
                  <KeyValue title="FTMS ID">{SUMMARY.ftmsId}</KeyValue>
                  <KeyValue title="Unit Name">{SUMMARY.unitName}</KeyValue>
                  <KeyValue title="Instructor">
                    <div className="flex flex-col gap-0.5">
                      <p>{SUMMARY.instructor}</p>
                      <p className="font-normal">{SUMMARY.instructorContact}</p>
                    </div>
                  </KeyValue>
                  <KeyValue title="Weapon Type">{SUMMARY.weaponType}</KeyValue>
                  <KeyValue title="Role">{SUMMARY.role}</KeyValue>
                  <KeyValue title="Briefing Room">{SUMMARY.briefingRoom}</KeyValue>
                </div>
              </div>

              <div className="flex max-h-full min-h-0 min-w-0 flex-1 flex-col self-start overflow-hidden rounded-xl border border-invert-default bg-default-soft">
                <div className="flex-shrink-0 p-4">
                  <h4 className="text-sm font-semibold text-default">Courseware ({courseware.length})</h4>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {courseware.map((cw) => (
                    <CoursewareItem key={cw.id} item={cw} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 justify-end gap-3 p-8">
            <Button
              type="button"
              onClick={onCancel}
              className="h-10 w-auto rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="h-10 w-auto rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

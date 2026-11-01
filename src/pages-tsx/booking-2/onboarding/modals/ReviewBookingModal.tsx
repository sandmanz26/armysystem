// Booking 2.0 Onboarding — Step 4, "Review Your Booking" (Figma
// `5348:23581`, section "Onboarding - Review Booking"). Gates "Begin
// Session": the booking's Session Details (Base Stations / Total Details /
// Total Trainees, computed from the just-confirmed Detail List) alongside a
// read-only Booking Summary. Sibling of the Create Booking flow's own
// `booking-2/create/modals/ReviewBookingModal.tsx` (same card language —
// bg-figma-soft summary card, Button component, figma-* tokens) but
// different content: Onboarding already has real Detail List numbers to
// show, Create Booking doesn't yet.
//
// Figma shows 3 courseware-driven copy variants (Collective has a "Role"
// row and no others do — confirmed Collective-only by
// docs/OPEN-DECISIONS.md's "Also worth a glance" table) plus a 4th,
// VTS-gated variant: a neutral info banner + a disabled "Begin Session".
// Per docs/OPEN-DECISIONS.md Q11, VTS itself is out of scope for TOMS — we
// only keep the disabled-state UI, with no real signal to drive it yet, so
// `vtsReady` defaults to true (normal flow) until a trigger is decided.
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewStationRow {
  label: string;
  type: "flat" | "cshaped";
  totalDetails: number;
  totalTrainees: number;
}

interface ReviewBookingModalProps {
  courseware: string;
  trainingType: string;
  trainingMode: string;
  dryRunTraining: boolean;
  instructorName?: string;
  instructorPhone?: string;
  weaponTypes: string[];
  roles: string[];
  briefingRoom?: string;
  bookingTimeRaw?: string;
  stationRows: ReviewStationRow[];
  /** No real VTS signal exists yet (Q11) — defaults to true so the normal
      flow isn't blocked; the disabled-state UI stays available to wire up
      once a trigger is decided. */
  vtsReady?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReviewBookingModal({
  courseware,
  trainingType,
  trainingMode,
  dryRunTraining,
  instructorName,
  instructorPhone,
  weaponTypes,
  roles,
  briefingRoom,
  bookingTimeRaw,
  stationRows,
  vtsReady = true,
  onCancel,
  onConfirm,
}: ReviewBookingModalProps) {
  const isCollective = trainingMode === "Collective";
  const [bookingDateLine, bookingTimeLine] = (bookingTimeRaw || "").split("\n");
  const grandTotalDetails = stationRows.reduce((sum, r) => sum + r.totalDetails, 0);
  const grandTotalTrainees = stationRows.reduce((sum, r) => sum + r.totalTrainees, 0);

  return (
    <>
      <div className="fixed inset-0 z-[2000] bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden">
          <div className="flex items-start justify-between px-6 py-5 border-b border-figma-subtle flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-figma-default">Review Your Booking</h3>
            </div>
            <button type="button" onClick={onCancel} className="p-1 -mr-1 -mt-1 rounded-md text-figma-disabled hover:bg-figma-soft">
              <X size={18} />
            </button>
          </div>

          {!vtsReady && (
            <div className="mx-6 mt-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-figma-muted border border-figma-line flex-shrink-0">
              <Info size={16} className="text-figma-default flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-figma-default">
                Waiting for signal from VTS. Begin Session will be enabled once the connection is confirmed.
              </p>
            </div>
          )}

          <p className="px-6 pt-4 text-sm text-figma-body flex-shrink-0">Verify the information before begin session.</p>

          <div className="px-6 py-5 overflow-y-auto flex-1 grid grid-cols-2 gap-5">
            <div className="bg-figma-soft border border-figma-subtle rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-figma-default">Booking Summary</h4>

              <div>
                <p className="text-xs text-figma-body">Training Details</p>
                <p className="text-sm font-semibold text-figma-default">{trainingType} · {trainingMode}</p>
                <p className="text-sm font-semibold text-figma-default">{dryRunTraining ? "Include" : "Not Include"} Dry Run Training</p>
              </div>

              <div>
                <p className="text-xs text-figma-body">Instructor</p>
                <p className="text-sm font-semibold text-figma-default">{instructorName || "—"}</p>
                <p className="text-sm text-figma-default">{instructorPhone || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-figma-body">Courseware</p>
                <p className="text-sm font-semibold text-figma-default">{courseware || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-figma-body">Weapon Type</p>
                <p className="text-sm font-semibold text-figma-default">{weaponTypes.join(", ") || "—"}</p>
              </div>

              {isCollective && (
                <div>
                  <p className="text-xs text-figma-body">Role</p>
                  <p className="text-sm font-semibold text-figma-default">{roles.join(", ") || "—"}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-figma-body">Briefing Room</p>
                <p className="text-sm font-semibold text-figma-default">{briefingRoom || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-figma-body">Booking Time</p>
                <p className="text-sm font-semibold text-figma-default">{bookingDateLine || "—"}</p>
                {bookingTimeLine && <p className="text-sm text-figma-default">{bookingTimeLine}</p>}
              </div>
            </div>

            <div className="bg-figma-soft border border-figma-subtle rounded-xl p-5">
              <h4 className="text-sm font-bold text-figma-default mb-3">Session Details</h4>
              <div className="bg-white border border-figma-subtle rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-figma-dangersoft/70 text-figma-primary text-xs">
                      <th className="text-left font-semibold px-3 py-2">Base Stations</th>
                      <th className="text-left font-semibold px-3 py-2">Total Details</th>
                      <th className="text-left font-semibold px-3 py-2">Total Trainees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stationRows.map((row) => (
                      <tr key={`${row.type}-${row.label}`} className="border-t border-figma-subtle">
                        <td className="px-3 py-2 text-figma-default flex items-center gap-2">
                          {row.label}
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                              row.type === "flat" ? "bg-figma-dangerbg text-figma-danger" : "bg-figma-infobg text-figma-info"
                            )}
                          >
                            {row.type === "flat" ? "Flat Screen" : "C-Shaped"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-figma-default">{row.totalDetails}</td>
                        <td className="px-3 py-2 text-figma-default">{row.totalTrainees}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-figma-subtle">
                      <td className="px-3 py-2 font-bold text-figma-default">Grand Total</td>
                      <td className="px-3 py-2 font-bold text-figma-default">{grandTotalDetails}</td>
                      <td className="px-3 py-2 font-bold text-figma-default">{grandTotalTrainees}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-figma-subtle flex-shrink-0">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-figma-default border border-figma-subtle rounded-lg hover:bg-figma-soft bg-white">
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!vtsReady}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg",
                vtsReady ? "text-white bg-figma-primary hover:bg-figma-primaryhover" : "bg-figma-fielddisabled text-figma-disabled cursor-not-allowed"
              )}
            >
              Begin Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

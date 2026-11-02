// Booking 2.0 — Booking Details header actions after the session (F-006, BD-3 / BD-23).
// Which buttons show for which status + Assignment phase: see the table in ./postSession.ts.
import { useState } from "react";
import type { Booking, BookingStatus } from "@/data/mock";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { OwnershipTransferredModal } from "@/components/ownership-transferred-modal";
import { Icon } from "@/components/icon";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { ASSIGNMENT_BADGE, initialPhase, readPostSession, sessionTimes, writePostSession, type PostSessionPhase } from "./postSession";
import { scanUrl } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import { MOCK_ASSET_COUNT } from "./detailMocks";
import type { OwnershipTransfer } from "./ownershipTransfer";

const TRAINING_RESULT_PATH = "/training-results-2/detail";

/** Phase + status state of a post-session booking, and the Courseware Details overrides. */
export function usePostSession(booking: Booking, status: BookingStatus) {
  const [phase, setPhaseState] = useState<PostSessionPhase>(() => initialPhase(booking, status));
  // F-009: phase / status survive the round trip to the Scan & Return page (postSession store).
  const [statusOverride, setStatusState] = useState<BookingStatus | null>(() => readPostSession(booking.id).status ?? null);
  const setPhase = (p: PostSessionPhase) => {
    setPhaseState(p);
    writePostSession(booking.id, { phase: p });
  };
  const setStatusOverride = (s: BookingStatus) => {
    setStatusState(s);
    writePostSession(booking.id, { status: s });
  };
  const effectiveStatus = statusOverride ?? status;
  const badge = ASSIGNMENT_BADGE[phase];
  const showId = phase !== "not-issued" && booking.assignmentId && booking.assignmentId !== "-";
  // Figma `Badge - Assignment Status` sits under the Assignment ID, which is `text/primary`
  // once an assignment exists (5029:55565).
  const assignment = (
    <div className="flex flex-col items-start gap-1">
      {showId && <p className="text-sm font-semibold leading-5 text-primary">{booking.assignmentId}</p>}
      <StatusBadge tone={badge.tone} className="leading-4">{badge.label}</StatusBadge>
    </div>
  );
  return {
    phase,
    setPhase,
    status: effectiveStatus,
    setStatus: setStatusOverride,
    session: { assignment, ...sessionTimes(booking, effectiveStatus, phase) },
  };
}

const SECONDARY = "flex h-10 items-center gap-2 px-4 text-sm font-semibold text-default border border-invert-default rounded-lg hover:bg-default-soft bg-surface";
const PRIMARY = "flex h-10 items-center gap-2 px-4 text-sm font-semibold rounded-lg bg-primary-default text-invert-default hover:bg-primary-hovered transition-colors";

interface PostSessionActionsProps {
  booking: Booking;
  status: BookingStatus;
  phase: PostSessionPhase;
  onPhaseChange: (p: PostSessionPhase) => void;
  onStatusChange: (s: BookingStatus) => void;
  onToast: (msg: string) => void;
  onNavigate?: (path: string) => void;
  /**
   * F-012 (BD-19): set when the courseware being readied has a sibling courseware that takes over its
   * assets (see ./ownershipTransfer.ts). Ready For Return then ends in the "Asset Ownership Transferred"
   * modal instead of the plain "Pending Return" change. Omitted/null = existing behaviour.
   */
  ownershipTransfer?: OwnershipTransfer | null;
  /** Called when the transfer happens, so the page can mark the two courseware (Ownership Transferred / Received). */
  onOwnershipTransferred?: () => void;
}

export function PostSessionActions({
  booking, status, phase, onPhaseChange, onStatusChange, onToast, onNavigate, ownershipTransfer, onOwnershipTransferred,
}: PostSessionActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  // Figma draws this toast top-right on Booking Details (6846:95185); the page's own toast is bottom-centre.
  const [transferToast, setTransferToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"ready" | "missing" | null>(null);
  const viewResult = () => onNavigate?.(`${TRAINING_RESULT_PATH}?bookingId=${encodeURIComponent(booking.id)}`);

  const isReturn = status === "Return Assets";
  const isOverdue = status === "Overdue";
  const isCompleted = status === "Completed" || status === "Completed with Missing Assets";

  const showReadyForReturn = (isReturn && phase === "pending-return") || (isOverdue && phase === "issued");
  const showReturnAssets = (isReturn && (phase === "return-assets" || phase === "partial-return")) || (isOverdue && phase === "pending-return");
  const showCompleteMissing = isReturn && phase === "partial-return";
  // Only Return Assets carries the ⋮ menu (`Dropdown - Booking`, one item: View Training Result).
  const showMenu = isReturn;

  if (!isCompleted && !showReadyForReturn && !showReturnAssets && !showMenu) return null;

  const assetCount = MOCK_ASSET_COUNT[booking.id] ?? 10;

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {isCompleted && (
        <button type="button" onClick={viewResult} className={SECONDARY}>
          View Training Result
        </button>
      )}
      {showCompleteMissing && (
        <button type="button" onClick={() => setConfirm("missing")} className={SECONDARY}>
          <Icon name="check" size={18} />
          Complete With Missing Assets
        </button>
      )}
      {showReadyForReturn && (
        <button type="button" onClick={() => setConfirm("ready")} className={PRIMARY}>
          <Icon name="package-check" size={18} />
          Ready For Return Assets
        </button>
      )}
      {showReturnAssets && (
        // F-009 BD-20 / SH-4: opens Scan & Return Assets (5895:412248 — 5895:423063 is only the
        // section's link frame). Full return → Completed / Returned; partial → Return Assets with
        // Complete With Missing Assets (6501:244728). Comes back here with "{n} assets returned".
        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              scanUrl(
                "/bookings/issue-assets",
                "return",
                { bookingIds: booking.id, baseStation: booking.assignedStations?.[0] },
                `/bookings/detail?id=${booking.id}`,
              ),
            )
          }
          className={PRIMARY}
        >
          <Icon name="scan-line" size={18} />
          Return Assets
        </button>
      )}
      {showMenu && (
        <div className="relative">
          <button
            type="button"
            aria-label="More actions"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-invert-default text-default hover:bg-default-soft bg-surface"
          >
            <Icon name="ellipsis-vertical" size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              {/* Figma `Listbox New` (5029:54570): 224 wide, radius 8, 4px vertical padding. */}
              <div className="absolute right-0 mt-1 w-56 rounded-lg bg-surface py-1 shadow-lg z-20">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); viewResult(); }}
                  className={cn("flex h-9 w-full items-center gap-2.5 px-3 text-left text-sm font-medium text-default hover:bg-default-soft")}
                >
                  <Icon name="clipboard-check" size={20} />
                  View Training Result
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Figma `Action - Ready For Return Assets` › Confirmation (5889:294479) + toast (5889:294481). */}
      <ConfirmDialog
        open={confirm === "ready"}
        tone="warning"
        title="Ready to return these assets?"
        subtitle={`${assetCount} assets will change to Pending Return. This can't be undone.`}
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          if (ownershipTransfer) {
            // BD-19: the assets move to the sibling courseware's assignment — no return, no reissue.
            onPhaseChange("ownership-transferred");
            onOwnershipTransferred?.();
            setTransferOpen(true);
            return;
          }
          onPhaseChange(isOverdue ? "pending-return" : "return-assets");
          onToast("Ready for return request submitted successfully");
        }}
      />

      {/* Figma `Asset Ownership Transferred` (6848:96288 / 6851:136263), then the Details toast (6846:95185). */}
      {ownershipTransfer && (
        <OwnershipTransferredModal
          open={transferOpen}
          from={ownershipTransfer.from}
          to={ownershipTransfer.to}
          nextSteps={ownershipTransfer.nextSteps}
          onClose={() => {
            setTransferOpen(false);
            setTransferToast(`Asset ownership ${ownershipTransfer.from.assignmentId} transferred`);
          }}
        />
      )}
      <Toast message={transferToast ?? ""} open={transferToast !== null} onDismiss={() => setTransferToast(null)} placement="top-right" />

      {/* Figma `Action - Complete With Missing Asset` › Confirmation (6501:245297) + toast (6501:245299). */}
      <ConfirmDialog
        open={confirm === "missing"}
        tone="warning"
        title="Complete booking with missing assets?"
        subtitle={
          <>
            Some assets have not been returned. They will be marked as <b>Missing</b>, and the booking will be
            marked as <b>Completed</b>. <b>This action can't be undone.</b>
          </>
        }
        confirmLabel="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          onPhaseChange("missing");
          onStatusChange("Completed with Missing Assets");
          onToast("Booking marked Completed, assets recorded as Missing");
        }}
      />
    </div>
  );
}

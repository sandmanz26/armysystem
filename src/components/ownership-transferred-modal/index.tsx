import { useEffect } from "react";
import type { ReactNode } from "react";
import { Alert } from "@/components/alert";
import { Icon } from "@/components/icon";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";

/*
 * Asset Ownership Transferred — Figma `Booking Details: Ongoing` (6818:671556), section
 * `Asset Ownership Transferred (CW A & CW B on Same Booking Slot, Different Base Station)` (6848:96288)
 * and `… on Different Booking Slot, Same Base Station` (6851:136263). An acknowledge-only info modal:
 * the system has moved the assets to the next assignment by itself, the user decides nothing.
 *
 *   panel   1024 wide (Modal Size=lg), radius 16, white, over a black 30% scrim
 *   header  32 padding (21 right), 20 Semi Bold title, 40px ✕ text button
 *   content 32 side padding, 20px gap: one 14 line, then `From (Previous Assignment)` ▸ arrow ▸
 *           `To (New Assignment)` (two 440px cards, 20px apart around a 40px grey round arrow),
 *           then an info `Alert` "What happens next?" + the scenario's sentence
 *   footer  32 padding, one primary `Got It`, right-aligned
 *
 * Card rows (`Key Value`, 128px label in `text/body`, value 14 Semi Bold): Booking ID · Courseware ·
 * Booking Time (date over session) · Booking Status (badge) · Assignment ID (id over badge).
 */

export interface OwnershipAssignmentCard {
  bookingId: string;
  courseware: string;
  /** "24 Nov 2025" */
  bookingDate: string;
  /** "AM Session (08:00 AM - 12:00 PM)" */
  bookingSession: string;
  bookingStatus: { label: string; tone: BadgeTone };
  assignmentId: string;
  assignmentStatus: { label: string; tone: BadgeTone };
}

export interface OwnershipTransferredModalProps {
  open: boolean;
  from: OwnershipAssignmentCard;
  to: OwnershipAssignmentCard;
  /** The sentence under "What happens next?". */
  nextSteps: ReactNode;
  onClose: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-0.5">
      <span className="w-32 flex-shrink-0 text-sm leading-5 text-body">{label}</span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-sm font-semibold leading-5 text-default">{children}</div>
    </div>
  );
}

function Card({ title, data }: { title: string; data: OwnershipAssignmentCard }) {
  return (
    <section className="w-[440px] min-w-0 flex-1 rounded-lg border border-invert-default bg-surface">
      <header className="p-4">
        <h3 className="text-sm font-semibold leading-5 text-default">{title}</h3>
      </header>
      <div className="flex flex-col gap-4 px-4 pb-4">
        <Row label="Booking ID">{data.bookingId}</Row>
        <Row label="Courseware">{data.courseware}</Row>
        <Row label="Booking Time">
          <span>{data.bookingDate}</span>
          <span className="font-normal">{data.bookingSession}</span>
        </Row>
        <Row label="Booking Status">
          <StatusBadge tone={data.bookingStatus.tone} className="leading-4">{data.bookingStatus.label}</StatusBadge>
        </Row>
        <Row label="Assignment ID">
          <span>{data.assignmentId}</span>
          <StatusBadge tone={data.assignmentStatus.tone} className="leading-4">{data.assignmentStatus.label}</StatusBadge>
        </Row>
      </div>
    </section>
  );
}

export function OwnershipTransferredModal({ open, from, to, nextSteps, onClose }: OwnershipTransferredModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative max-h-full w-[1024px] max-w-full overflow-auto rounded-2xl bg-surface shadow-2xl">
        <div className="flex items-center gap-6 py-8 pl-8 pr-[21px]">
          <h2 className="min-w-0 flex-1 text-xl font-semibold text-default">Asset Ownership Transferred</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-default hover:bg-default-hovered transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-8">
          <p className="text-sm text-default">
            The system has automatically moved these assets to the next assignment. No return or reissue needed.
          </p>
          <div className="flex items-center gap-5">
            <Card title="From (Previous Assignment)" data={from} />
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-default-default text-default">
              <Icon name="arrow-right" size={18} />
            </span>
            <Card title="To (New Assignment)" data={to} />
          </div>
          <Alert status="info" message="What happens next?" description={nextSteps} />
        </div>

        <div className="flex justify-end p-8">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

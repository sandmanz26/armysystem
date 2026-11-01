// Booking 2.0 Onboarding — "Leave without completing details?" (F-009, O-5).
//
// Figma `Action - Scan ID` › `Confirmation - Close`, one per booking shape:
//   - Flat Screen & C-Shaped (5622:159529): the walk-ins have no Base Station Type yet, so
//     they stay out of the Nominal Roll List until completed via "Incomplete Trainee".
//   - Flat Screen only (5626:192274): the walk-ins are saved to the Nominal Roll as they are.
// Both are the shared 512px `Modal Confirmation` (warning), first words bold (700).
import { ConfirmDialog } from "@/components/confirm-dialog";

interface LeaveIncompleteDialogProps {
  open: boolean;
  count: number;
  hasCShaped: boolean;
  onContinue: () => void;
  onLeave: () => void;
}

export function LeaveIncompleteDialog({ open, count, hasCShaped, onContinue, onLeave }: LeaveIncompleteDialogProps) {
  const lead = <strong className="font-bold">{count} non-registered trainees</strong>;
  return (
    <ConfirmDialog
      open={open}
      tone="warning"
      className="w-[512px]"
      title="Leave without completing details?"
      subtitle={hasCShaped ? (
        <>{lead} are missing Base Station Type. They won&apos;t appear in the Nominal Roll List until their details are completed, you can find and finish them anytime from View Incomplete Trainees.</>
      ) : (
        <>{lead} are missing required details. They&apos;ll be saved to the Nominal Roll, but their details must be completed before this booking can proceed.</>
      )}
      cancelLabel={hasCShaped ? "Continue Editing" : "Continue Filling In"}
      confirmLabel="Yes, Leave"
      onCancel={onContinue}
      onConfirm={onLeave}
    />
  );
}

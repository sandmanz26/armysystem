import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";

/*
 * Figma `Action - Bulk Select` — "Turn on alarm for {n} readers?" /
 * "Turn off alarm for {n} readers?" (5166:209382 / 5166:209377), same
 * warning-toned confirmation (triangle-alert on
 * background/warning/invert/default) reused here for the per-row Alarm
 * On/Off command in `Dropdown - Table Row More`, with count = 1. Figma's
 * own copy keeps "readers" un-pluralized regardless of count (matches its
 * toast text) — kept exactly as written, not grammar-corrected.
 */
interface AlarmConfirmModalProps {
  count: number;
  turnOn: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AlarmConfirmModal({ count, turnOn, onClose, onConfirm }: AlarmConfirmModalProps) {
  return (
    <Modal open={true} onClose={onClose} isUseX={false} width={400}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-invert-default flex items-center justify-center">
          <AlertTriangle size={20} className="text-warning" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-default">
            Turn {turnOn ? "on" : "off"} alarm for {count} readers?
          </h2>
          <p className="text-sm text-body mt-0.5">
            {turnOn
              ? `The alarm will trigger on all ${count} selected readers if unexpected activity is detected.`
              : `The alarm will be disabled on all ${count} selected readers. You won't be notified of activity on these readers until they're turned back on.`}
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-invert-default text-default hover:bg-default-soft transition-colors bg-surface"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary-default text-invert-default hover:bg-primary-hovered transition-colors"
        >
          Turn {turnOn ? "On" : "Off"}
        </Button>
      </div>
    </Modal>
  );
}

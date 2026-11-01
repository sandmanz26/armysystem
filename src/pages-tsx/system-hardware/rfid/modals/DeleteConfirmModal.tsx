import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import type { RFIDReader } from "../types";

interface DeleteConfirmModalProps {
  readers: RFIDReader[];
  onClose: () => void;
  onConfirm: () => void;
}

// Figma has two separate confirmations: a single-reader one that quotes the
// reader's name ("Delete "RFID Reader 01"?", `Action - Delete RFID Reader`
// 5162:191322) and a bulk one that gives a count ("Delete 2 RFID readers?",
// `Action - Bulk Select` 5337:489167) — both warning-toned (triangle-alert
// on background/warning/invert/default), not danger, and both share the
// same "This can't be undone." subtitle.
export function DeleteConfirmModal({ readers, onClose, onConfirm }: DeleteConfirmModalProps) {
  const title =
    readers.length === 1 ? `Delete "${readers[0].displayName}"?` : `Delete ${readers.length} RFID readers?`;

  return (
    <Modal open={true} onClose={onClose} isUseX={false} width={400}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-invert-default flex items-center justify-center">
          <AlertTriangle size={20} className="text-warning" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-default">{title}</h2>
          <p className="text-sm text-body mt-0.5">This can't be undone.</p>
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
          Delete
        </Button>
      </div>
    </Modal>
  );
}

import { Check } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";

export function CompleteMissingAssetsModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} width="500px" isUseX={false}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <div className="w-9 h-9 rounded-full border-2 border-green-500 flex items-center justify-center">
            <Check size={18} className="text-green-600" strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-xl leading-7 font-bold text-gray-800">Complete this booking with missing assets?</h3>
        </div>
      </div>

      <p className="text-sm leading-6 text-gray-500 mb-6">
        The booking will be marked as completed and all sessions under it will be set to completed. This action cannot be undone.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="w-full justify-center bg-[#F5ECEA] text-[#9B231A] hover:bg-[#F0E1DE]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full justify-center bg-brand-primary text-white hover:bg-brand-primary-hover"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

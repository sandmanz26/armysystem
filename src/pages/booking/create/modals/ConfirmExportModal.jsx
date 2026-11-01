import { Check } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
export function ConfirmExportModal({ onCancel, onConfirm }) {
    return (<Modal open={true} onClose={onCancel} width={448} isUseX={false}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <Check size={28} className="text-green-500" strokeWidth={2.5}/>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Export to MIOS</h3>
        <p className="text-sm text-gray-500 mb-8">
          You are about to export the Nominal Roll data to MIOS. Once confirmed, the data will be sent and processed. Do you want to proceed?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button type="outline" onClick={onCancel} className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="py-3 text-sm font-semibold w-full bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>);
}

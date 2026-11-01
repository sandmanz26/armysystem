import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
export function DeleteConfirmModal({ count, onClose, onConfirm }) {
    return (<Modal open={true} onClose={onClose} isUseX={false} width={400}>
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500"/>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Delete RFID Reader</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Are you sure you want to delete {count} reader{count > 1 ? "s" : ""}? This action
            cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white">
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
          Delete
        </Button>
      </div>
    </Modal>);
}

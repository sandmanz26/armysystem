import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
export function CoursewareModal({ preSelectedBooking, onConfirm, onClose }) {
    return (<Modal open={true} onClose={onClose} width={448}>
      <div className="-mt-2">
        <h2 className="text-base font-bold text-gray-900">Select Courseware</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the courseware you want to issue assignment. You can only select one course to
          proceed.
        </p>
      </div>

      <div className="mt-5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Courseware <span className="text-red-500">*</span>
        </label>
        <button type="button" disabled className="w-full px-3.5 py-2.5 text-left border border-gray-200 rounded-lg bg-gray-50 text-sm flex items-center justify-between">
          <span className="text-gray-900 font-medium">
            {preSelectedBooking?.courseware || "—"}
          </span>
          <ChevronDown size={14} className="text-gray-300"/>
        </button>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-800 text-white rounded-lg text-sm font-semibold hover:bg-red-900">
          Confirm
        </Button>
      </div>
    </Modal>);
}

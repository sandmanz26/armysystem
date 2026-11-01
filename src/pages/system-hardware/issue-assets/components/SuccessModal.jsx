import { Check } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
export function SuccessModal({ onClose, onViewAssignment }) {
    return (<Modal open={true} onClose={onClose} width={384} isUseX={false}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check size={32} className="text-green-600" strokeWidth={2.5}/>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Assignment Created!</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Assets have been successfully issued and the assignment has been recorded.
        </p>
        <Button type="button" onClick={onViewAssignment} className="w-full px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover">
          View Assignment
        </Button>
      </div>
    </Modal>);
}

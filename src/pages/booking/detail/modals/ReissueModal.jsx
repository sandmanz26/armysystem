import { useState } from "react";
import { Modal } from "@/components/modal-1";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
const MOCK_ASSIGNMENTS = [
    { id: "#260422-AT001", courseware: "Component Type Training A" },
    { id: "#260422-AT002", courseware: "Component Type Training B" },
    { id: "#260422-AT003", courseware: "Component Type Training C" },
];
export function ReissueModal({ open, onClose }) {
    const [selectedAssignment, setSelectedAssignment] = useState("");
    const [selectedCW, setSelectedCW] = useState("Component Type Training B");
    const [assignOpen, setAssignOpen] = useState(false);
    const [cwOpen, setCwOpen] = useState(false);
    return (<Modal open={open} onClose={onClose} width="500px">
      <div className="flex items-center gap-4 mb-8 -mt-2">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={26} className="text-green-500" strokeWidth={2.5}/>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Reissue Assets from Another Booking</h3>
          <p className="text-sm text-gray-500 mt-0.5">Select another Booking ID to reissue assets</p>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Assignment <span className="text-brand-primary">*</span></label>
          <div className="relative">
            <Button type="outline" onClick={() => { setAssignOpen(!assignOpen); setCwOpen(false); }} className={cn("w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-sm", assignOpen ? "border-gray-800" : "border-gray-200 hover:border-gray-300")}>
              <span className={selectedAssignment ? "text-gray-800" : "text-gray-400"}>{selectedAssignment || "Select assignment"}</span>
              <ChevronDown size={18} className="text-gray-500"/>
            </Button>
            {assignOpen && (<div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {MOCK_ASSIGNMENTS.map((a) => (<button key={a.id} type="button" onClick={() => { setSelectedAssignment(a.id); setSelectedCW(a.courseware); setAssignOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                    <div className="font-medium">{a.id}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{a.courseware}</div>
                  </button>))}
              </div>)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Courseware <span className="text-brand-primary">*</span></label>
          <div className="relative">
            <Button type="outline" onClick={() => { setCwOpen(!cwOpen); setAssignOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300">
              <span className="text-gray-800">{selectedCW}</span>
              <ChevronDown size={18} className="text-gray-500"/>
            </Button>
            {cwOpen && (<div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {MOCK_ASSIGNMENTS.map((a) => (<button key={a.courseware} type="button" onClick={() => { setSelectedCW(a.courseware); setCwOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">{a.courseware}</button>))}
              </div>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
        <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onClose}>Confirm</Button>
      </div>
    </Modal>);
}

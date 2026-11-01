import { useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Modal } from "@/components/modal-1";
import { CustomSelect } from "../components/CustomSelect";
import { LaneToggle } from "../components/LaneToggle";
export function MassAssignModal({ onClose }) {
    const [baseStation, setBaseStation] = useState("Base Station 1");
    const [weaponType, setWeaponType] = useState("SAR21");
    const [allChecked, setAllChecked] = useState(false);
    const laneOn = [true, true, true, false, true, false, true, true, true, false];
    const [laneChecks, setLaneChecks] = useState(Array(10).fill(false));
    const toggleAll = () => {
        const next = !allChecked;
        setAllChecked(next);
        setLaneChecks(laneChecks.map((_, i) => (i + 1 === 10) ? false : next));
    };
    const toggleLane = (i) => {
        const next = laneChecks.map((v, idx) => idx === i ? !v : v);
        setLaneChecks(next);
        setAllChecked(next.every((v, i) => (i + 1 === 10) || v));
    };
    const onCount = laneOn.filter(Boolean).length;
    return (<Modal open={true} onClose={onClose} width={576} isUseX={false}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={20} className="text-brand-primary"/>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Mass Assign Assets</h3>
          <p className="text-xs text-gray-500 mt-0.5">Select base station and weapon type, then choose lanes to assign them to in one action.</p>
        </div>
      </div>
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base station <span className="text-brand-primary">*</span></label>
          <CustomSelect value={baseStation} onChange={setBaseStation} options={["Base Station 1", "Base Station 2"]} placeholder="Select base station"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weapon Type <span className="text-brand-primary">*</span></label>
          <CustomSelect value={weaponType} onChange={setWeaponType} options={["SAR21", "LMG", "M203", "GPMG", "M110"]} placeholder="Select weapon type"/>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">{baseStation}</span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="font-medium">{onCount}/10 Lanes</span>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-2 bg-red-50 border-b border-gray-100">
            <Checkbox size={16} checked={allChecked} onChange={toggleAll}/>
            <span className="text-xs font-semibold text-brand-primary">Lane</span>
            <span className="text-xs font-semibold text-brand-primary">Status</span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {Array.from({ length: 10 }, (_, i) => {
            const isClosed = i + 1 === 10;
            const isOn = laneOn[i];
            return (<div key={i} className={cn("grid grid-cols-[auto_1fr_auto] gap-3 items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0", isClosed ? "opacity-50" : "hover:bg-gray-50")}>
                  <Checkbox size={16} checked={laneChecks[i]} disabled={isClosed} onChange={() => toggleLane(i)}/>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Lane {i + 1}</span>
                    {isClosed && <span className="text-xs font-medium text-brand-primary">Closed</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LaneToggle on={isOn} onChange={() => { }} disabled={isClosed}/>
                    <span className={cn("text-xs font-medium", isClosed ? "text-gray-400" : isOn ? "text-green-600" : "text-red-500")}>
                      {isClosed ? "Off" : isOn ? "On" : "Off"}
                    </span>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button type="outline" onClick={onClose} className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center">
          Cancel
        </Button>
        <Button onClick={onClose} className="py-3 text-sm font-semibold w-full bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">
          Assign Lane
        </Button>
      </div>
    </Modal>);
}

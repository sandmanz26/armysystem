import { useState } from "react";
import { Modal } from "@/components/modal-1";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

export function ReassignBaseStationModal({
  open, onClose, onConfirm, currentStation, options,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (newStation: string) => void;
  currentStation: string;
  options: string[];
}) {
  const [selected, setSelected] = useState("");
  const [ddOpen, setDdOpen] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    setSelected("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="500px">
      <div className="flex items-center gap-4 mb-8 -mt-2">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={26} className="text-green-500" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Reassign Base Station</h3>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">New Base Station <span className="text-brand-primary">*</span></label>
        <div className="relative">
          <Button
            type="outline"
            onClick={() => setDdOpen(!ddOpen)}
            className={cn("w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-sm",
              ddOpen ? "border-gray-800" : "border-gray-200 hover:border-gray-300")}
          >
            <span className={selected ? "text-gray-800" : "text-gray-400"}>{selected || "Select Base Station"}</span>
            <ChevronDown size={18} className="text-gray-500" />
          </Button>
          {ddOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
              {options.filter((o) => o !== currentStation).map((o) => (
                <button key={o} type="button"
                  onClick={() => { setSelected(o); setDdOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                  {o}
                </button>
              ))}
              {options.filter((o) => o !== currentStation).length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400">No other stations available</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
        <Button
          className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent disabled:opacity-50"
          onClick={handleConfirm}
          disabled={!selected}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

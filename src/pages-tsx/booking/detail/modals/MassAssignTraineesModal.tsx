import { useState } from "react";
import { Modal } from "@/components/modal-1";
import { Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { WEAPON_OPTIONS } from "../constants";

export function MassAssignTraineesModal({
  open, onClose, count, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (weaponType: string) => void;
}) {
  const [weaponType, setWeaponType] = useState("");
  const [ddOpen, setDdOpen] = useState(false);

  const handleConfirm = () => {
    if (!weaponType) return;
    onConfirm(weaponType);
    setWeaponType("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="500px">
      <div className="flex items-center gap-4 mb-8 -mt-2">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Users size={24} className="text-brand-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">Mass Assign</h3>
          <p className="text-sm text-gray-500 mt-0.5">Applies to {count} selected trainee{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Weapon Type <span className="text-brand-primary">*</span></label>
        <div className="relative">
          <Button
            type="outline"
            onClick={() => setDdOpen(!ddOpen)}
            className={cn("w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg text-sm",
              ddOpen ? "border-gray-800" : "border-gray-200 hover:border-gray-300")}
          >
            <span className={weaponType ? "text-gray-800" : "text-gray-400"}>{weaponType || "Select weapon type"}</span>
            <ChevronDown size={18} className="text-gray-500" />
          </Button>
          {ddOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
              {WEAPON_OPTIONS.map((w) => (
                <button key={w} type="button"
                  onClick={() => { setWeaponType(w); setDdOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        <Button type="outline" className="w-full justify-center" onClick={onClose}>Cancel</Button>
        <Button
          className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent disabled:opacity-50"
          onClick={handleConfirm}
          disabled={!weaponType}
        >
          Assign
        </Button>
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronUp, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";

export function ReshootDetailModal({
  detailNumber,
  station,
  coursewareOptions,
  onCancel,
  onConfirm,
}: {
  detailNumber: number;
  station: string;
  coursewareOptions: string[];
  onCancel: () => void;
  onConfirm: (coursewares: string[]) => void;
}) {
  const [practiceOpen, setPracticeOpen] = useState(true);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);

  const allSelected = selectedPractices.length === coursewareOptions.length && coursewareOptions.length > 0;
  const toggleAll = () => setSelectedPractices(allSelected ? [] : [...coursewareOptions]);
  const togglePractice = (c: string) =>
    setSelectedPractices((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const gridItems = [{ label: "Select All", special: true }, ...coursewareOptions.map((c) => ({ label: c, special: false }))];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-brand-primary" />
            </div>
            <div className="flex-1">
              <div className="text-base font-bold text-gray-800">Create New Detail {detailNumber}</div>
              <div className="text-sm text-gray-400 mt-0.5">Please fill all the information.</div>
            </div>
            <Button
              onClick={onCancel}
              className="p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent flex-shrink-0"
            >
              <X size={18} />
            </Button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPracticeOpen(!practiceOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3"
            >
              Practice
              {practiceOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {practiceOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {gridItems.map(({ label, special }) => {
                  const checked = special ? allSelected : selectedPractices.includes(label);
                  return (
                    <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        size={16}
                        checked={checked}
                        onChange={special ? toggleAll : () => togglePractice(label)}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Station <span className="text-brand-primary">*</span>
            </div>
            <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
              {station}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 pb-6">
          <Button
            type="outline"
            onClick={onCancel}
            className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedPractices)}
            disabled={selectedPractices.length === 0}
            className={cn(
              "py-3 text-sm font-semibold w-full justify-center",
              selectedPractices.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand-primary text-white hover:bg-brand-primary-hover"
            )}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

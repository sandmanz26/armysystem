import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function ReassignBaseStationModal({
  isOpen,
  selectedStation,
  stationOptions,
  onSelectStation,
  onClose,
  onConfirm,
}) {
  const options = useMemo(() => stationOptions ?? [], [stationOptions]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setDropdownOpen(false);
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 transition-opacity duration-200 z-[1200]",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-0 right-0 h-full w-[440px] max-w-full bg-white shadow-2xl z-[1201] flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Reassign Base Station</h3>
              <p className="text-xs text-gray-500 mt-0.5">Please fill all the information.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">New Base Station</label>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2.5 text-left text-sm",
                "flex items-center justify-between transition-colors",
                dropdownOpen
                  ? "border-brand-primary ring-2 ring-brand-primary/15"
                  : "border-gray-200 hover:border-gray-300",
                selectedStation ? "text-gray-700" : "text-gray-400",
              )}
            >
              <span>{selectedStation || "Select Base Station"}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onSelectStation(opt);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    {selectedStation === opt && <Check size={14} className="text-brand-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <Button
            onClick={onConfirm}
            disabled={!selectedStation}
            className="w-full justify-center bg-brand-primary py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover"
          >
            Confirm
          </Button>
        </div>
      </aside>
    </>
  );
}

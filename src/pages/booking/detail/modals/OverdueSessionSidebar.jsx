import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

const COURSEWARE_OPTIONS = [
  "Day Test for SAR21/M16 BTP",
  "Night Test for SAR21/M16 BTP",
  "SAR21/M16 ATP(M)",
  "SAR21 Target Exposure Timing ATP(M)",
  "Zeroing 100m",
  "BTP Day Test",
  "BTP Night Test",
];

export function OverdueSessionSidebar({ open, booking, onClose, onConfirm }) {
  const [selectedCourseware, setSelectedCourseware] = useState(booking?.courseware ?? COURSEWARE_OPTIONS[0]);
  const [coursewareOpen, setCoursewareOpen] = useState(false);

  const sessionLabel = booking
    ? `${booking.bookingId?.replace("#", "")} - ${booking.bookingDate ?? booking.date ?? ""}`
    : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1110] w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Overdue Session</h2>
            <p className="text-xs text-gray-500 mt-0.5">Please fill all the information.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Session (read-only display) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Session <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-between w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              <span>{sessionLabel || "—"}</span>
              <ChevronDown size={14} className="text-gray-300" />
            </div>
          </div>

          {/* Courseware */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Courseware <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCoursewareOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              >
                <span className={selectedCourseware ? "text-gray-800" : "text-gray-400"}>
                  {selectedCourseware || "Select courseware"}
                </span>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", coursewareOpen && "rotate-180")} />
              </button>
              {coursewareOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {COURSEWARE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setSelectedCourseware(opt); setCoursewareOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                        selectedCourseware === opt ? "text-brand-primary font-medium bg-red-50/30" : "text-gray-700"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={() => { onConfirm?.({ courseware: selectedCourseware }); onClose(); }}
            className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent"
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  );
}

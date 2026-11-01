import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SelectOption } from "@/components/selectOption";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

const BRIEFING_ROOM_OPTIONS = [
  { value: "Briefing Room 1", label: "Briefing Room 1" },
  { value: "Briefing Room 2", label: "Briefing Room 2" },
  { value: "Briefing Room 3", label: "Briefing Room 3" },
];

export function AssignBriefingRoomSidebar({ open, booking, onClose, onConfirm }) {
  const [selectedRoom, setSelectedRoom] = useState("Briefing Room 1");

  useEffect(() => {
    if (open) {
      setSelectedRoom(booking?.briefingRoom || "Briefing Room 1");
    }
  }, [open, booking]);

  const selectedOption = BRIEFING_ROOM_OPTIONS.find((o) => o.value === selectedRoom) ?? null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Assign Briefing Room</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking ? `#${booking.bookingId?.replace("#", "")} — ${booking.program}` : ""}
            </p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Briefing Room <span className="text-red-500">*</span>
            </label>
            <SelectOption
              name="briefingRoom"
              options={BRIEFING_ROOM_OPTIONS}
              value={selectedOption}
              handleChange={(option) => setSelectedRoom(option?.value || "")}
              isSearchable={false}
              className="w-full text-sm"
              placeholderClassName="text-sm"
              placeholder="Select briefing room"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={() => { onConfirm?.(selectedRoom); onClose(); }}
            className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent"
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  );
}

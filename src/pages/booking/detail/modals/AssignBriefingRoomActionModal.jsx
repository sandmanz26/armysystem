import { useMemo, useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { SelectOption } from "@/components/selectOption";

const BRIEFING_ROOM_OPTIONS = [
  { value: "Briefing Room 1", label: "Briefing Room 1" },
  { value: "Briefing Room 2", label: "Briefing Room 2" },
  { value: "Briefing Room 3", label: "Briefing Room 3" },
];

export function AssignBriefingRoomActionModal({ open, onClose, currentRoom, onConfirm }) {
  const [selectedRoom, setSelectedRoom] = useState(currentRoom || "Briefing Room 1");

  useEffect(() => {
    setSelectedRoom(currentRoom || "Briefing Room 1");
  }, [currentRoom, open]);

  const selectedOption = useMemo(
    () => BRIEFING_ROOM_OPTIONS.find((option) => option.value === selectedRoom),
    [selectedRoom]
  );

  return (
    <Modal open={open} onClose={onClose} width={540} isUseX={false}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={22} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-2sm font-bold text-gray-800">Select Briefing Room</h3>
          <p className="text-sm text-gray-500">Choose the briefing room you want to change</p>
        </div>
      </div>

      <div className="mb-4">
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

      <Button
        type="button"
        onClick={() => onConfirm(selectedRoom)}
        className="w-full justify-center bg-brand-primary text-white hover:bg-brand-primary-hover"
      >
        Change Briefing Room
      </Button>
    </Modal>
  );
}

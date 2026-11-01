import { useState } from "react";
import {
  MoreVertical,
  PlusCircle,
  CheckCircle2,
  CornerDownRight,
  Clock,
  DoorOpen,
  XCircle,
} from "lucide-react";

function getActions(status, assetIssued) {
  switch (status) {
    case "Upcoming":
      return [
        {
          label: "Top Up Assets",
          icon: <PlusCircle size={13} />,
          disabled: !assetIssued,
          disabledReason: "Issue assets first to enable",
        },
        {
          label: "Ready For Return Assets",
          icon: <CheckCircle2 size={13} />,
          disabled: true,
          disabledReason: "Available after training is complete",
        },
        {
          label: "Reschedule",
          icon: <Clock size={13} />,
        },
        {
          label: "Assign Briefing Room",
          icon: <DoorOpen size={13} />,
        },
        {
          label: "Cancel Booking",
          icon: <XCircle size={13} />,
          danger: true,
        },
      ];

    case "Return Assets":
    case "Completed with Missing Assets":
      return [
        {
          label: "Top Up Assets",
          icon: <PlusCircle size={13} />,
          disabled: true,
          disabledReason: "Training already completed",
        },
        {
          label: "Ready For Return Assets",
          icon: <CheckCircle2 size={13} />,
        },
        {
          label: "Return Assets",
          icon: <CornerDownRight size={13} />,
        },
        {
          label: "Reschedule",
          icon: <Clock size={13} />,
          disabled: true,
          disabledReason: "Booking already completed",
        },
        {
          label: "Assign Briefing Room",
          icon: <DoorOpen size={13} />,
          disabled: true,
          disabledReason: "Booking already completed",
        },
        {
          label: "Cancel Booking",
          icon: <XCircle size={13} />,
          disabled: true,
          disabledReason: "Booking already completed",
          danger: true,
        },
      ];

    default:
      return [];
  }
}

export function BookingRowMenu({ status, assetIssued = false, onView, onAssignBriefingRoom }) {
  const [open, setOpen] = useState(false);
  const actions = getActions(status, assetIssued);

  if (actions.length === 0) return null;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="More actions"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            {actions.map((action) => (
              <button
                key={action.label}
                disabled={action.disabled}
                onClick={() => {
                  if (!action.disabled) {
                    setOpen(false);
                    if (action.label === "Assign Briefing Room") onAssignBriefingRoom?.();
                  }
                }}
                title={action.disabled ? action.disabledReason : undefined}
                className={[
                  "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors",
                  action.disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : action.danger
                    ? "text-red-500 hover:bg-red-50 cursor-pointer"
                    : "text-gray-700 hover:bg-gray-50 cursor-pointer",
                ].join(" ")}
              >
                <span className={action.disabled ? "opacity-40" : action.danger ? "text-red-400" : "text-gray-400"}>
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

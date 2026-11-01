// Booking 2.0 Onboarding — "Confirm Attendance" summary popup, per the
// reference screenshot. Breaks the roll down into the PRD Sec. 8.3 Status
// Matrix's 3 real states (Non-Registered+Absent never occurs).
import { Users, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingTrainee } from "../types";

interface ConfirmAttendanceSummaryModalProps {
  roll: OnboardingTrainee[];
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmAttendanceSummaryModal({ roll, onCancel, onConfirm }: ConfirmAttendanceSummaryModalProps) {
  const total = roll.length;
  const registeredPresent = roll.filter((t) => t.registration === "Registered" && t.attendance === "Present").length;
  const registeredAbsent = roll.filter((t) => t.registration === "Registered" && t.attendance === "Absent").length;
  const nonRegisteredPresent = roll.filter((t) => t.registration === "Non-Registered" && t.attendance === "Present").length;
  const anyPresent = registeredPresent + nonRegisteredPresent > 0;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl w-[540px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Confirm Attendance</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-lg">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Trainees</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-2"><UserCheck size={14} className="text-green-600" /></div>
              <p className="text-xs text-gray-400 leading-snug">Registered &amp; Present Trainees</p>
              <p className="text-lg font-bold text-gray-900">{registeredPresent}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mb-2"><UserX size={14} className="text-red-500" /></div>
              <p className="text-xs text-gray-400 leading-snug">Registered &amp; Absent Trainees</p>
              <p className="text-lg font-bold text-gray-900">{registeredAbsent}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2"><UserCheck size={14} className="text-blue-500" /></div>
              <p className="text-xs text-gray-400 leading-snug">Non-Registered &amp; Present Trainees</p>
              <p className="text-lg font-bold text-gray-900">{nonRegisteredPresent}</p>
            </div>
          </div>
          {/* F-009 (O-6): the old "At least 1 trainee must be present…" line is not in Figma
              (5348:95775) and was removed; the zero-present gate itself is kept — Confirm stays
              disabled until someone is Present. */}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
            Cancel
          </button>
          <button
            type="button"
            disabled={!anyPresent}
            onClick={onConfirm}
            className={cn("px-4 py-2 text-sm font-semibold rounded-lg", anyPresent ? "bg-figma-primary text-white hover:bg-figma-primaryhover" : "bg-gray-300 text-white cursor-not-allowed")}
          >
            Confirm Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

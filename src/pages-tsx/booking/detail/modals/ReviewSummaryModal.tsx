import { X, Check } from "lucide-react";
import { Button } from "@/components/button";
import { DETAIL_GROUPS } from "../constants";
import { useBookingStore } from "../store/useBookingStore";

export function ReviewSummaryModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const booking = useBookingStore((s) => s.booking);
  const totalDetails = DETAIL_GROUPS.reduce((s, g) => s + g.details.length, 0);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 md:p-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f4f4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">Review Your Booking Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">Please verify the information below before confirming your booking.</p>
          </div>
          <Button onClick={onCancel} className="p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent flex-shrink-0 mt-0.5">
            <X size={18} />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Total Trainee</span>
            <span className="text-sm font-bold text-gray-800">{booking?.traineesCount} Trainees</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {[
                ["Training Section Type", booking?.sectionType],
                ["Training Type", booking?.trainingType],
                ["Training Mode", booking?.trainingMode],
                ["Weapon Type(s)", "SAR21"],
                ["Training Programme", booking?.courseware],
                ["Role(s)", "M110 Team (SNIPERS), SPIKE SR (MPAT)"],
                ["Instructor", "Allen Ritchson"],
                ["Unit Contact Details", "+1 232 232 2323\contact@example.com"],
                ["Training Schedule", "AM Session"],
                ["Training Date", "31 January 2025"],
                ["Training Time", "08:00 AM – 12:00 PM"],
                ["Briefing Room", "Briefing Room A"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                  <span className="text-xs text-gray-500 flex-shrink-0 w-36">{label}</span>
                  <span className="text-xs font-semibold text-gray-800 text-right whitespace-pre-line">{value}</span>
                </div>
              ))}
            </div>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {[
                ["Base Station(s)", "PWC-WPT-01, PWC-WPT-02"],
                ["Detail(s)", String(totalDetails)],
                ["Courseware(s)", "ATP (M)"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-100 mt-1">
                <div className="text-xs font-bold text-gray-700 mb-2">Lane Configuration</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">ATP (M)</span>
                  <span className="text-xs font-bold text-green-600">Assigned</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Ensure you arrive 15 minutes before the scheduled time. You must bring your identity card and any required equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 md:px-6 pb-4 md:pb-6">
          <Button
            type="outline"
            onClick={onCancel}
            className="py-3 text-sm font-semibold text-gray-600 w-full border border-gray-200 justify-center"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="py-3 text-sm font-semibold w-full bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SessionReadyModal({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative">
        <Button onClick={onStart} className="absolute top-4 right-4 p-1 w-auto bg-transparent text-gray-400 hover:text-gray-600 hover:bg-transparent">
          <X size={18} />
        </Button>
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center">
            <Check size={24} className="text-green-500" strokeWidth={2.5} />
          </div>
        </div>
        <p className="text-base font-bold text-gray-800 mb-6 leading-snug">
          All lanes are operational and the session is about to begin!
        </p>
        <Button
          onClick={onStart}
          className="w-full py-3 text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
        >
          Start session
        </Button>
      </div>
    </div>
  );
}

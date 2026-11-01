import { useState } from "react";
import { Modal } from "@/components/modal-1";
import { Check, Users } from "lucide-react";
import { Button } from "@/components/button";

export interface TraineeLaneAssignment {
  name: string;
  svcId: string;
  station: string;
  lane: number;
}

export function NominalRollAssignmentModal({
  open,
  assignments,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  assignments: TraineeLaneAssignment[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [index, setIndex] = useState(0);
  const current = assignments[index];
  const isLast = index === assignments.length - 1;

  const handleClose = () => {
    if (isLast) onConfirm();
    else setIndex((i) => i + 1);
  };

  if (!current) return null;

  return (
    <Modal open={open} onClose={onCancel} width="450px">
      <div className="flex items-center gap-4 mb-5 -mt-2">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Users size={22} className="text-brand-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Confirm Station &amp; Lane Assignment</h3>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Name</span>
          <span className="text-sm font-semibold text-gray-800">{current.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Service ID</span>
          <span className="text-sm font-medium text-gray-700">{current.svcId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Base Station</span>
          <span className="text-sm font-medium text-gray-700">{current.station}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Lane</span>
          <span className="text-sm font-medium text-gray-700">Lane {current.lane}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Confirm this trainee will train at <span className="font-medium text-gray-800">{current.station}, Lane {current.lane}</span>.
      </p>

      <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={handleClose}>
        Close
      </Button>
    </Modal>
  );
}

export function AttendanceConfirmationModal({
  open,
  attendeesCount,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  attendeesCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} width="450px">
      <div className="flex items-center gap-4 mb-6 -mt-2">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={24} className="text-green-600" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Confirm Attendance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Verify the scanned attendees</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">Total Attendees Scanned</div>
        <div className="text-3xl font-bold text-brand-primary">{attendeesCount}</div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        All {attendeesCount} trainees have been successfully scanned. Click confirm to proceed to the nominal roll list.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button type="outline" className="w-full justify-center" onClick={onCancel}>Cancel</Button>
        <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

export function FinalConfirmationModal({
  open,
  traineesCount,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  traineesCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} width="450px">
      <div className="flex items-center gap-4 mb-6 -mt-2">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Check size={24} className="text-brand-primary" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Confirm Nominal Roll</h3>
          <p className="text-sm text-gray-500 mt-0.5">Proceed to lane configuration</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">Nominal Roll Summary</div>
        <div className="text-3xl font-bold text-brand-primary">{traineesCount}</div>
        <div className="text-xs text-gray-500 mt-1">Trainees confirmed</div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        The nominal roll list has been confirmed with {traineesCount} trainees. Ready to proceed to lane configuration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button type="outline" className="w-full justify-center" onClick={onCancel}>Back</Button>
        <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onConfirm}>Proceed</Button>
      </div>
    </Modal>
  );
}

export function Case2AttendanceSummaryModal({
  open,
  trainees,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  trainees: any[];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const registeredPresent = trainees.filter(t => t.attendanceStatus === "Registered (Present)").length;
  const nonRegisteredPresent = trainees.filter(t => t.attendanceStatus === "Non-registered (Present)").length;
  const registeredAbsent = trainees.filter(t => t.attendanceStatus === "Registered (Absent)").length;

  return (
    <Modal open={open} onClose={onCancel} width="550px">
      <div className="flex items-start gap-4 pb-5 -mt-2">
        <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f4f4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-800">Confirm Attendance Submission</h3>
          <p className="text-sm text-gray-500 mt-0.5">Please check the information before begin the session.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-0.5">Total Trainee(s)</div>
            <div className="text-3xl font-bold text-gray-800 leading-none">{trainees.length}</div>
            <div className="text-xs text-gray-400 mt-1">Trainee(s)</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={18} className="text-green-600" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-0.5">Registered (Present)</div>
            <div className="text-3xl font-bold text-gray-800 leading-none">{registeredPresent}</div>
            <div className="text-xs text-gray-400 mt-1">Trainee(s)</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/>
              <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
              <path d="M8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              <line x1="20" y1="13" x2="14" y2="19"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-0.5">Registered (Absent)</div>
            <div className="text-3xl font-bold text-gray-800 leading-none">{registeredAbsent}</div>
            <div className="text-xs text-gray-400 mt-1">Trainee(s)</div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/>
              <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
              <path d="M8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-0.5">Non Registered (Present)</div>
            <div className="text-3xl font-bold text-gray-800 leading-none">{nonRegisteredPresent}</div>
            <div className="text-xs text-gray-400 mt-1">Trainee(s)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="outline" className="w-full justify-center" onClick={onCancel}>Cancel</Button>
        <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

export function Case2UnregisteredAlert({
  open,
  onCancel,
  onUpdate,
}: {
  open: boolean;
  onCancel: () => void;
  onUpdate: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} width="400px">
      <div className="text-center pb-2">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#bbf7d0" strokeWidth="3" strokeDasharray="6 4" />
            </svg>
            <div className="absolute inset-2 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={22} className="text-green-500" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">New unregistered trainees detected!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Would you like to add them to the final nominal roll list for the training?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button type="outline" className="w-full justify-center" onClick={onCancel}>Cancel</Button>
          <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onUpdate}>Update</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Case2SuccessAlert({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width="400px">
      <div className="text-center pb-2">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <div className="w-12 h-12 rounded-full border-2 border-green-400 flex items-center justify-center">
            <Check size={24} className="text-green-500" strokeWidth={2.5} />
          </div>
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">Attendance Confirmed!</h3>
        <p className="text-sm text-gray-500 mb-6">
          The attendance submission has been successfully recorded. All discrepancies have been noted.
        </p>
        <Button className="w-full justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import type { SessionType, BookingDetailsSnapshot, ScheduleSnapshot } from "../types";

function LeftRow({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right ml-3">{value || "—"}</span>
    </div>
  );
}

function RightRow({ label, value, isStatus }: { label: string; value: string | ReactNode; isStatus?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn("text-xs font-semibold text-right ml-3", isStatus ? "text-green-600" : "text-gray-800")}>{value || "—"}</span>
    </div>
  );
}

export function ReviewModal({
  sessionType, trainingMode, detailsSnapshot, scheduleSnapshot, totalTrainees, onCancel, onConfirm,
}: {
  sessionType: SessionType;
  trainingMode: string;
  detailsSnapshot: BookingDetailsSnapshot;
  scheduleSnapshot: ScheduleSnapshot;
  totalTrainees: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isIntegrated = sessionType === "Integrated";

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const scheduleLabel = scheduleSnapshot.section
    || (scheduleSnapshot.scheduleType === "Ad-hoc" ? "Ad-hoc" : "—");

  const dateLabel = scheduleSnapshot.scheduleType === "Ad-hoc"
    ? (scheduleSnapshot.dateRangeStart && scheduleSnapshot.dateRangeEnd
        ? `${formatDate(scheduleSnapshot.dateRangeStart)} to ${formatDate(scheduleSnapshot.dateRangeEnd)}`
        : "—")
    : (scheduleSnapshot.selectedDate ? formatDate(scheduleSnapshot.selectedDate) : "—");

  const baseQtyNum = parseInt(detailsSnapshot.baseQty) || 0;
  const cShapedQtyNum = parseInt(detailsSnapshot.cShapedQty) || 0;

  const coursewareList = detailsSnapshot.courseware
    ? detailsSnapshot.courseware.split(", ").map((c) => c.trim()).filter(Boolean)
    : [];
  const isMultiCourseware = coursewareList.length > 1;

  const stationLabels = (base: number, cshaped: number) => {
    const flat = Array.from({ length: base }, (_, i) => `Flat Screen ${String(i + 1).padStart(2, "0")}`);
    const cshapedLabels = Array.from({ length: cshaped }, (_, i) => `C-Shaped WPT ${4 + i}`);
    return { flat, cshapedLabels };
  };

  const stationSummary = (base: number, cshaped: number) => {
    const parts: string[] = [];
    if (base > 0) parts.push(`${base} Flat Screen`);
    if (cshaped > 0) parts.push(`${cshaped} C-Shaped`);
    return parts.length > 0 ? parts.join(" + ") : "—";
  };

  const { flat: baseStationNames, cshapedLabels: cShapedStationNames } = stationLabels(baseQtyNum, cShapedQtyNum);
  const baseStationsLabel = [...baseStationNames, ...cShapedStationNames].join(", ") || "—";

  return (
    <Modal open={true} onClose={onCancel} width={672} isUseX={false}>
      <div className="overflow-y-auto max-h-[60vh] -mx-6 px-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">Review Your Booking</h2>
          <p className="text-xs text-gray-400 mt-0.5">Verify the information before confirming</p>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-600">Total Trainees</span>
          <span className="text-sm font-bold text-gray-800">{totalTrainees}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <LeftRow label="Unit Name" value={detailsSnapshot.unitName || "—"} />
            <LeftRow label="FTMS ID" value={detailsSnapshot.ftmsId || "—"} />
            <LeftRow label="Section Type" value={sessionType} />
            <LeftRow label="Training Type" value={detailsSnapshot.trainingType || "Group"} />
            <LeftRow label="Mode" value={trainingMode || "—"} />
            <LeftRow label="Weapon(s)" value={detailsSnapshot.weaponSummary || "—"} />
            {isIntegrated && detailsSnapshot.roles.length > 0 && (
              <LeftRow label="Role(s)" value={detailsSnapshot.roles.join(", ")} />
            )}
            {detailsSnapshot.instructor && (
              <LeftRow label="Instructor" value={detailsSnapshot.instructor} />
            )}
            {detailsSnapshot.unitContact && (
              <LeftRow label="Contact" value={detailsSnapshot.unitContact} />
            )}
            <LeftRow label="Schedule" value={scheduleLabel} />
            <LeftRow label="Date" value={dateLabel} />
            {scheduleSnapshot.startTime && scheduleSnapshot.endTime && (
              <LeftRow label="Time" value={`${scheduleSnapshot.startTime} - ${scheduleSnapshot.endTime}`} />
            )}
            <LeftRow label="Briefing Session" value={scheduleSnapshot.briefing ? "Yes" : "No"} />
          </div>
          <div>
            <RightRow
              label={isMultiCourseware ? "Courseware(s)" : "Courseware"}
              value={isMultiCourseware ? `${coursewareList[0]} +${coursewareList.length - 1}` : (detailsSnapshot.courseware || "—")}
            />
            {isMultiCourseware ? (
              coursewareList.map((cw) => {
                const counts = detailsSnapshot.stationCountsByCourseware?.[cw];
                return (
                  <RightRow
                    key={cw}
                    label={cw}
                    value={counts ? stationSummary(counts.base, counts.cshaped) : "—"}
                  />
                );
              })
            ) : (
              <>
                <RightRow label="Base Station(s)" value={stationSummary(baseQtyNum, cShapedQtyNum)} />
                <RightRow label="Station Name(s)" value={baseStationsLabel} />
              </>
            )}
            <RightRow label="Lane Config" value={<span className="text-green-600 font-medium">Assigned</span>} isStatus={true} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          Arrive 15 min early. Bring ID & required equipment.
        </p>
      </div>
      <div className="-mx-6 -mb-6 px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3 mt-4">
        <Button
          type="outline"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 border border-gray-300 justify-center"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

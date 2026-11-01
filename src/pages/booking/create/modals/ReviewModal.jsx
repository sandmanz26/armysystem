import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
function LeftRow({ label, value }) {
    return (<div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right ml-3">{value || "—"}</span>
    </div>);
}
function RightRow({ label, value, isStatus }) {
    return (<div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn("text-xs font-semibold text-right ml-3", isStatus ? "text-green-600" : "text-gray-800")}>{value || "—"}</span>
    </div>);
}
export function ReviewModal({ sessionType, trainingMode, detailsSnapshot, scheduleSnapshot, totalTrainees, onCancel, onConfirm, }) {
    const isIntegrated = sessionType === "Integrated";
    const formatDate = (d) => d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";
    const scheduleLabel = scheduleSnapshot.section
        || (scheduleSnapshot.scheduleType === "Ad-hoc" ? "Ad-hoc" : "—");
    const dateLabel = scheduleSnapshot.scheduleType === "Ad-hoc"
        ? (scheduleSnapshot.dateRangeStart && scheduleSnapshot.dateRangeEnd
            ? `${formatDate(scheduleSnapshot.dateRangeStart)} to ${formatDate(scheduleSnapshot.dateRangeEnd)}`
            : "—")
        : (scheduleSnapshot.selectedDate ? formatDate(scheduleSnapshot.selectedDate) : "—");
    const baseQty = parseInt(detailsSnapshot.baseQty) || 0;
    return (<Modal open={true} onClose={onCancel} width={672} isUseX={false}>
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
            <LeftRow label="Section Type" value={sessionType}/>
            <LeftRow label="Training Type" value={detailsSnapshot.trainingType || "Group"}/>
            <LeftRow label="Mode" value={trainingMode || "—"}/>
            <LeftRow label="Weapon(s)" value={detailsSnapshot.weaponSummary || "—"}/>
            <LeftRow label="Courseware" value={detailsSnapshot.courseware || "—"}/>
            {isIntegrated && detailsSnapshot.roles.length > 0 && (<LeftRow label="Role(s)" value={detailsSnapshot.roles.join(", ")}/>)}
            {isIntegrated && (<>
                <LeftRow label="Instructor" value="Allen Ritchson"/>
                <LeftRow label="Contact" value={<div className="text-right"><div className="text-[10px]">+1 232 232 2323</div><div className="text-[10px]">contact@example.com</div></div>}/>
              </>)}
            <LeftRow label="Schedule" value={scheduleLabel}/>
            <LeftRow label="Date" value={dateLabel}/>
            {scheduleSnapshot.startTime && scheduleSnapshot.endTime && (<LeftRow label="Time" value={`${scheduleSnapshot.startTime} - ${scheduleSnapshot.endTime}`}/>)}
          </div>
          <div>
            <RightRow label="Base Station(s)" value="PWC-WPT-01, PWC-WPT-02"/>
            <RightRow label="Stations" value={baseQty}/>
            <RightRow label="Courseware" value={detailsSnapshot.courseware || "ATP (M)"}/>
            <RightRow label="Lane Config" value={<span className="text-green-600 font-medium">Assigned</span>} isStatus={true}/>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          Arrive 15 min early. Bring ID & required equipment.
        </p>
      </div>
      <div className="-mx-6 -mb-6 px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3 mt-4">
        <Button type="outline" onClick={onCancel} className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 border border-gray-300 justify-center">
          Cancel
        </Button>
        <Button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">
          Confirm
        </Button>
      </div>
    </Modal>);
}

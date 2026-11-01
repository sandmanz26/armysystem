import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { bookings } from "@/data/mock";
import { operators, armskokePersonnelOperators, assignmentTypes, baseStations, baseStationBookings, } from "@/data/systemHardware";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { SectionCard } from "./components/SectionCard";
import { FieldDropdown } from "./components/FieldDropdown";
import { RightPanel } from "./components/RightPanel";
import { CoursewareModal } from "./modals/CoursewareModal";
import { INITIAL_FORM_VALUES } from "./constants";
const assignmentSchema = Yup.object().shape({
    operator: Yup.string().required("Operator is required"),
    personnelOperator: Yup.string().required("Armskote Personnel is required"),
    assignmentType: Yup.string().required("Assignment Type is required"),
    baseStation: Yup.string().required("Base Station is required"),
    bookingIds: Yup.array().of(Yup.string()),
});
function extractTimeStr(bookingTime) {
    if (!bookingTime)
        return "";
    const m = bookingTime.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*(\(.*?\))/i);
    if (m)
        return `${m[1].trim()}-${m[2].trim()} ${m[3]}`;
    const parts = bookingTime.split("\n");
    return (parts[parts.length - 1] || "").trim();
}
function InnerForm({ onNavigate, onCreateAssignment }) {
    const { values, setFieldValue } = useFormikContext();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showCoursewareModal, setShowCoursewareModal] = useState(false);
    const [preSelectedBooking, setPreSelectedBooking] = useState(null);
    const [coursewareConfirmed, setCoursewareConfirmed] = useState(false);
    const [assignmentSource, setAssignmentSource] = useState({ type: "create" });
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        let bookingId = searchParams.get("bookingId");
        let fromBooking = searchParams.get("fromBooking");
        if (!bookingId) {
            const hash = window.location.hash;
            const bookingIdMatch = hash.match(/bookingId=([^&]+)/);
            if (bookingIdMatch)
                bookingId = bookingIdMatch[1];
            const fromBookingMatch = hash.match(/fromBooking=([^&]+)/);
            if (fromBookingMatch)
                fromBooking = fromBookingMatch[1];
        }
        if (bookingId) {
            const booking = bookings.find((b) => b.id === bookingId);
            if (booking) {
                if (fromBooking && fromBooking === "true") {
                    setAssignmentSource({ type: "booking", bookingData: booking });
                    const assignmentTypeFromSection = booking.sectionType === "Standalone" ? "Single Booking" : "Single Booking";
                    const baseStationFromBooking = booking.assignedStations?.[0] || "TRX-01";
                    setFieldValue("assignmentType", assignmentTypeFromSection);
                    setFieldValue("baseStation", baseStationFromBooking);
                    setFieldValue("bookingIds", [booking.id]);
                    setPreSelectedBooking(booking);
                    setShowCoursewareModal(true);
                }
                else {
                    setPreSelectedBooking(booking);
                    setShowCoursewareModal(true);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const isLocked = coursewareConfirmed || assignmentSource.type === "booking";
    const availableBookings = coursewareConfirmed
        ? [preSelectedBooking?.id].filter(Boolean)
        : values.baseStation
            ? baseStationBookings[values.baseStation] || []
            : [];
    const isFormValid = assignmentSource.type === "booking"
        ? !!(values.operator && values.personnelOperator)
        : !!(values.operator && values.personnelOperator && values.assignmentType && values.baseStation);
    const handleCoursewareConfirm = () => {
        if (preSelectedBooking) {
            setFieldValue("bookingIds", [preSelectedBooking.id]);
            setCoursewareConfirmed(true);
            setShowCoursewareModal(false);
        }
    };
    const handleDropdownToggle = (dropdown) => {
        if (isLocked && (dropdown === "assignmentType" || dropdown === "baseStation"))
            return;
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };
    const handleDropdownSelect = (field, value) => {
        if (field === "baseStation") {
            setFieldValue(field, value);
            setFieldValue("bookingIds", []);
        }
        else {
            setFieldValue(field, value);
        }
        setOpenDropdown(null);
    };
    const toggleBooking = (bookingId) => {
        const current = values.bookingIds;
        const next = current.includes(bookingId)
            ? current.filter((id) => id !== bookingId)
            : [...current, bookingId];
        setFieldValue("bookingIds", next);
    };
    return (<>
      {showCoursewareModal && (<CoursewareModal preSelectedBooking={preSelectedBooking} onConfirm={handleCoursewareConfirm} onClose={() => {
                setShowCoursewareModal(false);
                setPreSelectedBooking(null);
            }}/>)}

      <Form className="flex-1 overflow-auto bg-gray-50" onClick={() => setOpenDropdown(null)}>
        {/* Top nav bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <button type="button" onClick={() => onNavigate?.("/system-hardware/assignment-list")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-medium transition-colors">
              <ArrowLeft size={14}/>
              Assignments
            </button>
            <span className="text-gray-300 select-none">›</span>
            <span className="text-gray-900 font-semibold">New Assignment</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button type="button" onClick={() => onNavigate?.("/system-hardware/assignment-list")} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white w-auto">
              Cancel
            </Button>
            <Button type="button" disabled={!isFormValid} onClick={() => {
            if (isFormValid) {
                onCreateAssignment?.({ baseStation: values.baseStation, bookingIds: values.bookingIds });
            }
        }} className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors w-auto", isFormValid
            ? "bg-red-800 text-white hover:bg-red-900 shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
              Create Assignment <ArrowRight size={14}/>
            </Button>
          </div>
        </div>

        {/* Page body */}
        <div className="p-6" onClick={(e) => e.stopPropagation()}>
          <div className={cn("flex gap-6 items-start", assignmentSource.type !== "booking" && "max-w-2xl mx-auto")}>
            {/* Left: form */}
            <div className="w-1/2 min-w-0 space-y-3">
              {/* Title */}
              <div>
                <h1 className="text-xl font-semibold text-brand-primary">New Assignment</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Complete all required fields to create and issue an assignment.
                </p>
              </div>

              {/* 1. Personnel */}
              <SectionCard title="Personnel">
                <div className="grid grid-cols-2 gap-3">
                  <FieldDropdown id="operator" label="Operator" value={values.operator} placeholder="Select operator" options={operators} openDropdown={openDropdown} onToggle={handleDropdownToggle} onSelect={handleDropdownSelect}/>
                  <FieldDropdown id="personnelOperator" label="Armskote Personnel" value={values.personnelOperator} placeholder="Select personnel" options={armskokePersonnelOperators} openDropdown={openDropdown} onToggle={handleDropdownToggle} onSelect={handleDropdownSelect}/>
                </div>
              </SectionCard>

              {/* 2. Assignment Configuration */}
              <SectionCard title="Assignment Configuration">
                <div className="grid grid-cols-2 gap-3">
                  <FieldDropdown id="assignmentType" label="Assignment Type" value={values.assignmentType} placeholder="Select type" options={assignmentTypes} locked={isLocked} openDropdown={openDropdown} onToggle={handleDropdownToggle} onSelect={handleDropdownSelect}/>
                  <FieldDropdown id="baseStation" label="Base Station" value={values.baseStation} placeholder="Select station" options={baseStations} locked={isLocked} openDropdown={openDropdown} onToggle={handleDropdownToggle} onSelect={handleDropdownSelect}/>
                </div>
              </SectionCard>

              {/* 3. Booking */}
              <SectionCard title="Booking">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      Booking ID(s)
                      {assignmentSource.type !== "booking" && (<span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded normal-case tracking-normal">
                          Optional
                        </span>)}
                      {assignmentSource.type === "booking" && (<span className="text-red-500 normal-case">*</span>)}
                    </label>
                    {values.bookingIds.length > 0 && !isLocked && (<span className="text-xs text-gray-400">
                        {values.bookingIds.length} selected
                      </span>)}
                  </div>

                  {/* From booking — show locked booking card */}
                  {assignmentSource.type === "booking" && assignmentSource.bookingData ? (<div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-800 text-white">
                      <div className="w-2 h-2 rounded-full bg-white/70 mt-1.5 flex-shrink-0"/>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-snug">
                          {assignmentSource.bookingData.program}
                        </p>
                        <p className="text-xs text-red-200 mt-0.5">
                          {assignmentSource.bookingData.bookingId}
                        </p>
                        <p className="text-xs text-red-200 mt-0.5">
                          {assignmentSource.bookingData.bookingDate} &middot;{" "}
                          {extractTimeStr(assignmentSource.bookingData.bookingTime)}
                        </p>
                      </div>
                    </div>) : availableBookings.length === 0 ? (<div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {values.baseStation
                ? "No bookings for this station"
                : "No base station selected"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {values.baseStation
                ? "No upcoming bookings found. You may proceed without selecting a booking."
                : "Select a base station above to see available bookings, or proceed without one."}
                      </p>
                    </div>) : (<div className="space-y-2 max-h-56 overflow-y-auto">
                      {availableBookings.map((bookingId) => {
                const booking = bookings.find((b) => b.id === bookingId);
                const isChecked = values.bookingIds.includes(bookingId);
                return (<label key={bookingId} className={cn("flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors", isChecked
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300")}>
                            <Checkbox checked={isChecked} onChange={() => toggleBooking(bookingId)} disabled={coursewareConfirmed} size={16}/>
                            <div className="min-w-0">
                              <p className={cn("text-sm font-medium leading-snug", isChecked ? "text-red-900" : "text-gray-800")}>
                                {booking?.program || bookingId}
                              </p>
                              {booking && (<p className="text-xs text-gray-400 mt-0.5">
                                  {booking.bookingId} &middot; {booking.bookingDate}
                                </p>)}
                            </div>
                          </label>);
            })}
                    </div>)}
                </div>
              </SectionCard>
            </div>

            {/* Right: booking summary panel */}
            {assignmentSource.type === "booking" && (<RightPanel bookingData={assignmentSource.bookingData} extractTimeStr={extractTimeStr}/>)}
          </div>
        </div>
      </Form>
    </>);
}
// ── RFID Scan Page ────────────────────────────────────────────────────────────
// ── Mock scanned assets (simulate RFID scan result) ───────────────────────────
const MOCK_SCANNED_ASSETS = [
    { id: "1", assetName: "LMG (S)", assetTagId: "250101-LMG005", assetType: "LMG", assetCategory: "Weapon", status: "Available", targetBaseStation: "TRX-01" },
    { id: "2", assetName: "SAR21 (S)", assetTagId: "250101-SAR007", assetType: "SAR21", assetCategory: "Weapon", status: "Available", targetBaseStation: "TRX-01" },
];

function RFIDScanPage({ baseStation, bookingIds, onBack, onNext }) {
    const stationLabel = baseStation ?? "TRX-01";
    // Lookup booking data for display
    const booking = bookingIds?.length
        ? bookings.find(b => b.id === bookingIds[0])
        : bookings.find(b => b.status === "Upcoming");

    return (
      <div className="flex h-screen flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-gray-800">
              Issued Assets - <span className="text-green-600">(Connected)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Scan Assets for Training ({stationLabel}) · Total Scans (0 Assets)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={onBack} className="px-6 py-2 text-sm border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 bg-white w-auto">Back</Button>
            <Button type="button" onClick={onNext} className="flex items-center gap-1.5 px-6 py-2 text-sm bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-hover shadow-sm w-auto whitespace-nowrap">
              Next <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        {/* Body: 2-col layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: RFID illustration */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 bg-gray-50/50 border-r border-gray-100">
            <div className="w-36 h-36 rounded-full border-2 border-brand-primary flex items-center justify-center">
              <div className="text-center text-brand-primary">
                <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M32 18 Q44 18 52 26" strokeLinecap="round" /><path d="M32 18 Q20 18 12 26" strokeLinecap="round" />
                  <path d="M32 14 Q48 14 56 22" strokeLinecap="round" /><path d="M32 14 Q16 14 8 22" strokeLinecap="round" />
                  <rect x="14" y="28" width="22" height="18" rx="2" /><rect x="27" y="33" width="17" height="11" rx="1.5" />
                  <circle cx="35.5" cy="38.5" r="2" fill="currentColor" />
                </svg>
                <div className="text-xs font-bold mt-1">RFID</div>
              </div>
            </div>
            <div className="text-center max-w-xs">
              <h2 className="text-base font-semibold text-gray-700 mb-2">Place your asset on the RFID reader.</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Please make sure to place one asset on the RFID Reader at a time, wait for it to be scanned, and then place the next one.
              </p>
            </div>
          </div>

          {/* Right: Booking information panel */}
          <div className="w-[360px] flex-shrink-0 overflow-y-auto p-5 bg-white">
            <p className="text-sm font-bold text-gray-800 mb-4">Booking Information</p>

            {booking ? (
              <div className="space-y-4">
                {/* Booking card */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-brand-primary/5 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 leading-snug">{booking.program}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{booking.bookingId}</p>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Date</span>
                      <span className="text-xs font-semibold text-gray-700">{booking.bookingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Training Type</span>
                      <span className="text-xs font-semibold text-gray-700">{booking.trainingType || "Group"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Training Mode</span>
                      <span className="text-xs font-semibold text-gray-700">{booking.trainingMode || "Marksmanship"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Trainee(s)</span>
                      <span className="text-xs font-semibold text-gray-700">{booking.traineesCount ?? 0} Trainee(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                        booking.status === "Upcoming" ? "bg-blue-50 text-blue-700" :
                        booking.status === "Ongoing" ? "bg-green-50 text-green-700" :
                        "bg-gray-50 text-gray-600"
                      )}>{booking.status}</span>
                    </div>
                  </div>
                </div>

                {/* Base station */}
                <div className="rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1.5">Base Station</p>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold">{stationLabel}</span>
                  </div>
                </div>

                {/* Weapon info if available */}
                {booking.weapon && (
                  <div className="rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1.5">Weapon Type(s)</p>
                    <p className="text-sm font-semibold text-gray-700">{booking.weapon}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">No booking information</div>
            )}
          </div>
        </div>
      </div>
    );
}

// ── Scanned Assets List Page ──────────────────────────────────────────────────
function ScannedAssetsPage({ baseStation, bookingIds, onBack, onConfirm }) {
    const [assets, setAssets] = useState(MOCK_SCANNED_ASSETS);
    const stationLabel = baseStation ?? "TRX-01";

    // Lookup booking
    const booking = bookingIds?.length
        ? bookings.find(b => b.id === bookingIds[0])
        : bookings.find(b => b.status === "Upcoming");

    return (
      <div className="flex h-screen flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-gray-800">
              Issued Assets - <span className="text-green-600">(Connected)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Scan Assets for Training ({stationLabel}) · Total Scans ({assets.length} Assets)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={onBack} className="px-6 py-2 text-sm border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 bg-white w-auto">Back</Button>
            <Button type="button" onClick={onConfirm} className="px-6 py-2 text-sm bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-hover shadow-sm w-auto whitespace-nowrap">
              Confirm
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          {/* Booking info strip */}
          {booking && (
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 mb-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="font-semibold text-gray-800">{booking.bookingId}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-xs text-gray-600 font-medium truncate max-w-[240px]">{booking.program}</span>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-xs text-gray-500">{booking.bookingDate}</span>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-xs text-gray-500">
                {booking.traineesCount ?? 0} Trainee(s) · {booking.weapon || "—"}
              </span>
              <div className="ml-auto">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {booking.status}
                </span>
              </div>
            </div>
          )}

          {/* Total scanned */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5 text-center">
            <p className="text-xs text-gray-400 mb-1">Total Scanned Assets</p>
            <p className="text-5xl font-extrabold text-brand-primary">{assets.length}</p>
          </div>

          {/* Asset list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">
                List of Assets
                <span className="ml-1.5 text-xs font-normal text-gray-400">({assets.length} Asset{assets.length !== 1 ? "s" : ""})</span>
              </p>
              {assets.length > 0 && (
                <button onClick={() => setAssets([])} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Delete
                </button>
              )}
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-50/70">
                  {["No", "Asset Name", "Asset Tag ID", "Asset Type", "Asset Category", "Status", "Target Base Station", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-brand-primary whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">No assets scanned</td></tr>
                ) : assets.map((asset, idx) => (
                  <tr key={asset.id} className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{asset.assetName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{asset.assetTagId}</td>
                    <td className="px-5 py-3 text-gray-700">{asset.assetType}</td>
                    <td className="px-5 py-3 text-gray-700">{asset.assetCategory}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">{asset.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{asset.targetBaseStation}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Remove">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}

export function CreateAssignment({ onNavigate }) {
    const [step, setStep] = useState("form"); // "form" | "rfid" | "scanned"
    const [assignmentMeta, setAssignmentMeta] = useState(null);

    if (step === "rfid") {
        return (
          <RFIDScanPage
            baseStation={assignmentMeta?.baseStation}
            bookingIds={assignmentMeta?.bookingIds}
            onBack={() => setStep("form")}
            onNext={() => setStep("scanned")}
          />
        );
    }

    if (step === "scanned") {
        return (
          <ScannedAssetsPage
            baseStation={assignmentMeta?.baseStation}
            bookingIds={assignmentMeta?.bookingIds}
            onBack={() => setStep("rfid")}
            onConfirm={() => {
                const bookingId = assignmentMeta?.bookingIds?.[0] ?? "";
                const base = assignmentMeta?.baseStation ?? "TRX-01";
                onNavigate?.(`/system-hardware/assignment-detail?baseStation=${base}&bookingId=${bookingId}&assetsQty=2`);
            }}
          />
        );
    }

    return (
      <Formik initialValues={INITIAL_FORM_VALUES} validationSchema={assignmentSchema} onSubmit={() => {}}>
        <InnerForm
          onNavigate={onNavigate}
          onCreateAssignment={(meta) => { setAssignmentMeta(meta); setStep("rfid"); }}
        />
      </Formik>
    );
}

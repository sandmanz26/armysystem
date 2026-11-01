// Booking 2.0 — hand-off from Create Booking's Confirm to the Booking List (C-1 / C-28).
//
// Figma `Toast - Booking Created` (6183:504775): after Confirm on Review Your Booking the user is on
// Booking List, the new booking is row 1 and a top-right toast reads "Booking created successfully".
// The wizard leaves via a full page load (App.tsx onClose → window.location.href), so the booking is
// kept in sessionStorage: a list of bookings created this browser session (shown on every visit) plus
// a one-shot flag for the toast. No backend in this mock app.
import { bookings, type Booking, type TrainingMode } from "@/data/mock";
import { isRangeType, type CoursewareSchedule } from "./components/ScheduleStep";
import type { Trainee } from "./nominalRollTypes";
import type { Booking2DetailsSnapshot } from "./types";

const LIST_KEY = "booking2:createdBookings";
const TOAST_KEY = "booking2:justCreated";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: Date) => `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Same shapes as the mock's `bookingTime` so the list's parseBookingTime reads them. */
const SESSION_TIME: Record<string, string> = {
  AM: "08:00 AM - 12:00 PM (AM Session)",
  PM: "01:00 PM - 05:00 PM (PM Session)",
  FullDaySingle: "08:00 AM - 05:00 PM (Full Day)",
  FullDayMultiple: "08:00 AM - 05:00 PM (Full Day)",
};

function scheduleStart(s: CoursewareSchedule | undefined): Date | null {
  if (!s?.scheduleType) return null;
  return isRangeType(s.scheduleType) ? s.range?.start ?? null : s.singleDate;
}

function readList(): Booking[] {
  try {
    const raw = sessionStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

/** Bookings created in this browser session, newest first. */
export function getCreatedBookings(): Booking[] {
  return readList();
}

/** True right after a booking was just created — the Booking List shows its toast, then calls clearJustCreated(). */
export function peekJustCreated(): boolean {
  try {
    return sessionStorage.getItem(TOAST_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearJustCreated() {
  try {
    sessionStorage.removeItem(TOAST_KEY);
  } catch {
    /* ignore */
  }
}

export function saveCreatedBooking(input: {
  details: Booking2DetailsSnapshot;
  trainingMode: string;
  schedules: Record<string, CoursewareSchedule>;
  rolls: Record<string, Trainee[]>;
}) {
  const { details, trainingMode, schedules, rolls } = input;
  const coursewares = details.courseware.split(",").map((c) => c.trim()).filter(Boolean);
  const first = coursewares.find((cw) => scheduleStart(schedules[cw])) ?? coursewares[0];
  const sch = first ? schedules[first] : undefined;
  const start = scheduleStart(sch) ?? new Date();
  const date = fmtDate(start);
  const time = sch?.scheduleType === "AdHoc"
    ? `${sch.startTime} - ${sch.endTime} (Ad-Hoc Schedule)`
    : SESSION_TIME[sch?.scheduleType ?? ""] ?? "";

  const now = new Date();
  const created = readList();
  const seq = bookings.length + created.length + 1;
  const unit = details.unitName.replace(/^Unit\s+/i, "").trim();
  const flat = coursewares.reduce((n, cw) => n + (details.stationCountsByCourseware[cw]?.base ?? 0), 0) || parseInt(details.baseQty) || 0;
  const cshaped = coursewares.reduce((n, cw) => n + (details.stationCountsByCourseware[cw]?.cshaped ?? 0), 0) || parseInt(details.cShapedQty) || 0;
  const trainees = Object.values(rolls).reduce((n, list) => n + list.length, 0);

  const booking: Booking = {
    id: `created-${now.getTime()}`,
    bookingId: `#${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-WPT${String(seq).padStart(3, "0")}`,
    program: `${trainingMode} Training for Unit ${unit}`,
    trainingType: details.trainingType === "Individual" ? "Individual" : "Group",
    trainingMode: trainingMode as TrainingMode,
    bookingTime: time ? `${date}\n${time}` : date,
    bookingDate: date,
    status: "Upcoming",
    courseware: coursewares.join(", "),
    assignmentId: "-",
    unitName: unit,
    weapon: details.weapons[0] ?? "",
    weaponTypes: details.weapons,
    weaponCount: details.weapons.length,
    assetIssued: false,
    briefingRoom: details.briefingRoomName || undefined,
    baseStationQty: flat,
    cShapedStationQty: cshaped,
    traineesCount: trainees,
    instructorName: details.instructor || undefined,
    roles: details.roles,
    dryRunTraining: details.dryRun,
  };
  try {
    sessionStorage.setItem(LIST_KEY, JSON.stringify([booking, ...created]));
    sessionStorage.setItem(TOAST_KEY, "1");
  } catch {
    /* storage blocked — the list just won't show it */
  }
}

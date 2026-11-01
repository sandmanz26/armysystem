import type { CabinRow, IosEntry } from "@/pages-tsx/booking/mst-create/components/MSTCabinConfigStep";
import type { MSTBookingDetailsValues } from "@/pages-tsx/booking/mst-create/components/MSTBookingDetailsStep";
import type { Booking } from "@/data/mock";
import type { TCTBookingDetailsValues } from "@/pages-tsx/booking/mst-create/components/TCTBookingDetailsStep";
import type { ClusterRow } from "@/pages-tsx/booking/mst-create/components/MSTTCTClusterConfigStep";

// ── Stored booking shape ───────────────────────────────────────────────────────

export interface MSTLocalBooking {
  id:             string;    // e.g. "mst-local-1749034..."
  bookingId:      string;    // display ID, e.g. "#260604-MST001"
  bookingDetails: MSTBookingDetailsValues;
  cabins:         CabinRow[];
  iosList:        IosEntry[];
  createdAt:      number;    // Date.now() at time of save
}

const LS_KEY = "mst_bookings";

// ── CRUD helpers ──────────────────────────────────────────────────────────────

export function getMSTLocalBookings(): MSTLocalBooking[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MSTLocalBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveMSTLocalBooking(
  bookingDetails: MSTBookingDetailsValues,
  cabins:         CabinRow[],
  iosList:        IosEntry[],
): MSTLocalBooking {
  const all  = getMSTLocalBookings();
  const now  = Date.now();
  const id   = `mst-local-${now}`;

  // Derive date from selectedDate (if set) or now
  const dateVal = bookingDetails.selectedDate;
  const d = dateVal ? new Date(dateVal as unknown as string) : new Date(now);
  const yy  = String(d.getFullYear()).slice(2);
  const mm  = String(d.getMonth() + 1).padStart(2, "0");
  const dd  = String(d.getDate()).padStart(2, "0");
  const seq = String(all.length + 1).padStart(3, "0");
  const bookingId = `#${yy}${mm}${dd}-MST${seq}`;

  const entry: MSTLocalBooking = { id, bookingId, bookingDetails, cabins, iosList, createdAt: now };
  all.push(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  return entry;
}

export function getMSTLocalBookingById(id: string): MSTLocalBooking | undefined {
  return getMSTLocalBookings().find(b => b.id === id);
}

// ── Conversion to the shared Booking interface ────────────────────────────────

export function mstLocalBookingToBooking(b: MSTLocalBooking): Booking {
  const dateVal = b.bookingDetails.selectedDate;
  const d = dateVal ? new Date(dateVal as unknown as string) : new Date(b.createdAt);
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  }).replace(",", "");

  // Build time label
  const { scheduleType } = b.bookingDetails;
  let timeLabel = "";
  if (scheduleType === "AM Session") {
    timeLabel = "08:00 AM - 12:00 PM (AM Session)";
  } else if (scheduleType === "PM Session") {
    timeLabel = "12:00 PM - 05:00 PM (PM Session)";
  } else if (scheduleType === "Full Day") {
    timeLabel = "08:00 AM - 06:00 PM (Full Day)";
  } else if (scheduleType) {
    timeLabel = scheduleType;
  }

  const unitName = b.bookingDetails.unitName || "Unknown Unit";
  const weapon   = (b.bookingDetails.platformVariants ?? [])
    .filter(v => v.selected)
    .map(v => v.label)
    .join(", ") || "—";

  return {
    id:           b.id,
    bookingId:    b.bookingId,
    program:      `MST Group Training for ${unitName}`,
    trainingType: "Group",
    bookingTime:  `${dateStr}\n${timeLabel}`,
    bookingDate:  dateStr,
    status:       "Upcoming",
    trainingMode: "Simulation",
    courseware:   "Component Type Training",
    assignmentId: "-",
    unitName,
    weapon,
    assetIssued:  false,
    isMST:        true,
    sectionType:  "Standalone",
    trainees:     0,
  };
}


// ══════════════════════════════════════════════════════════════════════════════
// TCT (standalone) — same idea as MST above: what Create Booking captured is kept
// in localStorage so the TCT Booking List and Booking Detail can show it back.
// ══════════════════════════════════════════════════════════════════════════════

export interface TCTLocalBooking {
  id:             string;    // "tct-local-<timestamp>"
  bookingId:      string;    // display ID, e.g. "#261002-TCT001"
  bookingDetails: TCTBookingDetailsValues;
  clusters:       ClusterRow[];
  traineesCount:  number;
  createdAt:      number;
}

const TCT_LS_KEY = "tct_bookings";

export function getTCTLocalBookings(): TCTLocalBooking[] {
  try {
    const raw = localStorage.getItem(TCT_LS_KEY);
    return raw ? (JSON.parse(raw) as TCTLocalBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveTCTLocalBooking(
  bookingDetails: TCTBookingDetailsValues,
  clusters:       ClusterRow[],
  traineesCount:  number,
): TCTLocalBooking {
  const all = getTCTLocalBookings();
  const now = Date.now();
  const dateVal = bookingDetails.selectedDate;
  const d = dateVal ? new Date(dateVal as unknown as string) : new Date(now);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const entry: TCTLocalBooking = {
    id: `tct-local-${now}`,
    bookingId: `#${yy}${mm}${dd}-TCT${String(all.length + 1).padStart(3, "0")}`,
    bookingDetails, clusters, traineesCount, createdAt: now,
  };
  all.push(entry);
  localStorage.setItem(TCT_LS_KEY, JSON.stringify(all));
  return entry;
}

export function getTCTLocalBookingById(id: string): TCTLocalBooking | undefined {
  return getTCTLocalBookings().find(b => b.id === id);
}

/**
 * TCT bookings ride on the MST+TCT list/detail screens (`isMSTTCT`), which the TCT rail
 * already relabels to "TCT". The `tct-local-` id prefix is what tells the Booking Detail
 * to show the TCT half only.
 */
export function tctLocalBookingToBooking(b: TCTLocalBooking): Booking {
  const { selectedDate, scheduleType, unitName, platformVariants } = b.bookingDetails;
  const d = selectedDate ? new Date(selectedDate as unknown as string) : new Date(b.createdAt);
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(",", "");
  const timeLabel =
    scheduleType === "AM Session" ? "08:00 AM - 12:00 PM (AM Session)" :
    scheduleType === "PM Session" ? "12:00 PM - 05:00 PM (PM Session)" :
    scheduleType === "Full Day"   ? "08:00 AM - 06:00 PM (Full Day)"   :
    scheduleType ?? "";
  return {
    id:           b.id,
    bookingId:    b.bookingId,
    program:      `TCT Training for ${unitName || "Unknown Unit"}`,
    trainingType: "Group",
    bookingTime:  `${dateStr}\n${timeLabel}`,
    bookingDate:  dateStr,
    status:       "Upcoming",
    trainingMode: "Simulation",
    courseware:   "Component Type Training",
    assignmentId: "-",
    unitName:     unitName || "Unknown Unit",
    weapon:       platformVariants.filter(v => v.selected).map(v => v.label).join(", ") || "—",
    assetIssued:  false,
    isMSTTCT:     true,
    sectionType:  "Standalone",
    trainees:     b.traineesCount,
  };
}

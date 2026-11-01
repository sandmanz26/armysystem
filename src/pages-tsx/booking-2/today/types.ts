export interface TodaysBookingProps {
  onNavigate: (path: string) => void;
}

export type BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Overdue" | "Return Assets" | "Cancelled";

/**
 * One booking's row under a Base Station — Figma `Table - Today's Booking -
 * Bookings by Station` (6214:246975). NOT a collapsible/expandable detail:
 * every booking at a station is always visible as its own row, with the
 * station's own name/active-lanes cell visually spanning all of that
 * station's rows (rendered on the first row only — see `BaseStationRows`).
 */
export interface StationBookingRow {
  program: string;
  bookingId: string;
  /** Other stations this same booking also uses this session, e.g.
   *  ["WPT-02", "WPT-03"] — Figma shows "#bookingId · also at WPT-02, WPT-03". */
  alsoAt?: string[];
  timeRange: string;
  session: string;
  status: BookingStatus;
  /** Figma shows "—" when the booking has no assignment issued yet. */
  assignmentId?: string;
  /** `id` of the full booking record (`@/data/mock`) behind this row. The station mock rows use
   *  Figma's sample names and IDs, which no booking record carries, so this link is what lets
   *  the Booking ID click open the Booking Details drawer (dev feedback #1). */
  bookingRef: string;
}

export interface BaseStation {
  name: string;
  activeLanes: string;
  /** Empty renders Figma's "No bookings" row. */
  bookings: StationBookingRow[];
}

/*
 * The five tabs across the top of Today's Booking — Figma `Advanced Tab Group`
 * on `List` (`6315:38290`). Each one swaps both the section header and the
 * table underneath it.
 */
export type TodayTab =
  | "Total Bookings"
  | "Group Bookings"
  | "Individual Bookings"
  | "Bookings by Station"
  | "Issued Assignments";

/** A row of Figma's `Table - Today's Booking - Assignment`. */
export interface TodayAssignment {
  id: string;
  assignmentId: string;
  /** Figma's `Assignment Type` column, e.g. "Booking". */
  assignmentType: string;
  bookingName: string;
  bookingId: string;
  /** Figma shows "#bookingId · N CW" under the booking name — courseware
   *  count for that booking, same pattern as Assignment List's own cell. */
  coursewareCount: number;
  status: "Issued" | "Pending Return" | "Returned" | "Missing" | "Ownership Transferred" | "Ownership Received";
  baseStations: string[];
  assetQty: number;
  /** "6 Jun 2026\n11:09:00 PM" — date over time, as the rest of the file does it. */
  issuedDate: string;
  returnedDate?: string;
}

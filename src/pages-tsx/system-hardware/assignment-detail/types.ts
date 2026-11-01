import type { Asset } from "@/data/systemHardware";

/** Which of Figma's three Assignment Details screens to render. */
export type AssignmentVariant = "Booking" | "Administration" | "Maintenance";

/** Asset badge values Figma draws on this table: Issued (5839:148778),
 *  Pending Return (5890:296242), Returned / Not Returned (6998:255012). */
export type AssetRowStatus = "Issued" | "Pending Return" | "Returned" | "Not Returned";

/** One row of Figma's `Table - Assignment Details - Asset List`. */
export interface AssignmentAssetRow extends Asset {
  /** The asset's state within THIS assignment, not its global asset status. */
  rowStatus: AssetRowStatus;
  issuedOn: string;
  /** Booking variant only — Figma drops this column on the other two. */
  targetBaseStation: string;
}

export interface AssignmentDetailProps {
  onNavigate?: (path: string) => void;
}

/** Training slot options of Figma's `Drawer - Filter` (6994:180846). */
export type TrainingSlot = "AM Session" | "PM Session" | "Full Day" | "Hourly" | "Ad-hoc";

/** One row of the Bookings tab (6991:172117) — one per booking × courseware. */
export interface AssignmentBookingRow {
  no: number;
  /** Key into BOOKING_DETAILS — used for the booking-detail link. */
  bookingKey: string;
  program: string;
  bookingId: string;
  courseware: string;
  /** "28 Nov 2025" */
  date: string;
  /** ISO yyyy-mm-dd, for the Booking Date filter. */
  isoDate: string;
  slot: TrainingSlot;
  /** "AM Session (08:00 AM - 12:00 PM)" */
  slotLabel: string;
  status: string;
  weaponTypes: string[];
  baseStations: string[];
}

export interface BookingFilters {
  dateFrom: string;
  dateTo: string;
  slots: TrainingSlot[];
  courseware: string[];
}

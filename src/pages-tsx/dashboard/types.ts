export type ViewMode = "Day" | "Week" | "Month" | "Range";
export type SessionType = "AM" | "PM" | "Full" | "Hr" | "Ad";
export type BookingStatus = "Completed" | "Ongoing" | "Upcoming";

export interface WeekCell {
  type: SessionType;
  status: BookingStatus;
  /** Booking name — the block's first line and the tooltip title (Figma). */
  title?: string;
  unit?: string;
  bookedBy?: string;
  instructor?: string;
  /** Time range for the tooltip's second line, e.g. "8:00–12:00". */
  time?: string;
  /** Drives the click-through to the booking detail page. */
  bookingId?: string;
}

export interface DayBooking {
  station: string;
  /** Booking name — the block's first line and the tooltip title (Figma). */
  title: string;
  unitName: string;
  sessionType: SessionType;
  startHour: number; // 0-based from 7AM (so 0=7AM, 1=8AM, ...)
  durationHours: number;
  status: BookingStatus;
  timeLabel: string;
}

export interface WeekStationRow {
  station: string;
  bookingCount: number;
  Mon: WeekCell[];
  Tue: WeekCell[];
  Wed: WeekCell[];
  Thu: WeekCell[];
  Fri: WeekCell[];
  Sat: WeekCell[];
  Sun: WeekCell[];
}

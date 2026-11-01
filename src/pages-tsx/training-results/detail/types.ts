export type Tab = "Training Performance" | "Nominal Roll" | "Detail List" | "Leaderboard";

export interface Segment {
  label: string;
  pct: number;
  count: number;
  color: string;
  bg: string;
  text: string;
  border: string;
}

export interface Trainee {
  no: number;
  rank: string;
  name: string;
  svcId: string;
  weapon: string;
  station: string;
  detail: string;
  lane: string;
  performance: string;
  courseResults: string;
  resultLabel: string;
  mpi: number;
}

export interface DetailEntry {
  id: string;
  traineesCount: number;
  weapon: string;
  lane: string;
  avgScore: string;
}

/**
 * One courseware within a booking. Figma's Multiple-CW detail (5839:44906)
 * scopes ALL of the page below the selector to the chosen courseware: the
 * booking-details card, the performance chart and every tab.
 */
export interface Courseware {
  id: string;
  name: string;
  /** Figma `Booking Time` — two lines: the date, then the session and window. */
  bookingDate: string;
  bookingSession: string;
  /** Figma `Session Time` — when it actually ran, start to end. */
  sessionTime: string;
  /** Figma `Total Duration`, e.g. "3h 30m 56s". */
  totalDuration: string;
  /** Badge on the courseware dropdown row. */
  status: string;
  totalTrainees: number;
  segments: Segment[];
  trainees: Trainee[];
  details: DetailEntry[];
}

export interface TrainingDetailData {
  program: string;
  bookingId: string;
  createdOn: string;
  session: string;
  /** Every courseware on this booking, in Figma's dropdown order. */
  coursewares: Courseware[];
}

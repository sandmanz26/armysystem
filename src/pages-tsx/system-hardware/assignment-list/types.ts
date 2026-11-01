import type { AssignmentStatus } from "@/data/systemHardware";

export const TABS = ["Overall", "Issued", "Pending Return", "Returned", "Not Returned", "Missing"] as const;
export type Tab = (typeof TABS)[number];

export const TAB_STATUS_MAP: Partial<Record<Tab, AssignmentStatus>> = {
  Issued: "Issued",
  "Pending Return": "Pending Return",
  Returned: "Returned",
  "Not Returned": "Not Returned",
  Missing: "Missing",
};

export interface BookingDetail {
  program: string;
  bookingId: string;
  trainingType: string;
  trainingMode: string;
  bookingTime: string;
  status: string;
  trainees: number;
  /** Figma's Assignment List Booking ID cell appends "· N CW" per booking. */
  coursewareCount: number;
}

export interface AssignmentListProps {
  onNavigate?: (path: string) => void;
}

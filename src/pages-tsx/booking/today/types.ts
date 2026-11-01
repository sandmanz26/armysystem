export interface TodaysBookingProps {
  onNavigate: (path: string) => void;
}

export type BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Overdue" | "Return Assets" | "Cancelled";

export interface StationBookingDetail {
  id: string;
  program: string;
  bookingId: string;
  trainingType: string;
  bookingDate: string;
  bookingTime: string;
  assignmentId: string;
  status: BookingStatus;
}

export interface BaseStation {
  name: string;
  bookings: number;
  statuses: BookingStatus[];
  activeLanes: string;
  assignments: number | string;
  details?: StationBookingDetail[];
}

export interface SummaryCard {
  label: string;
  value: number;
  unit: string;
  color: string;
  iconColor: string;
}

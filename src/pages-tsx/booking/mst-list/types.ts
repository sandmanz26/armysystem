export type TabType =
  | "Overall"
  | "Upcoming"
  | "Ongoing"
  | "Return Assets"
  | "Completed"
  | "Cancelled"
  | "Overdue";

export type CalendarMode = "Month" | "Weekly" | "Daily";

export interface BookingListProps {
  onNavigate?: (path: string) => void;
  createPath?: string;
  program?: "MST" | "TCT";
}

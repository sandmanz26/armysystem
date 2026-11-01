export type TabType =
  | "Overall"
  | "Upcoming"
  | "Ongoing"
  | "Return Assets"
  | "Completed"
  | "Completed with Missing Assets"
  | "Cancelled"
  | "Overdue";

export type CalendarMode = "Month" | "Weekly" | "Daily";

export interface BookingListProps {
  onNavigate?: (path: string) => void;
  createPath?: string;
}

import { cn } from "@/lib/utils";

const BOOKING_STATUS_STYLES: Record<string, string> = {
  Ongoing: "text-orange",
  Upcoming: "text-info",
  Completed: "text-success",
  Overdue: "text-danger",
  "Pending Return": "text-orange",
  "Not Returned": "text-danger",
};

export function BookingStatusPill({ status }: { status: string }) {
  return (
    <span className={cn("text-sm font-semibold", BOOKING_STATUS_STYLES[status] ?? "text-caption")}>
      {status}
    </span>
  );
}

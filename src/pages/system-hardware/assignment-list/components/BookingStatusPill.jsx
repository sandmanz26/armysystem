import { cn } from "@/lib/utils";
const BOOKING_STATUS_STYLES = {
    Ongoing: "text-orange-600",
    Upcoming: "text-blue-500",
    Completed: "text-green-600",
    Overdue: "text-red-500",
    "Pending Return": "text-orange-500",
    "Not Returned": "text-red-500",
};
export function BookingStatusPill({ status }) {
    return (<span className={cn("text-sm font-semibold", BOOKING_STATUS_STYLES[status] ?? "text-gray-600")}>
      {status}
    </span>);
}

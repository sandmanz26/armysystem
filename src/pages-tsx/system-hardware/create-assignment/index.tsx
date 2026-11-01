// System Hardware — Create Assignment (Issue Asset, Step 1), reached from Assignment List
// (`/system-hardware/create-assignment`, with the Administration / Booking / Maintenance chips) and
// from a booking (`?bookingId=…[&fromBooking=true]`, locked to that booking). The page is the shared
// `CreateAssignmentView` (Figma 6966:*, 5871:*, F-010 / SH-24 / SH-15). Step 2 is
// `/system-hardware/issue-assets` (Scan Assets).
import { useMemo } from "react";
import { CreateAssignmentView } from "@/components/issue-asset/CreateAssignmentView";

function readParam(name: string): string | null {
  const fromSearch = new URLSearchParams(window.location.search).get(name);
  if (fromSearch) return fromSearch;
  const m = window.location.hash.match(new RegExp(`${name}=([^&]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function CreateAssignment({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const bookingId = useMemo(() => readParam("bookingId"), []);
  return (
    <CreateAssignmentView
      entry={bookingId ? "booking-details" : "assignment-list"}
      anchorBookingId={bookingId}
      issueBase="/system-hardware/issue-assets"
      cancelPath="/system-hardware/assignment-list"
      onNavigate={onNavigate}
    />
  );
}

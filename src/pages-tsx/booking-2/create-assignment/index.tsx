// Booking 2.0 — Create Assignment (Issue Asset, Step 1). Reached from Today's Booking (no booking
// param → every booking's courseware) and from Booking Details (`?bookingId=…&courseware=…` → only
// that booking; 1 courseware = one ticked, locked row). The page itself is the shared
// `CreateAssignmentView` (Figma 6966:*, F-010 / SH-24) — Booking 2.0 has no Assignment Type chips.
// Step 2 is `/bookings/issue-assets` (Scan Assets).
import { useMemo } from "react";
import { CreateAssignmentView } from "@/components/issue-asset/CreateAssignmentView";

export function CreateAssignment2({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const bookingId = useMemo(() => new URLSearchParams(window.location.search).get("bookingId"), []);
  return (
    <CreateAssignmentView
      entry={bookingId ? "booking-details" : "today"}
      anchorBookingId={bookingId}
      issueBase="/bookings/issue-assets"
      cancelPath={bookingId ? `/bookings/detail?id=${bookingId}` : "/bookings/today"}
      onNavigate={onNavigate}
    />
  );
}

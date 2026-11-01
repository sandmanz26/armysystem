// MST Create Booking — hand-off from "Confirm" to the MST Booking List (Figma `Toast - Booking Created`, 6183:504775).
//
// After Confirm the wizard leaves with a full page load (App.tsx onClose → window.location.href), so a one-shot flag in
// sessionStorage tells the MST Booking List to show the top-right toast "Booking created successfully". The list itself
// (mst-list) is not edited — App.tsx mounts <MSTCreatedToast /> next to it. The booking row comes from localStorage
// (`saveMSTLocalBooking`), as before.
import { useEffect, useState } from "react";
import { Toast } from "@/components/toast";

const TOAST_KEY = "mst:justCreated";

export function flagMSTBookingCreated() {
  try { sessionStorage.setItem(TOAST_KEY, "1"); } catch { /* no storage → no toast */ }
}

export function MSTCreatedToast() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TOAST_KEY) === "1") {
        sessionStorage.removeItem(TOAST_KEY);
        setOpen(true);
      }
    } catch { /* ignore */ }
  }, []);
  return <Toast message="Booking created successfully" open={open} onDismiss={() => setOpen(false)} placement="top-right" />;
}

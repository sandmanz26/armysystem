// Booking 2.0 Create Booking — local extension of the old module's BookingDetailsSnapshot
// (src/pages-tsx/booking/create/types.ts is read-only for this module). Adds the Step 1 values
// the Review modal (6183:504764) needs and the old snapshot never carried.
import type { BookingDetailsSnapshot } from "@/pages-tsx/booking/create/types";

export interface Booking2DetailsSnapshot extends BookingDetailsSnapshot {
  /** Step 1 "Include Dry Run Training" — Review shows "Include / Not Include Dry Run Training". */
  dryRun: boolean;
}

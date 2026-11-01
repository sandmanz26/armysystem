// MST Create Booking — cabin availability on a date (Step 2 "Availability on Select Date Slot",
// Step 3 "Occupied" / "Unavailable" rows).
//
// Prototype rule, mock data only (no backend). Figma shows one sample state (MST-03/05/07 Occupied,
// MST-10/11/12 Unavailable, 6183:422470) but never says what makes a cabin occupied on a given date.
// Assumption used here:
//   • MST-10, MST-11, MST-12 are Unavailable (out of service) on every date;
//   • on an even day of the month MST-03, MST-05, MST-07 are Occupied (Figma's sample); on an odd day only MST-03;
//   • everything else is free.
// Open question for the PO: what makes a cabin Occupied (PRD MST15).
import type { CabinRow } from "./components/MSTCabinConfigStep";

export const MST_CABIN_COUNT = 12;
const OUT_OF_SERVICE = ["MST10", "MST11", "MST12"];

const cabinId = (n: number) => `MST${String(n).padStart(2, "0")}`;

export function occupiedCabinsOn(date: Date | null): string[] {
  if (!date) return [];
  return date.getDate() % 2 === 0 ? ["MST03", "MST05", "MST07"] : ["MST03"];
}

/** Cabins a booking could pick on this date (free and in service). */
export function freeCabinCount(date: Date | null): number {
  return MST_CABIN_COUNT - OUT_OF_SERVICE.length - occupiedCabinsOn(date).length;
}

/** 12 cabin rows for a date; `previous` keeps what the user already configured for cabins that are still free. */
export function cabinsForDate(date: Date | null, previous?: CabinRow[]): CabinRow[] {
  const occupied = occupiedCabinsOn(date);
  return Array.from({ length: MST_CABIN_COUNT }, (_, i) => {
    const id = cabinId(i + 1);
    const isOccupied = occupied.includes(id);
    const unavailable = OUT_OF_SERVICE.includes(id);
    const prev = previous?.find((c) => c.id === id);
    if (isOccupied || unavailable) {
      return { id, occupied: isOccupied, unavailable: unavailable || undefined, selected: false, callSign: "", weaponVariant: "", role: "" };
    }
    return { id, occupied: false, selected: prev?.selected ?? false, callSign: prev?.callSign ?? "", weaponVariant: prev?.weaponVariant ?? "", role: prev?.role ?? "" };
  });
}

/** Figma shows "MST-01"; the stored id stays "MST01" so Booking Detail keeps reading it. */
export const cabinLabel = (id: string) => id.replace(/^MST(\d)/, "MST-$1");

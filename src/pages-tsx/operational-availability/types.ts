// Re-export data-layer types so sibling pages (Month, Detail) can import from here
export type { OAMonth, OABooking, Device, Lane } from "@/data/operationalAvailability";

// ── Local UI types ─────────────────────────────────────────────────────────────

export interface DateRange {
  fromYear: number;
  fromMonth: number; // 0-indexed
  toYear: number;
  toMonth: number;   // 0-indexed
}

export interface OperationalAvailabilityProps {
  onNavigate?: (path: string) => void;
}

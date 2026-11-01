export type LaneStatus = "Active" | "Inactive";
export type StationStatus = "Active" | "Inactive";

export interface Lane {
  id: string;
  name: string;
  /**
   * Stored status. Base Station Details no longer reads it for the Lanes table — Figma Notes
   * `6921:238015` ("Active & inactive station & lane comes from lane blackout date") makes the
   * pill a derived value (`isLaneBlackedOut` in blackoutRules.ts). Kept for the screens that
   * still read it (Site Management list lane counts).
   */
  status: LaneStatus;
  /** Lane-level blackouts. Old mock rows are bare labels; structured rows carry `occurrences`. */
  blackoutDates: (string | BlackoutDate)[];
  lastUpdatedOn: string;
}

export interface BlackoutDate {
  /**
   * "<date range>\n<recurrence?>\n<time range>" — the original joined string.
   * Still read as a fallback so older records keep rendering, but new records
   * fill the three fields below instead: Figma gives each line its own icon,
   * which a joined string cannot express.
   */
  label: string;
  /** Figma gives recurring blackouts their own delete confirmation copy. */
  recurring?: boolean;
  /** Figma's Blackout Dates tab shows Active / Passed. */
  status?: "Active" | "Passed";

  /* ── Figma `Blackout Date` cell, one line + one icon each ─────────────── */
  /** Line 1, repeat icon. Recurring only, e.g. "Every Fri". */
  recurrence?: string;
  /** Line 2, clock icon, e.g. "06:00 PM - 11:00 PM". */
  timeRange?: string;
  /** Line 3, calendar icon, e.g. "from 5 Dec 2025, no end date". */
  dateRange?: string;
  /** Figma `Next Blackout Date` column. Absent renders as "—". */
  nextDate?: string;
  /** True when the blackout covers whole days ("All day"). */
  allDay?: boolean;
  /**
   * Every concrete window this blackout blocks, as local ISO date-times
   * ("2026-10-16T06:00"). Lets the Lanes table derive Available / Unavailable and the
   * relative "Next Blackout Date" text. Records without it fall back to `status`.
   */
  occurrences?: BlackoutOccurrence[];
}

export interface BlackoutOccurrence {
  start: string;
  end: string;
}

export interface BaseStation {
  id: string;
  name: string;
  status: StationStatus;
  lanes: Lane[];
  blackoutDates: BlackoutDate[];
  lastUpdatedOn: string;
}

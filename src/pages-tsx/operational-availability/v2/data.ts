import { computeAO, parseHMS } from "./utils";

/*
 * Mock data for Operational Availability 2.0, copied from Figma so the screens
 * line up with the frames:
 *   · month list — `List - Filled` (5119:297872), 10 rows Aug 2026 … Nov 2025
 *   · month detail — `Operational Availability Details` (8033:293789 Bookings tab,
 *     8050:145443 Base Stations tab), which only shows July 2026.
 * Every other month's detail reuses the July booking / base-station sample
 * (only the KPI cards change) until a backend exists.
 */

export interface OAMonthRow {
  id: string;            // "jul-2026"
  month: string;         // "July 2026"
  /** 1-based "1-31 July 2026" sub-title on the detail page. */
  days: number;
  utSeconds: number;     // Total Activity UT
  dtSeconds: number;     // Total Activity DT
  ao: number;            // percent, derived from UT/DT
  totalBookings: number;
}

const row = (id: string, month: string, days: number, ut: string, dt: string, totalBookings: number): OAMonthRow => {
  const utSeconds = parseHMS(ut);
  const dtSeconds = parseHMS(dt);
  return { id, month, days, utSeconds, dtSeconds, ao: computeAO(utSeconds, dtSeconds), totalBookings };
};

export const OA_MONTHS: OAMonthRow[] = [
  row("aug-2026", "August 2026",   31, "49h 52m 18s", "1h 48m 42s", 42),
  row("jul-2026", "July 2026",     31, "50h 17m 54s", "3h 15m 10s", 42),
  row("jun-2026", "June 2026",     30, "48h 25m 36s", "2h 1m 12s",  42),
  row("may-2026", "May 2026",      31, "47h 58m 5s",  "3h 31m 47s", 42),
  row("apr-2026", "April 2026",    30, "49h 10m 40s", "1h 35m 20s", 42),
  row("mar-2026", "March 2026",    31, "51h 40m 15s", "2h 20m 5s",  42),
  row("feb-2026", "February 2026", 28, "46h 0m 30s",  "2h 25m 50s", 42),
  row("jan-2026", "January 2026",  31, "49h 50m 12s", "1h 0m 24s",  42),
  row("dec-2025", "December 2025", 31, "40h 2m 48s",  "1h 20m 36s", 42),
  row("nov-2025", "November 2025", 30, "47h 30m 0s",  "2h 10m 25s", 42),
];

// ── Detail (8033:293789 / 8050:145443) ────────────────────────────────────────

export interface OALaneDowntime {
  lane: string;
  start: string;
  end: string;
  dt: string;
  reason: string;
}

export interface OABookingStation {
  station: string;
  dt: string;
  lanesAffected: string;   // "1/15"
  lanes: OALaneDowntime[];
}

export interface OADetailBooking {
  id: string;
  name: string;
  ref: string;
  ut: string;
  dt: string;
  share: string;           // "38.7%" or "—"
  stations: OABookingStation[];
}

export interface OADetailStation {
  id: string;
  station: string;
  ut: string;
  dt: string;
  share: string;
  bookingsAffected: string; // "2" or "—"
}

/* Figma only opens booking 2's base-station breakdown (WPT-01 22m 10s,
 * WPT-02 40m 10s, the rest 0m 0s). Bookings 1 and 3 also carry downtime; their
 * breakdowns are mock values chosen so that each station's "Bookings Affected"
 * on the Base Stations tab (WPT-02 2 · WPT-03 2 · WPT-01 1 · WPT-04 1 ·
 * WPT-05 —) matches the bookings that "View" (View Affected Bookings) lists. */
const LANES_SAMPLE: OALaneDowntime[] = [
  { lane: "Lane 1", start: "10:00 AM", end: "10:22 AM", dt: "22m 0s", reason: "Projector lamp fault" },
  { lane: "Lane 5", start: "10:35 AM", end: "10:50 AM", dt: "15m 0s", reason: "Target lifter jam" },
];

const STATION_IDS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05"] as const;

/** All five stations in Figma's order; the ones in `down` get downtime + lanes. */
const stationsWith = (down: Partial<Record<(typeof STATION_IDS)[number], string>>): OABookingStation[] =>
  STATION_IDS.map((station) => {
    const dt = down[station];
    return dt
      ? { station, dt, lanesAffected: "1/15", lanes: LANES_SAMPLE }
      : { station, dt: "0m 0s", lanesAffected: "0/15", lanes: [] };
  });

const STATIONS_BY_BOOKING: Record<string, OABookingStation[]> = {
  b1: stationsWith({ "WPT-02": "25m 20s", "WPT-03": "20m 10s" }),
  b2: stationsWith({ "WPT-01": "22m 10s", "WPT-02": "40m 10s" }), // Figma 8033:293789
  b3: stationsWith({ "WPT-03": "37m 20s", "WPT-04": "20m 10s" }),
};

const b = (id: string, name: string, ref: string, ut: string, dt: string, share: string): OADetailBooking => ({
  id, name, ref, ut, dt, share, stations: parseHMS(dt) > 0 ? STATIONS_BY_BOOKING[id] ?? [] : [],
});

export const OA_DETAIL_BOOKINGS: OADetailBooking[] = [
  b("b1",  "Collective Training for Unit Beta",    "#251104-WPT015", "2h 0m 0s",  "45m 30s", "38.7%"),
  b("b2",  "Judgemental Training for Unit Beta",   "#251104-WPT014", "3h 30m 0s", "32m 10s", "31.9%"),
  b("b3",  "Collective Training for Unit 41SAB",   "#251104-WPT013", "4h 0m 0s",  "57m 30s", "29.5%"),
  b("b4",  "Individual Training for Jasmine Rice", "#251014-WPT012", "5h 10m 0s", "0m 0s",   "—"),
  b("b5",  "Individual Training for Jessica Cho",  "#251014-WPT011", "2h 45m 0s", "0m 0s",   "—"),
  b("b6",  "Marksmanship Training for Unit 2SIR",  "#251104-WPT018", "3h 20m 0s", "0m 0s",   "—"),
  b("b7",  "Marksmanship Training for Unit Alpha", "#251104-WPT019", "4h 0m 0s",  "0m 0s",   "—"),
  b("b8",  "Judgemental Training for Unit Bravo",  "#251104-WPT017", "2h 0m 0s",  "0m 0s",   "—"),
  b("b9",  "Judgemental Training for Unit SAR21",  "#251104-WPT016", "2h 0m 0s",  "0m 0s",   "—"),
  b("b10", "Collective Training for Unit Beta",    "#251104-WPT015", "1h 30m 0s", "0m 0s",   "—"),
];

export const OA_DETAIL_STATIONS: OADetailStation[] = [
  { id: "s2", station: "WPT-02", ut: "9h 18m 40s",  dt: "1h 57m 30s", share: "60.2%", bookingsAffected: "2" },
  { id: "s3", station: "WPT-03", ut: "10h 25m 34s", dt: "35m 30s",    share: "18.2%", bookingsAffected: "2" },
  { id: "s1", station: "WPT-01", ut: "10h 32m 10s", dt: "22m 0s",     share: "11.3%", bookingsAffected: "1" },
  { id: "s4", station: "WPT-04", ut: "10h 41m 20s", dt: "20m 10s",    share: "10.3%", bookingsAffected: "1" },
  { id: "s5", station: "WPT-05", ut: "9h 20m 10s",  dt: "0m 0s",      share: "—",     bookingsAffected: "—" },
];

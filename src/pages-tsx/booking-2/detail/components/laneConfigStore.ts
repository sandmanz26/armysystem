// Booking 2.0 — Booking Details › Lane Configuration: data + mock seed.
//
// Reuses Create Booking 2.0 Step 3's lane model (`LaneRow`, the fixed 15-lane Flat Screen with
// lanes 4/11/15 occupied, the growable C-Shaped station) read-only, and adds the per-lane
// `active` flag the Booking Details frames show as the Status column (On / Off). Lanes 4/11/15 of
// a Flat Screen are always Off and cannot be switched on (their toggle is disabled in Figma's
// Edit Lane Config, 5512:166256).
//
// Persistence: in-memory + sessionStorage per booking, so an edit survives switching tabs and a
// reload within the session (same approach as ongoing-session's `sessionStatusOverride`).
import {
  FLAT_LANE_COUNT, OCCUPIED_LANES, type LaneRow,
} from "@/pages-tsx/booking-2/create/laneConfigTypes";

export interface DetailLane extends LaneRow {
  active: boolean;
}

export interface DetailStation {
  /** Station name shown as the card title in the read view ("WPT-01"). */
  name: string;
  lanes: DetailLane[];
}

export interface DetailLaneConfig {
  flat: DetailStation[];
  cshaped: DetailStation[];
}

export const isOccupiedLane = (type: "flat" | "cshaped", laneNo: number) =>
  type === "flat" && OCCUPIED_LANES.includes(laneNo);

export function emptyFlatStation(name: string): DetailStation {
  return {
    name,
    lanes: Array.from({ length: FLAT_LANE_COUNT }, (_, i) => ({
      role: "", weapon: [], active: !OCCUPIED_LANES.includes(i + 1),
    })),
  };
}

export function emptyCShapedStation(name: string): DetailStation {
  return { name, lanes: [{ role: "", weapon: [], active: true }] };
}

/** A lane counts as configured once it has a role or a controlled item/weapon. */
export function isConfigEmpty(cfg: DetailLaneConfig): boolean {
  return [...cfg.flat, ...cfg.cshaped].every((st) => st.lanes.every((l) => !l.role && l.weapon.length === 0));
}

// ── Mock seed ────────────────────────────────────────────────────────────────
// Booking 11 (Upcoming) is seeded with the exact content of Figma
// `Lane Configuration - Flat Screen - Filled` (5511:46139) and the filled C-Shaped frame
// (5512:153377): three Flat Screens WPT-01..03 and two C-Shaped stations WPT-04/05.
// Every other booking starts empty ("Not Assigned"), e.g. booking 18.
const FIGMA_FLAT_LANES: (Omit<DetailLane, "active"> | null)[] = [
  { role: "F.O/OC", weapon: ["Cond Bino", "MATADOR", "SAR21"] },
  { role: "GPMG Team (STEELNET)", weapon: ["LMG", "M110", "SAR21"] },
  { role: "M110 Team (SNIPERS)", weapon: ["LMG", "M110", "SAR21"] },
  null, // lane 4 — occupied
  null, // lane 5 — switched off
  { role: "M110 Team (SNIPERS)", weapon: ["LMG", "M110", "SAR21"] },
  { role: "M203", weapon: ["LMG", "M110", "SAR21"] },
  { role: "MATADOR", weapon: ["LMG", "M110", "SAR21"] },
  { role: "PSLAM (PIONEER)", weapon: ["LMG", "M110", "SAR21"] },
  { role: "MATADOR", weapon: ["LMG", "M110", "SAR21"] },
  null, // lane 11 — occupied
  { role: "PSLAM", weapon: ["LMG", "M110", "SAR21"] },
  { role: "SAR21", weapon: ["LMG", "M110", "SAR21"] },
  { role: "F.O/OC", weapon: ["LMG", "M110", "SAR21"] },
  null, // lane 15 — occupied
];

const figmaFlat = (name: string): DetailStation => ({
  name,
  lanes: FIGMA_FLAT_LANES.map((l) => (l ? { ...l, weapon: [...l.weapon], active: true } : { role: "", weapon: [], active: false })),
});

const figmaCShaped = (name: string): DetailStation => ({
  name,
  lanes: [
    ...FIGMA_FLAT_LANES.slice(0, 3).map((l) => ({ role: l!.role, weapon: [...l!.weapon], active: true })),
    { role: "", weapon: [], active: false },
  ],
});

const SEED: Record<string, () => DetailLaneConfig> = {
  "11": () => ({
    flat: ["WPT-01", "WPT-02", "WPT-03"].map(figmaFlat),
    cshaped: ["WPT-04", "WPT-05"].map(figmaCShaped),
  }),
};

// ── Store ────────────────────────────────────────────────────────────────────
const KEY = (bookingId: string, courseware: string) => `booking2.laneConfig.${bookingId}.${courseware}`;
const memory = new Map<string, DetailLaneConfig>();

function read(key: string): DetailLaneConfig | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as DetailLaneConfig;
      memory.set(key, parsed);
      return parsed;
    }
  } catch { /* storage unavailable — fall back to the seed */ }
  return null;
}

export interface StationNames {
  flat: string[];
  cshaped: string[];
}

/**
 * The lane configuration of one booking/courseware. Station names come from the booking (after any
 * Reassign on the Booking Details tab); a booking without assigned stations falls back to the
 * seed's own names, or to `fallback` (e.g. "Flat Screen #N" for its station quantity).
 */
export function getLaneConfig(
  bookingId: string, courseware: string, names: StationNames, fallback: StationNames = names,
): DetailLaneConfig {
  const saved = read(KEY(bookingId, courseware));
  const base = saved ?? SEED[bookingId]?.() ?? {
    flat: (names.flat.length || names.cshaped.length ? names.flat : fallback.flat).map(emptyFlatStation),
    cshaped: (names.flat.length || names.cshaped.length ? names.cshaped : fallback.cshaped).map(emptyCShapedStation),
  };
  // Keep the booking's current station names (Reassign renames a station, lanes stay).
  const rename = (list: DetailStation[], src: string[]) =>
    list.map((st, i) => (src[i] ? { ...st, name: src[i] } : st));
  return {
    flat: names.flat.length ? rename(base.flat, names.flat) : base.flat,
    cshaped: names.cshaped.length ? rename(base.cshaped, names.cshaped) : base.cshaped,
  };
}

export function saveLaneConfig(bookingId: string, courseware: string, cfg: DetailLaneConfig) {
  const key = KEY(bookingId, courseware);
  memory.set(key, cfg);
  try { sessionStorage.setItem(key, JSON.stringify(cfg)); } catch { /* ignore */ }
}

/** True once any lane of this booking/courseware has a role or weapon (for e.g. the
 *  "Configure lanes in Lane Configuration…" banner of the Empty frames, 5511:46141). */
export function hasLaneConfig(bookingId: string, courseware: string): boolean {
  return !isConfigEmpty(getLaneConfig(bookingId, courseware, { flat: [], cshaped: [] }));
}

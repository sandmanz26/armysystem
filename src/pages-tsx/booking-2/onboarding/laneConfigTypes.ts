// Booking 2.0 Onboarding — Lane Configuration step's own types/helpers.
// Local to booking-2/onboarding, NOT shared with booking-2/create's
// laneConfigTypes.ts: Onboarding's lanes come in already seeded (assigned at
// booking time) and add a per-lane "active" Status toggle the Create flow
// doesn't have — a new file rather than modifying the shared one, per the
// Booking 2.0 rule of never touching a shared component for an
// onboarding-only need.
export interface OnbLaneRow {
  role: string;
  weapon: string[];
  active: boolean;
}

export interface OnbStationData {
  lanes: OnbLaneRow[];
}

export const OCCUPIED_LANES = [4, 11, 15];
export const FLAT_LANE_COUNT = 15;

// Shared "WPT-01"-style station label, so the Lane Configuration and Detail
// List steps refer to the same station by the same name.
export function stationLabel(i: number): string {
  return `WPT-${String(i + 1).padStart(2, "0")}`;
}

// The lane NUMBERS (1-indexed) currently active for a station, in display
// order — what Detail List chunks trainees against to compute Detail N /
// Lane assignments.
export function activeLaneNumbers(st: OnbStationData): number[] {
  return st.lanes.map((_, i) => i + 1).filter((laneNo) => st.lanes[laneNo - 1].active);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// Seeds a station as if it had already been configured at booking time —
// every non-occupied lane gets a role (if Collective) + 1-2 weapons and
// starts active, so Onboarding's job is reviewing/adjusting, not starting
// from a blank sheet.
export function seedFlatStation(roleOptions: string[], weaponOptions: string[], isCollective: boolean, seedOffset: number): OnbStationData {
  return {
    lanes: Array.from({ length: FLAT_LANE_COUNT }, (_, i) => {
      const laneNo = i + 1;
      if (OCCUPIED_LANES.includes(laneNo)) return { role: "", weapon: [], active: false };
      const seed = seedOffset + i;
      const weaponCount = 1 + (seed % 3 === 0 ? 2 : seed % 2);
      const weapon = Array.from(new Set(Array.from({ length: weaponCount }, (_, wi) => pick(weaponOptions, seed + wi * 7))));
      return { role: isCollective ? pick(roleOptions, seed) : "", weapon, active: true };
    }),
  };
}

export function seedCShapedStation(roleOptions: string[], weaponOptions: string[], isCollective: boolean, laneCount: number, seedOffset: number): OnbStationData {
  return {
    lanes: Array.from({ length: Math.max(1, laneCount) }, (_, i) => {
      const seed = seedOffset + i;
      const weaponCount = 1 + (seed % 2);
      const weapon = Array.from(new Set(Array.from({ length: weaponCount }, (_, wi) => pick(weaponOptions, seed + wi * 7))));
      return { role: isCollective ? pick(roleOptions, seed) : "", weapon, active: true };
    }),
  };
}

export interface StationProgress {
  activeCount: number;
  roleAssigned: number;
  weaponAssigned: number;
}

export function stationProgress(st: OnbStationData): StationProgress {
  const activeLanes = st.lanes.filter((l) => l.active);
  const activeCount = activeLanes.length;
  const roleAssigned = activeLanes.filter((l) => !!l.role).length;
  const weaponAssigned = activeLanes.filter((l) => l.weapon.length > 0).length;
  return { activeCount, roleAssigned, weaponAssigned };
}

// Per-lane diff text for the "Confirm Lane Configuration Changes" summary —
// compares the seeded snapshot against the current edited state.
export function laneDiffText(seed: OnbLaneRow, cur: OnbLaneRow, isCollective: boolean): string | null {
  const parts: string[] = [];

  if (seed.active !== cur.active) {
    parts.push(cur.active ? "marked on" : "marked off");
  }

  if (isCollective && seed.role !== cur.role) {
    if (seed.role && cur.role) parts.push("role replaced");
    else if (cur.role) parts.push("role added");
    else parts.push("role removed");
  }

  const added = cur.weapon.filter((w) => !seed.weapon.includes(w));
  const removed = seed.weapon.filter((w) => !cur.weapon.includes(w));
  if (added.length > 0 || removed.length > 0) {
    if (added.length === removed.length) {
      parts.push(`${added.length} weapon${added.length > 1 ? "s" : ""} replaced`);
    } else {
      if (added.length > 0) parts.push(`${added.length} weapon${added.length > 1 ? "s" : ""} added`);
      if (removed.length > 0) parts.push(`${removed.length} weapon${removed.length > 1 ? "s" : ""} removed`);
    }
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

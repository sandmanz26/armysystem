// Booking 2.0 Lane Configuration — shared types/helpers. Local to booking-2.
// Mirrors the rules already established in the current WPT flow (Sec. 3.4.1):
// Flat Screen is a fixed 15-lane layout with lanes 4/11/15 permanently
// inactive (12 usable); C-Shaped starts at 1 lane and grows via "+ Add Lane"
// up to a 15-lane cap (v0.24 change, already real behavior in the app).
export interface LaneRow {
  role: string;
  weapon: string[];
  /** Lane table `Status` toggle (Figma 5029:69433 / 5322:161092). Undefined = on. A lane the user
   *  switches off shows "—" for Role/Weapon and drops out of the "lanes active" count. */
  active?: boolean;
}

export interface StationData {
  lanes: LaneRow[];
}

export interface CoursewareLaneData {
  flat: StationData[];
  cshaped: StationData[];
}

export const OCCUPIED_LANES = [4, 11, 15];
export const FLAT_LANE_COUNT = 15;
export const CSHAPED_MAX = 15;

export const emptyLane = (): LaneRow => ({ role: "", weapon: [] });

export function makeFlatStation(): StationData {
  return { lanes: Array.from({ length: FLAT_LANE_COUNT }, () => emptyLane()) };
}

export function makeCShapedStation(): StationData {
  return { lanes: [emptyLane()] };
}

export interface StationProgress {
  activeCount: number;
  roleAssigned: number;
  weaponAssigned: number;
  complete: boolean;
}

/** Flat Screen lanes 4/11/15 are permanently occupied (Status toggle off + disabled). */
export const isOccupiedLane = (isFlat: boolean, laneIdx: number) => isFlat && OCCUPIED_LANES.includes(laneIdx + 1);

/** A lane counts as active unless it is occupied or the user switched its Status toggle off. */
export const isLaneActive = (st: StationData, isFlat: boolean, laneIdx: number) =>
  !isOccupiedLane(isFlat, laneIdx) && st.lanes[laneIdx]?.active !== false;

export function stationProgress(st: StationData, isFlat: boolean, isCollective: boolean): StationProgress {
  const laneCount = isFlat ? FLAT_LANE_COUNT : st.lanes.length;
  const activeIdx = Array.from({ length: laneCount }, (_, i) => i).filter((i) => isLaneActive(st, isFlat, i));
  const activeCount = activeIdx.length;
  const roleAssigned = activeIdx.filter((i) => !!st.lanes[i]?.role).length;
  const weaponAssigned = activeIdx.filter((i) => (st.lanes[i]?.weapon.length ?? 0) > 0).length;
  const complete = activeCount > 0 && weaponAssigned === activeCount && (!isCollective || roleAssigned === activeCount);
  return { activeCount, roleAssigned, weaponAssigned, complete };
}

export interface StationRef {
  courseware: string;
  type: "flat" | "cshaped";
  index: number;
  label: string;
}

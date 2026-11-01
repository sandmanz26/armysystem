export type SessionType = "Standalone" | "Integrated";
export type ProgramType = "WPT" | "MST" | "TCT" | null;
export type TrainingType = "Individual" | "Group" | null;
export type DryRun = "Yes" | "No" | null;
export type StationType = "Flat Screen" | "C-Shaped Station";
export type ScheduleType = "AM Session" | "PM Session" | "FullDay" | "Ad-hoc" | null;
export type ScheduleSection = string | null;

export interface WeaponItem {
  id: string;
  label: string;
  qty: number;
  selected: boolean;
}

export interface LaneState {
  on: boolean;
  weaponType: string[];
  team: string;
}

export interface BookingDetailsSnapshot {
  weapons: string[];
  weaponSummary: string;
  baseQty: string;
  cShapedQty: string;
  courseware: string;
  trainingType: string;
  roles: string[];
  unitContact: string;
  instructor: string;
  ftmsId: string;
  unitName: string;
  stationCountsByCourseware: Record<string, { base: number; cshaped: number }>;
  // Additive field for Booking 2.0's Briefing Room dropdown — optional, so the
  // old booking module (which never reads it) is unaffected.
  briefingRoomName?: string;
}

export interface ScheduleSnapshot {
  scheduleType: ScheduleType;
  section: ScheduleSection;
  briefing: boolean;
  selectedDate: Date | null;
  dateRangeStart?: Date | null;
  dateRangeEnd?: Date | null;
  startTime?: string;
  endTime?: string;
}

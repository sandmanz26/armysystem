export type SessionType = "Standalone" | "SimIntegrated" | "Integrated";
export type ProgramType = "WPT" | "MST" | "TCT" | "MST+TCT" | null;
export type TrainingType = "Individual" | "Group" | null;
export type DryRun = "Yes" | "No" | null;
export type StationType = "Base Station" | "C-Shaped Station";
export type ScheduleType = "AM/PM" | "FullDay" | "Ad-hoc" | null;
export type ScheduleSection = string | null;

export interface WeaponItem {
  id: string;
  label: string;
  qty: number;
  selected: boolean;
}

export interface LaneState {
  on: boolean;
  weaponType: string;
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

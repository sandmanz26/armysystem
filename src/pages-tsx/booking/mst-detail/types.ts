export type BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Completed with Missing Assets" | "Cancelled" | "Overdue" | "Return Assets";

export interface BookingTrainee {
  no: number;
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
  weaponType: string;
}

export interface WeaponEntry {
  type: string;
  units: number;
}

export interface StationEntry {
  label: string;
  value: string;
}

export interface LaneConfigEntry {
  lane: string;
  weapon: string;
  status: string;
}

export interface Booking {
  id: string;
  title: string;
  status: BookingStatus;
  date: string;
  time: string;
  program: string;
  trainingMode: string;
  briefingRoom: string;
  sectionType: string;
  courseware: string;
  traineesCount: number;
  trainingType: string;
  assignmentId: string;
  ftmsFile: string;
  isIntegrated: boolean;
  isMST?: boolean;
  isMSTTCT?: boolean;
  weapons: WeaponEntry[];
  baseStations: StationEntry[];
  cShapedStations: StationEntry[];
  laneConfig: LaneConfigEntry[];
  trainees: BookingTrainee[];
}

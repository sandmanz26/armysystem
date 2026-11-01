export type BookingStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed"
  | "Completed with Missing Assets"
  | "Cancelled"
  | "Overdue"
  | "Return Assets";

export type TrainingType = "Group" | "Individual";
export type TrainingMode = "Marksmanship" | "Simulation" | "CQB" | "Collective" | "Judgemental";

export interface Weapon {
  type: string;
  quantity: number;
}

export interface Booking {
  id: string;
  bookingId: string;
  program: string;
  trainingType: TrainingType;
  bookingTime: string;
  bookingDate: string;
  status: BookingStatus;
  trainingMode: TrainingMode;
  courseware: string;
  assignmentId: string;
  unitName: string;
  weapon: string;
  assetIssued: boolean;
  isMST?: boolean;
  isMSTTCT?: boolean;
  sectionType?: "Standalone" | "Group";
  assignedStations?: string[];
  trainees?: number;
  weaponList?: Weapon[];
  // Extended booking list fields
  weaponTypes?: string[];
  weaponCount?: number;
  briefingRoom?: string;
  baseStationQty?: number;
  cShapedStationQty?: number;
  assignedCShapedStations?: string[];
  traineesCount?: number;
  instructorName?: string;
  ftmsFileId?: number;
  // Additive fields for Booking 2.0's Booking Detail page — optional, so the
  // old booking module (which never reads them) is unaffected.
  createdOn?: string;
  /** Booking List 2.0's "Created by" column — name over role, like the tables
      elsewhere in the file. Optional, so the old booking module is unaffected. */
  createdBy?: string;
  createdByRole?: string;
  instructorPhone?: string;
  roles?: string[];
  dryRunTraining?: boolean;
  /** Issue Asset Step 1's per-courseware Base Station + schedule line (Figma
   *  `Table - Select Booking (Issue Asset)`, 5869:43219) — aligned by index to
   *  `courseware.split(",")`. Optional: falls back to `assignedStations[0]` /
   *  `bookingTime` when absent, since most bookings don't need per-courseware
   *  precision, only the ones actually shown in that table's samples. */
  coursewareDetails?: {
    baseStation: string;
    schedule: string;
    /** Booking Details 2.0, multiple courseware (Figma 5834:183285): the courseware's own
     *  Assignment ID once its assets are issued. Absent = "Not Issued". */
    assignmentId?: string;
  }[];
}

export interface BaseStation {
  name: string;
  bookings: number;
  statuses: BookingStatus[];
  activeLanes: string;
  assignments: number | string;
  details?: BookingDetail[];
}

export interface BookingDetail {
  id: string;
  program: string;
  bookingId: string;
  trainingType: TrainingType;
  bookingDate: string;
  bookingTime: string;
  assignmentId: string;
  status: BookingStatus;
  // legacy fields kept for compatibility
  unitName?: string;
  trainingMode?: string;
  courseware?: string;
  pax?: number;
}

export interface TrainingResult {
  id: string;
  program: string;
  bookingId: string;
  trainingType: TrainingType;
  bookingDate: string;
  trainingMode: TrainingMode;
  ftmsFileId: number;
  systemType?: "WPT" | "MST" | "MST TCT";
}

export interface AssetMovement {
  no: number;
  assignmentId: string;
  assetName: string;
  assetTagId: string;
  assetType: string;
  assetCategory: string;
  timePeriod: string;
  date: string;
}

// Today's Booking data
export const baseStations: BaseStation[] = [
  {
    name: "base by daniel",
    bookings: 0,
    statuses: [],
    activeLanes: "0/0",
    assignments: "-",
    details: [],
  },
  {
    name: "base by daniel 2",
    bookings: 0,
    statuses: [],
    activeLanes: "0/0",
    assignments: "-",
    details: [],
  },
  {
    name: "WPT-01",
    bookings: 1,
    statuses: ["Upcoming"],
    activeLanes: "10/10",
    assignments: "-",
    details: [
      {
        id: "1",
        program: "WPT Group Training For Unit 0002",
        bookingId: "#260423-PTC002",
        trainingType: "Group",
        bookingDate: "23 Apr 2026",
        bookingTime: "08:00 AM - 12:00 PM (AM Session)",
        assignmentId: "-",
        status: "Upcoming",
      },
    ],
  },
  {
    name: "WPT-02",
    bookings: 3,
    statuses: ["Upcoming", "Ongoing", "Overdue"],
    activeLanes: "9/10",
    assignments: 2,
    details: [],
  },
  {
    name: "WPT-03",
    bookings: 1,
    statuses: ["Completed"],
    activeLanes: "9/10",
    assignments: 1,
    details: [],
  },
  {
    name: "WPT-04",
    bookings: 0,
    statuses: [],
    activeLanes: "10/10",
    assignments: "-",
    details: [],
  },
  {
    name: "WPT-05",
    bookings: 0,
    statuses: [],
    activeLanes: "10/10",
    assignments: "-",
    details: [],
  },
];

// Booking List data
const bookingsSeed: Booking[] = [
  {
    id: "1",
    bookingId: "#260422-PTC009",
    program: "WPT Group Training for Unit 3SIR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n(22 Apr) 8:00 AM - (22 Apr) 9:00 AM (Ad-Hoc Schedule)",
    bookingDate: "22 Apr 2026",
    status: "Overdue",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP, Night Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "3SIR",
    weapon: "SAR21",
    assetIssued: false,
    assignedStations: ["WPT-04"],
    assignedCShapedStations: ["C-Shaped 04"],
    baseStationQty: 1,
    cShapedStationQty: 1,
  },
  {
    id: "2",
    bookingId: "#260422-PTC010",
    program: "WPT Group Training for Unit 3SIR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n(22 Apr) 9:00 AM - (22 Apr) 10:00 AM (Ad-Hoc Schedule)",
    bookingDate: "22 Apr 2026",
    status: "Overdue",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "3SIR",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "3",
    bookingId: "#260422-PTC005",
    program: "WPT Group Training for Unit Aldi 22 APR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "22 Apr 2026",
    status: "Completed",
    trainingMode: "Marksmanship",
    courseware: "Night Test For SAR21/M16 BTP, ATP (M)",
    assignmentId: "#260422-AT004",
    unitName: "Aldi 22 APR",
    weapon: "SAR21, LMG",
    assetIssued: false,
    assignedStations: ["WPT-02", "WPT-03"],
    assignedCShapedStations: ["C-Shaped 02"],
    baseStationQty: 2,
    cShapedStationQty: 1,
  },
  {
    id: "4",
    bookingId: "#260422-PTC008",
    program: "WPT Group Training for Unit 3SIR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n(22 Apr) 10:00 AM - (22 Apr) 11:00 AM (Ad-Hoc Schedule)",
    bookingDate: "22 Apr 2026",
    status: "Overdue",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "3SIR",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "5",
    bookingId: "#260422-PTC006",
    program: "WPT Group Training for Unit 3SIR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n(22 Apr) 8:00 AM - (22 Apr) 9:00 AM (Ad-Hoc Schedule)",
    bookingDate: "22 Apr 2026",
    status: "Overdue",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "3SIR",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "6",
    bookingId: "#260422-PTC004",
    program: "WPT Group Training for Unit SR1",
    trainingType: "Group",
    bookingTime: "22, 23 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "22, 23 Apr 2026",
    status: "Ongoing",
    trainingMode: "Marksmanship",
    courseware: "Night Test For SAR21/M16 BTP, ATP (M)",
    assignmentId: "#260422-AT003",
    unitName: "SR1",
    weapon: "SAR21",
    assetIssued: false,
    sectionType: "Standalone",
    assignedStations: ["WPT-01", "WPT-02", "WPT-04", "WPT-05"],
    assignedCShapedStations: ["C-Shaped 01", "C-Shaped 02"],
    baseStationQty: 4,
    cShapedStationQty: 2,
    trainees: 30,
    weaponList: [
      { type: "SAR21", quantity: 1 },
      { type: "SPIKE SR", quantity: 2 },
      { type: "GPMG", quantity: 1 },
      { type: "MATADOR", quantity: 2 },
      { type: "SPIKE LR", quantity: 1 },
    ],
  },
  {
    id: "7",
    bookingId: "#260428-PTC007",
    program: "WPT Group Training for Unit 3SIR",
    trainingType: "Group",
    bookingTime: "28 Apr 2026\n(28 Apr) 13:00 - 17:00 (PM Session)",
    bookingDate: "28 Apr 2026",
    status: "Upcoming",
    trainingMode: "Marksmanship",
    // Sample: multi-courseware (3) + multi-base-station (3 C-Shaped + 3 Flat Screen)
    // booking — mirrors PRD Case 4 (Collective, station config replicated per courseware).
    courseware: "Day Test For SAR21/M16 BTP, Night Test For SAR21/M16 BTP, ATP (M)",
    assignmentId: "#260428-AT001",
    unitName: "3SIR",
    weapon: "SAR21",
    assetIssued: true,
    sectionType: "Standalone",
    assignedStations: ["WPT-01", "WPT-02", "WPT-03"],
    assignedCShapedStations: ["C-Shaped 01", "C-Shaped 02", "C-Shaped 03"],
    coursewareDetails: [
      { baseStation: "WPT-01", schedule: "28 Apr 2026 · AM Session (08:00 AM - 12:00 PM)", assignmentId: "#260428-AT001" },
      { baseStation: "WPT-02", schedule: "28 Apr 2026 · PM Session (01:00 PM - 05:00 PM)", assignmentId: "#260428-AT002" },
      { baseStation: "WPT-03", schedule: "28 Apr 2026 · Ad-hoc (09:00 AM - 11:00 AM)" },
    ],
    trainees: 30,
    weaponList: [
      { type: "SAR21", quantity: 1 },
      { type: "SPIKE SR", quantity: 2 },
      { type: "GPMG", quantity: 1 },
      { type: "MATADOR", quantity: 2 },
      { type: "SPIKE LR", quantity: 1 },
    ],
    weaponTypes: ["SAR21", "SPIKE SR", "GPMG", "MATADOR", "SPIKE LR"],
    weaponCount: 5,
    briefingRoom: "Briefing Room 2",
    baseStationQty: 3,
    cShapedStationQty: 3,
    traineesCount: 30,
    instructorName: "Marcus Tan",
    ftmsFileId: 260428,
  },
  {
    id: "8",
    bookingId: "#260422-PTC003",
    program: "WPT Group Training for Unit t",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "22 Apr 2026",
    status: "Completed",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT002",
    unitName: "Unit t",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "9",
    bookingId: "#260422-PTC002",
    program: "WPT Group Training for Unit 22 APR",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "22 Apr 2026",
    status: "Overdue",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "22 APR",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "10",
    bookingId: "#260422-PTC001",
    program: "WPT Group Training for Unit t",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "22 Apr 2026",
    status: "Completed",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT001",
    unitName: "Unit t",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "11",
    bookingId: "#260423-PTC001",
    program: "WPT Group Training for Unit Alpha",
    trainingType: "Group",
    bookingTime: "23 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "23 Apr 2026",
    status: "Upcoming",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "Alpha",
    weapon: "SAR21",
    assetIssued: false,
  },
  {
    id: "12",
    bookingId: "#260423-PTC002",
    program: "WPT Group Training for Unit Bravo",
    trainingType: "Group",
    bookingTime: "23 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "23 Apr 2026",
    status: "Upcoming",
    trainingMode: "Marksmanship",
    courseware: "Night Test For SAR21/M16 BTP",
    assignmentId: "#260423-AT002",
    unitName: "Bravo",
    weapon: "LMG",
    assetIssued: true,
  },
  {
    id: "13",
    bookingId: "#260423-PTC003",
    program: "WPT Group Training for Unit Charlie",
    trainingType: "Group",
    bookingTime: "23 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "23 Apr 2026",
    status: "Cancelled",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP, Night Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "Charlie",
    weapon: "SAR21",
    assetIssued: false,
    assignedStations: ["WPT-05"],
    baseStationQty: 1,
  },
  {
    id: "14",
    bookingId: "#260422-PTC011",
    program: "WPT Group Training for Unit Delta",
    trainingType: "Group",
    bookingTime: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "22 Apr 2026",
    status: "Return Assets",
    trainingMode: "Marksmanship",
    courseware: "Night Test For SAR21/M16 BTP, Day Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT005",
    unitName: "Delta",
    weapon: "LMG",
    assetIssued: false,
    assignedStations: ["WPT-03"],
    assignedCShapedStations: ["C-Shaped 03"],
    baseStationQty: 1,
    cShapedStationQty: 1,
  },
  {
    id: "15",
    bookingId: "#280426-PTC015",
    program: "WPT Group Training for Unit Bravo Team",
    trainingType: "Group",
    bookingTime: "28 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "28 Apr 2026",
    status: "Ongoing",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "#260422-AT004",
    unitName: "Bravo",
    weapon: "SAR21",
    assetIssued: true,
  },
  {
    id: "16",
    bookingId: "#290426-PTC016",
    program: "WPT Group Training for Unit Charlie Squad",
    trainingType: "Group",
    bookingTime: "29 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    bookingDate: "29 Apr 2026",
    status: "Ongoing",
    trainingMode: "Marksmanship",
    courseware: "Advanced SAR21 Training Module",
    assignmentId: "#260422-AT006",
    unitName: "Charlie",
    weapon: "GPMG",
    assetIssued: false,
  },
  {
    id: "17",
    bookingId: "#260602-PTC001",
    program: "WPT Group Training for Unit SR1",
    trainingType: "Group",
    bookingTime: "02 Jun 2026\n08:00 AM - 12:00 PM (AM Session)",
    bookingDate: "02 Jun 2026",
    status: "Upcoming",
    trainingMode: "Marksmanship",
    courseware: "Day Test For SAR21/M16 BTP",
    assignmentId: "-",
    unitName: "SR1",
    weapon: "M16",
    assetIssued: false,
    weaponTypes: ["M16"],
    weaponCount: 1,
    briefingRoom: "Briefing Room 1",
    baseStationQty: 1,
    traineesCount: 1,
    instructorName: "Eileen",
    ftmsFileId: 1,
  },
  {
    id: "18",
    bookingId: "#260428-PTC008",
    program: "Collective Group Training for Unit SR1",
    trainingType: "Group",
    bookingTime: "28 Apr 2026\n(28 Apr) 13:00 - 17:00 (PM Session)",
    bookingDate: "28 Apr 2026",
    status: "Upcoming",
    trainingMode: "Collective",
    courseware: "Component Type Training A",
    assignmentId: "-",
    unitName: "SR1",
    weapon: "SAR21",
    assetIssued: false,
    sectionType: "Standalone",
    assignedStations: ["WPT-01"],
    assignedCShapedStations: ["C-Shaped 01"],
    // SAR21 qty deliberately below the demo's 3 scanned SAR21 units (Issue Assets
    // DUMMY_SCANNED_ASSETS) — this booking is used to demo the Assets to Withdraw
    // panel's over-scanned state out of the box.
    weaponList: [
      { type: "SAR21", quantity: 2 },
      { type: "GPMG", quantity: 1 },
      { type: "MATADOR", quantity: 2 },
      { type: "SPIKE SR", quantity: 2 },
    ],
    weaponTypes: ["SAR21", "GPMG", "MATADOR", "SPIKE SR"],
    weaponCount: 4,
    briefingRoom: "Briefing Room 1",
    baseStationQty: 1,
    cShapedStationQty: 1,
    traineesCount: 15,
    instructorName: "Marcus Tan",
    ftmsFileId: 5,
    createdOn: "5 Nov 2025",
    instructorPhone: "+1 91234567",
    roles: ["F.O/OC", "GPMG Team (STEELNET)", "M110 Team (SNIPERS)", "MATADOR"],
    dryRunTraining: true,
  },
  // Booking List 2.0 calendar (Figma `Booking List - Calendar - Daniel`,
  // 7602:81034) draws two schedule types nothing else here had: a Group
  // Ad-hoc that runs across several days (one bar spanning the days) and a
  // Full Day booking (in the Week/Day all-day strip).
  {
    id: "19",
    bookingId: "#260422-PTC020",
    program: "Judgemental Training for Unit Omega",
    trainingType: "Group",
    bookingTime: "22 - 24 Apr 2026\n(22 Apr) 08:00 AM - (24 Apr) 05:00 PM (Ad-Hoc Schedule)",
    bookingDate: "22, 23, 24 Apr 2026",
    status: "Ongoing",
    trainingMode: "Judgemental",
    courseware: "Judgemental Shooting A",
    assignmentId: "#260422-AT020",
    unitName: "Omega",
    weapon: "SAR21",
    assetIssued: true,
    assignedStations: ["WPT-04"],
    baseStationQty: 1,
  },
  {
    id: "20",
    bookingId: "#260423-PTC021",
    program: "Collective Training for Unit Beta",
    trainingType: "Group",
    bookingTime: "23 Apr 2026\n08:00 AM - 05:00 PM (Full Day)",
    bookingDate: "23 Apr 2026",
    status: "Upcoming",
    trainingMode: "Collective",
    courseware: "Component Type Training A",
    assignmentId: "-",
    unitName: "Beta",
    weapon: "SAR21",
    assetIssued: false,
    assignedStations: ["WPT-05"],
    baseStationQty: 1,
  },
];

/*
 * Booking List 2.0 shows "Created at" and "Created by". Only one seed record
 * carried `createdOn` and none carried the author, so the two columns would
 * have been a wall of em dashes. Filled in here rather than by hand on 25
 * records: the stamp is derived from the booking's own id so it is stable
 * across reloads, and the author cycles through the three roles the rest of the
 * mock data already uses.
 */
const CREATORS: { name: string; role: string }[] = [
  { name: "Olivia Carter", role: "System Admin" },
  { name: "Daren Ong", role: "Instructor" },
  { name: "Eilleen Tan", role: "Operator" },
];

export const bookings: Booking[] = bookingsSeed.map((b, i) => {
  if (b.createdOn && b.createdBy) return b;
  const creator = CREATORS[i % CREATORS.length];
  const day = ((i * 3) % 27) + 1;
  const stamp = new Date(2025, 9, day);
  return {
    ...b,
    createdOn:
      b.createdOn ??
      `${stamp.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}\n${
        String(8 + (i % 9)).padStart(2, "0")
      }:${String((i * 7) % 60).padStart(2, "0")} AM`,
    createdBy: b.createdBy ?? creator.name,
    createdByRole: b.createdByRole ?? creator.role,
  };
});

// Training Results
export const trainingResults: TrainingResult[] = [
  {
    id: "1",
    program: "WPT Group Training for Unit Aldi 22 APR",
    bookingId: "#260422-PTC005",
    trainingType: "Group",
    bookingDate: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    trainingMode: "Marksmanship",
    ftmsFileId: 1,
    systemType: "WPT",
  },
  {
    id: "2",
    program: "WPT Group Training for Unit SR1",
    bookingId: "#260422-PTC004",
    trainingType: "Group",
    // Figma's Multiple Courseware row (Training Results List, 5029:101327):
    // date + full time range on one line, "Multiple Courseware" — not a
    // session label — on the second, styled as a link, not a caption.
    bookingDate: "22, 23 Apr 2026 01:00 PM - 05:00 PM\nMultiple Courseware",
    trainingMode: "Marksmanship",
    ftmsFileId: 1,
    systemType: "WPT",
  },
  {
    id: "3",
    program: "WPT Group Training for Unit 3SIR",
    bookingId: "#260422-PTC001",
    trainingType: "Group",
    bookingDate: "22 Apr 2026\n01:00 PM - 05:00 PM (PM Session)",
    trainingMode: "Marksmanship",
    ftmsFileId: 1,
    systemType: "WPT",
  },
  {
    id: "4",
    program: "MST Group Training for Unit 10",
    bookingId: "#260425-MST001",
    trainingType: "Group",
    bookingDate: "25 Apr 2026\n12:00 PM - 05:00 PM (PM Session)",
    trainingMode: "Collective",
    ftmsFileId: 2,
    systemType: "MST",
  },
  {
    id: "5",
    program: "MST Group Training for Unit 22",
    bookingId: "#260428-MST002",
    trainingType: "Group",
    bookingDate: "28 Apr 2026\n08:00 AM - 12:00 PM (AM Session)",
    trainingMode: "Collective",
    ftmsFileId: 3,
    systemType: "MST",
  },
  {
    id: "6",
    program: "MST TCT Training for Unit 7 Arty",
    bookingId: "#260502-TCT001",
    trainingType: "Group",
    bookingDate: "02 May 2026\n08:00 AM - 05:00 PM (Full Day)",
    trainingMode: "Collective",
    ftmsFileId: 4,
    systemType: "MST TCT",
  },
];

// Asset Movement
export const assetMovements: AssetMovement[] = [
  {
    no: 1,
    assignmentId: "260422-AT001",
    assetName: "SAR21 (C)",
    assetTagId: "250101-SAR21003",
    assetType: "SAR21",
    assetCategory: "Weapon",
    timePeriod: "11:08:42 AM",
    date: "22 Apr 2026",
  },
  {
    no: 2,
    assignmentId: "260422-AT002",
    assetName: "LMG (B)",
    assetTagId: "250101-LMG002",
    assetType: "LMG",
    assetCategory: "Weapon",
    timePeriod: "11:14:38 AM",
    date: "22 Apr 2026",
  },
  {
    no: 3,
    assignmentId: "260422-AT003",
    assetName: "Asset by Daniel",
    assetTagId: "260422-LEL001",
    assetType: "Lenovo Laptop",
    assetCategory: "Laptop Computer Device",
    timePeriod: "11:46:06 AM",
    date: "22 Apr 2026",
  },
  {
    no: 4,
    assignmentId: "260422-AT004",
    assetName: "LMG (E)",
    assetTagId: "250101-LMG005",
    assetType: "LMG",
    assetCategory: "Weapon",
    timePeriod: "01:04:01 PM",
    date: "22 Apr 2026",
  },
  {
    no: 5,
    assignmentId: "260422-AT002",
    assetName: "LMG (B)",
    assetTagId: "250101-LMG002",
    assetType: "LMG",
    assetCategory: "Weapon",
    timePeriod: "02:25:45 PM",
    date: "22 Apr 2026",
  },
  {
    no: 6,
    assignmentId: "260422-AT005",
    assetName: "Lenovo Legion 5 (A)",
    assetTagId: "250101-LEL001",
    assetType: "Lenovo Laptop",
    assetCategory: "Laptop Computer Device",
    timePeriod: "02:35:48 PM",
    date: "22 Apr 2026",
  },
  {
    no: 7,
    assignmentId: "260422-AT006",
    assetName: "Lenovo Legion 5 (A)",
    assetTagId: "250101-LEL001",
    assetType: "Lenovo Laptop",
    assetCategory: "Laptop Computer Device",
    timePeriod: "03:23:45 PM",
    date: "22 Apr 2026",
  },
  {
    no: 8,
    assignmentId: "260422-AT005",
    assetName: "Lenovo Legion 5 (A)",
    assetTagId: "250101-LEL001",
    assetType: "Lenovo Laptop",
    assetCategory: "Laptop Computer Device",
    timePeriod: "03:23:45 PM",
    date: "22 Apr 2026",
  },
  {
    no: 9,
    assignmentId: "260422-AT007",
    assetName: "SAR21 (A)",
    assetTagId: "250101-SAR21001",
    assetType: "SAR21",
    assetCategory: "Weapon",
    timePeriod: "04:15:22 PM",
    date: "22 Apr 2026",
  },
  {
    no: 10,
    assignmentId: "260422-AT008",
    assetName: "LMG (C)",
    assetTagId: "250101-LMG003",
    assetType: "LMG",
    assetCategory: "Weapon",
    timePeriod: "04:45:10 PM",
    date: "22 Apr 2026",
  },
];

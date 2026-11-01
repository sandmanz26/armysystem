import type { BaseStation, TodayAssignment, TodayTab } from "./types";

/*
 * Section header copy is Figma's, word for word — each tab explains how its
 * own number is counted, which is the point of the wording.
 */
export const TAB_META: Record<TodayTab, { title: string; subtitle: string }> = {
  "Total Bookings": {
    title: "Total Bookings",
    subtitle:
      "Total distinct bookings today, regardless of how many stations or courseware sessions each one covers.",
  },
  "Group Bookings": {
    title: "Group Bookings",
    subtitle: "Bookings booked under Training Type: Group.",
  },
  "Individual Bookings": {
    title: "Individual Bookings",
    subtitle: "Bookings booked under Training Type: Individual.",
  },
  "Bookings by Station": {
    title: "Bookings by Station",
    subtitle:
      "Counts each booking once for every base station it uses. A booking using multiple base stations is counted at each station.",
  },
  "Issued Assignments": {
    title: "Issued Assignments",
    subtitle: "Assignments issued today across all bookings.",
  },
};

// Figma `Table - Today's Booking - Assignment` (6315:38290) sample rows,
// reproduced as-is — including the two statuses ("Ownership Transferred",
// "Ownership Received") this page hadn't shown before.
export const TODAY_ASSIGNMENTS: TodayAssignment[] = [
  {
    id: "a1",
    assignmentId: "#ASG-2026-0549",
    assignmentType: "Booking",
    bookingName: "Marksmanship Training for Unit SR1",
    bookingId: "#251104-WPT020",
    coursewareCount: 1,
    status: "Ownership Transferred",
    baseStations: ["WPT-01"],
    assetQty: 20,
    issuedDate: "6 Jun 2026\n11:09 PM",
  },
  {
    id: "a2",
    assignmentId: "#ASG-2026-0550",
    assignmentType: "Booking",
    bookingName: "Collective Training for Unit 41SAB",
    bookingId: "#251104-WPT013",
    coursewareCount: 1,
    status: "Issued",
    baseStations: ["WPT-02"],
    assetQty: 20,
    issuedDate: "3 Jun 2026\n08:00 PM",
  },
  {
    id: "a3",
    assignmentId: "#ASG-2026-0551",
    assignmentType: "Booking",
    bookingName: "Marksmanship Training for Unit SR1",
    bookingId: "#251104-WPT020",
    coursewareCount: 1,
    status: "Ownership Received",
    baseStations: ["WPT-02"],
    assetQty: 12,
    issuedDate: "2 Jun 2026\n07:15 AM",
  },
  {
    id: "a4",
    assignmentId: "#ASG-2026-0552",
    assignmentType: "Booking",
    bookingName: "Individual Training for Jasmine Rice",
    bookingId: "#251014-WPT012",
    coursewareCount: 1,
    status: "Issued",
    baseStations: ["WPT-03"],
    assetQty: 8,
    issuedDate: "1 Jun 2026\n09:30 AM",
  },
];

// Figma `Table - Today's Booking - Bookings by Station` (6214:246975) sample
// data, reproduced as-is: each station's rows, the "also at" cross-station
// note, and the status mix (Completed/Upcoming/Ongoing/Overdue) that
// exercises every accent-bar colour.
export const BASE_STATIONS: BaseStation[] = [
  {
    name: "WPT-01",
    activeLanes: "10/15",
    bookings: [
      {
        program: "Marksmanship Training for Unit SR1",
        bookingId: "#251104-WPT020",
        bookingRef: "18",
        alsoAt: ["WPT-02", "WPT-03"],
        timeRange: "08:00 AM - 12:00 PM",
        session: "AM Session",
        status: "Completed",
        assignmentId: "#ASG-2026-0549",
      },
      {
        program: "Marksmanship Training for Unit SR1",
        bookingId: "#251104-WPT020",
        bookingRef: "18",
        alsoAt: ["WPT-02", "WPT-03"],
        timeRange: "01:00 PM – 05:00 PM",
        session: "PM Session",
        status: "Upcoming",
      },
    ],
  },
  {
    name: "WPT-02",
    activeLanes: "10/15",
    bookings: [
      {
        program: "Marksmanship Training for Unit SR1",
        bookingId: "#251104-WPT020",
        bookingRef: "18",
        alsoAt: ["WPT-01", "WPT-03"],
        timeRange: "08:00 AM - 12:00 PM",
        session: "AM Session",
        status: "Ongoing",
        assignmentId: "#ASG-2026-0551",
      },
      {
        program: "Collective Training for Unit 42SAR",
        bookingId: "#251104-WPT014",
        bookingRef: "7",
        timeRange: "01:00 PM – 05:00 PM",
        session: "PM Session",
        status: "Upcoming",
      },
    ],
  },
  {
    name: "WPT-03",
    activeLanes: "12/15",
    bookings: [
      {
        program: "Marksmanship Training for Unit SR1",
        bookingId: "#251104-WPT020",
        bookingRef: "18",
        alsoAt: ["WPT-01", "WPT-02"],
        timeRange: "08:00 AM - 12:00 PM",
        session: "AM Session",
        status: "Overdue",
      },
      {
        program: "Individual Training for Jasmine Rice",
        bookingId: "#251014-WPT012",
        bookingRef: "7",
        timeRange: "01:00 PM – 05:00 PM",
        session: "PM Session",
        status: "Upcoming",
        assignmentId: "#ASG-2026-0552",
      },
      {
        program: "Individual Training for Jessica Cho",
        bookingId: "#251014-WPT011",
        bookingRef: "7",
        timeRange: "01:00 PM – 05:00 PM",
        session: "PM Session",
        status: "Upcoming",
        assignmentId: "#ASG-2026-0552",
      },
    ],
  },
  {
    name: "WPT-04",
    activeLanes: "12/15",
    bookings: [
      {
        program: "Collective Training for Unit 41SAB",
        bookingId: "#251104-WPT013",
        bookingRef: "18",
        timeRange: "08:00 AM - 05:00 PM",
        session: "Full Day",
        status: "Ongoing",
        assignmentId: "#ASG-2026-0550",
      },
    ],
  },
  {
    name: "WPT-05",
    activeLanes: "12/15",
    bookings: [],
  },
];

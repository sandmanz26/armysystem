import type { Courseware, Segment, Tab, Trainee, TrainingDetailData } from "./types";

export const TABS: readonly Tab[] = [
  "Training Performance",
  "Nominal Roll",
  "Detail List",
  "Leaderboard",
];

export const NOMINAL_ROLL_PER_PAGE = 10;
export const LEADERBOARD_PER_PAGE = 10;
export const TRAINEE_RESULT_PER_PAGE = 10;

const NAMES = [
  "Charlotte Hall", "Fatimah Osman", "Aisha binti Abdul Rahim", "Ibrahim Abdul Halim",
  "Rizwan binti Mohamad Sulaiman", "Siti Ismail", "Olivia Thompson", "Sophia Davis",
  "Elijah Lewis", "Mason Rodriguez", "Ava Martinez", "Lucas Anderson", "Emma Taylor",
  "Benjamin White", "Harper Brown", "Michael Davis", "Amelia Garcia", "Daniel Miller",
  "Evelyn Davis", "James Rodriguez", "Abigail Martinez", "Matthew Anderson", "Mia Taylor",
  "David White", "Emily Brown", "Joseph Garcia", "Scarlett Miller", "Samuel Davis",
  "Chloe Rodriguez", "Alexander Martinez",
];

/** Result mix differs per courseware so switching the selector visibly changes the chart. */
function segmentsOf(marksman: number, passed: number, failed: number): Segment[] {
  const total = marksman + passed + failed;
  return [
    { label: "MARKSMAN", pct: marksman / total, count: marksman, color: "#4F46E5", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
    { label: "PASSED",   pct: passed / total,   count: passed,   color: "#16A34A", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100" },
    { label: "FAILED",   pct: failed / total,   count: failed,   color: "#DC2626", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100" },
  ];
}

function traineesOf(count: number, seed: number): Trainee[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + seed;
    return {
      no: i + 1,
      rank: n % 3 === 0 ? "3SG" : "REC",
      name: NAMES[(i + seed) % NAMES.length],
      svcId: `****${String(i + 1).padStart(3, "0")}${String.fromCharCode(65 + (n % 26))}`,
      weapon: n % 4 === 0 ? "M16" : "SAR21",
      station: String((i % 3) + 1),
      detail: "2",
      // Lane pools are deliberately non-contiguous per station, so Detail List's
      // "Lane 1, 2, 3 & 8"-style summary has something real to collapse.
      lane: (() => {
        const pool = [[1, 2, 3, 8], [4, 5, 6], [7, 9, 10]][Math.floor(i / 10) % 3];
        return `Lane ${pool[i % pool.length]}`;
      })(),
      performance: `${20 - (n % 6)} / 20`,
      courseResults: `${20 - (n % 6)} / 20`,
      resultLabel: n % 5 === 0 ? "MARKSMAN" : n % 5 === 4 ? "FAILED" : "PASSED",
      mpi: 1 + (n % 5),
    };
  });
}

/**
 * Figma's Multiple-CW detail (5839:44906) shows "Courseware 1 of 3" and a
 * dropdown listing three coursewares, each with its own booking window. The
 * page under the selector is scoped to whichever is active.
 */
const COURSEWARES: Courseware[] = [
  {
    id: "cw-a",
    name: "Component Type Training A",
    bookingDate: "10 Nov 2025",
    bookingSession: "AM Session (08:00 AM - 12:00 PM)",
    sessionTime: "10 Nov 2025 08:01 AM  - 10 Nov 2025 11:31 AM",
    totalDuration: "3h 30m 56s",
    status: "Completed",
    totalTrainees: 30,
    segments: segmentsOf(6, 18, 6),
    trainees: traineesOf(30, 0),
    details: [
      { id: "WPT-01", traineesCount: 10, weapon: "SAR21", lane: "Lane 1 – 3", avgScore: "17 / 20" },
      { id: "WPT-02", traineesCount: 10, weapon: "SAR21", lane: "Lane 4 – 6", avgScore: "16 / 20" },
      { id: "WPT-03", traineesCount: 10, weapon: "M16",   lane: "Lane 7 – 9", avgScore: "15 / 20" },
    ],
  },
  {
    id: "cw-b",
    name: "Component Type Training B",
    bookingDate: "10 Nov 2025",
    bookingSession: "PM Session (12:00 PM - 05:00 PM)",
    sessionTime: "10 Nov 2025 01:04 PM  - 10 Nov 2025 04:12 PM",
    totalDuration: "3h 08m 12s",
    status: "Completed",
    totalTrainees: 24,
    segments: segmentsOf(4, 16, 4),
    trainees: traineesOf(24, 7),
    details: [
      { id: "WPT-01", traineesCount: 12, weapon: "SAR21", lane: "Lane 1 – 4", avgScore: "16 / 20" },
      { id: "WPT-04", traineesCount: 12, weapon: "M16",   lane: "Lane 5 – 8", avgScore: "14 / 20" },
    ],
  },
  {
    id: "cw-c",
    name: "Component Type Training C",
    bookingDate: "12 Nov 2025 08:00 AM - 13 Nov 2025 04:00 PM",
    bookingSession: "Ad-hoc",
    sessionTime: "12 Nov 2025 08:06 AM  - 13 Nov 2025 03:48 PM",
    totalDuration: "1d 7h 42m 03s",
    status: "Completed",
    totalTrainees: 18,
    segments: segmentsOf(2, 11, 5),
    trainees: traineesOf(18, 13),
    details: [
      { id: "WPT-05", traineesCount: 9, weapon: "SAR21", lane: "Lane 1 – 3", avgScore: "15 / 20" },
      { id: "WPT-06", traineesCount: 9, weapon: "M16",   lane: "Lane 4 – 6", avgScore: "13 / 20" },
    ],
  },
  // Figma 8171:143270 — a courseware whose session has not been completed yet: no results to show.
  {
    id: "cw-d",
    name: "Component Type Training D",
    bookingDate: "14 Nov 2025",
    bookingSession: "PM Session (01:00 PM - 05:00 PM)",
    sessionTime: "—",
    totalDuration: "—",
    status: "Not available yet",
    totalTrainees: 0,
    segments: [],
    trainees: [],
    details: [],
  },
];

export const DETAIL: TrainingDetailData = {
  program: "Collective Training for Unit Beta",
  bookingId: "#251104-WPT015",
  createdOn: "04 Nov 2025",
  session: "10 Nov 2025 08:00 AM - 12:00 PM (AM Session)",
  coursewares: COURSEWARES,
};

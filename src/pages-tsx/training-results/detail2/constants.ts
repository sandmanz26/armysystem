import type { Tab, TrainingDetailData } from "./types";

export const TABS: readonly Tab[] = [
  "Training Performance",
  "Nominal Roll",
  "Detail List",
  "Leaderboard",
];

export const CW_OPTIONS: string[] = [
  "Night Test for SAR21/M16 BTP",
  "Day Test for SAR21/M16 BTP",
];

export const NOMINAL_ROLL_PER_PAGE = 10;
export const LEADERBOARD_PER_PAGE = 10;
export const TRAINEE_RESULT_PER_PAGE = 10;

export const DETAIL: TrainingDetailData = {
  program: "WPT Group Training For Unit 3SIR",
  bookingId: "#260427-PTC006",
  createdOn: "27 Apr 2026",
  session: "27 Apr 2026 01:00 PM - 05:00 PM (PM Session)",
  courseware: "Day Test for SAR21/M16 BTP",
  startTime: "27 Apr 2026 - 14:39 PM",
  endTime: "27 Apr 2026 - 14:47 PM",
  duration: "8m 16s",
  totalTrainees: 30,
  segments: [
    { label: "MARKSMAN", pct: 0.2, count: 6,  color: "#4F46E5", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
    { label: "PASSED",   pct: 0.6, count: 18, color: "#16A34A", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100" },
    { label: "FAILED",   pct: 0.2, count: 6,  color: "#DC2626", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-100" },
  ],
  trainees: Array.from({ length: 30 }, (_, i) => ({
    no: i + 1,
    rank: i % 3 === 0 ? "3SG" : "REC",
    name: [
      "Charlotte Hall", "Fatimah Osman", "Aisha binti Abdul Rahim", "Ibrahim Abdul Halim",
      "Rizwan binti Mohamad Sulaiman", "Siti Ismail", "Olivia Thompson", "Sophia Davis",
      "Elijah Lewis", "Mason Rodriguez", "Ava Martinez", "Lucas Anderson", "Emma Taylor",
      "Benjamin White", "Harper Brown", "Michael Davis", "Amelia Garcia", "Daniel Miller",
      "Evelyn Davis", "James Rodriguez", "Abigail Martinez", "Matthew Anderson", "Mia Taylor",
      "David White", "Emily Brown", "Joseph Garcia", "Scarlett Miller", "Samuel Davis",
      "Chloe Rodriguez", "Alexander Martinez"
    ][i],
    svcId: `****${String(i + 1).padStart(3, "0")}${String.fromCharCode(65 + (i % 26))}`,
    weapon: "SAR21",
    station: "2",
    detail: "2",
    // Lane assignments aren't contiguous per station in real bookings — each
    // station below cycles through its own irregular lane pool so the Detail
    // List tab's "Lane 1, 2, 3 & 8"-style summary reflects that.
    lane: (() => {
      const pool = [[1, 2, 3, 8], [4, 5, 6], [7, 9, 10]][Math.floor(i / 10)];
      return `Lane ${pool[i % pool.length]}`;
    })(),
    performance: `${20 - (i % 6)} / 20`,
    courseResults: `${20 - (i % 6)} / 20`,
    resultLabel: i % 5 === 0 ? "MARKSMAN" : i % 5 === 4 ? "FAILED" : "PASSED",
    mpi: (1 + (i % 5)),
  })),
  details: [
    { id: "WPT-01", traineesCount: 10, weapon: "SAR21", lane: "Lane 1 – 3", avgScore: "17 / 20" },
    { id: "WPT-02", traineesCount: 10, weapon: "SAR21", lane: "Lane 4 – 6", avgScore: "16 / 20" },
    { id: "WPT-03", traineesCount: 10, weapon: "M16",   lane: "Lane 7 – 9", avgScore: "15 / 20" },
  ],
};

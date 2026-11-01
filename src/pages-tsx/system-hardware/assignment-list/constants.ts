import type { BookingDetail } from "./types";

export const PER_PAGE = 10;

/**
 * Figma shows every assignment ID as "#ASG-2026-0142" — "#", prefix ASG, year,
 * 4-digit sequence. The mock stores it without the "#" so it can travel in a
 * URL query (`?assignmentId=ASG-2026-0142`) without being read as a fragment.
 */
export function formatAssignmentId(assignmentId: string): string {
  return assignmentId.startsWith("#") ? assignmentId : `#${assignmentId}`;
}

/** Search box match — accepts the query with or without the leading "#". */
export function matchesAssignmentId(assignmentId: string, query: string): boolean {
  const q = query.trim().toLowerCase().replace(/^#/, "");
  return !q || assignmentId.toLowerCase().includes(q);
}

export const BOOKING_DETAILS: Record<string, BookingDetail> = {
  "BK-2026-001": {
    program: "WPT Group Training for Unit SR1",
    bookingId: "#260422-PTC004",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "22 Apr 2026\n(22 Apr) 8:00 AM – (22 Apr) 12:00 PM (AM Session)",
    status: "Ongoing",
    trainees: 30,
    coursewareCount: 1,
  },
  "BK-2026-002": {
    program: "WPT Group Training for Unit 0002",
    bookingId: "#260423-PTC002",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "23 Apr 2026\n(23 Apr) 8:00 AM – (23 Apr) 12:00 PM (AM Session)",
    status: "Upcoming",
    trainees: 25,
    coursewareCount: 1,
  },
  "BK-2026-003": {
    program: "WPT Group Training for Unit Bravo",
    bookingId: "#260422-PTC006",
    trainingType: "Group",
    trainingMode: "Field Exercise",
    bookingTime: "22 Apr 2026\n(22 Apr) 1:00 PM – (22 Apr) 5:00 PM (PM Session)",
    status: "Upcoming",
    trainees: 18,
    coursewareCount: 1,
  },
  "BK-2026-004": {
    program: "WPT Group Training for Unit Charlie",
    bookingId: "#260422-PTC007",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "22 Apr 2026\n(22 Apr) 9:00 AM – (22 Apr) 11:00 AM (Ad-Hoc Schedule)",
    status: "Pending Return",
    trainees: 12,
    coursewareCount: 1,
  },
  "BK-2026-005": {
    program: "WPT Group Training for Unit Delta",
    bookingId: "#260423-PTC003",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "23 Apr 2026\n(23 Apr) 8:00 AM – (23 Apr) 10:00 AM (Ad-Hoc Schedule)",
    status: "Completed",
    trainees: 20,
    coursewareCount: 1,
  },
  "BK-2026-006": {
    program: "WPT Group Training for Unit Echo",
    bookingId: "#260423-PTC004",
    trainingType: "Group",
    trainingMode: "Field Exercise",
    bookingTime: "23 Apr 2026\n(23 Apr) 1:00 PM – (23 Apr) 5:00 PM (PM Session)",
    status: "Completed",
    trainees: 22,
    coursewareCount: 1,
  },
  "BK-2026-007": {
    program: "WPT Group Training for Unit Foxtrot",
    bookingId: "#260424-PTC001",
    trainingType: "Group",
    trainingMode: "Field Exercise",
    bookingTime: "24 Apr 2026\n(24 Apr) 8:00 AM – (24 Apr) 12:00 PM (AM Session)",
    status: "Completed",
    trainees: 15,
    coursewareCount: 1,
  },
  "BK-2026-008": {
    program: "WPT Group Training for Unit Golf",
    bookingId: "#260425-PTC001",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "25 Apr 2026\n(25 Apr) 8:00 AM – (25 Apr) 12:00 PM (AM Session)",
    status: "Ongoing",
    trainees: 28,
    coursewareCount: 1,
  },
  "BK-2026-009": {
    program: "WPT Group Training for Unit Hotel",
    bookingId: "#260426-PTC001",
    trainingType: "Group",
    trainingMode: "Marksmanship",
    bookingTime: "26 Apr 2026\n(26 Apr) 8:00 AM – (26 Apr) 10:00 AM (Ad-Hoc Schedule)",
    status: "Completed",
    trainees: 10,
    coursewareCount: 1,
  },
};

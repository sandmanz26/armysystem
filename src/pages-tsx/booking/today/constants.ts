import type { BaseStation, SummaryCard } from "./types";

export const SUMMARY_CARDS: SummaryCard[] = [
  {
    label: "Total Booking(s)",
    value: 7,
    unit: "Booking(s)",
    color: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Group Bookings (Group)",
    value: 7,
    unit: "Booking(s)",
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Individual Booking(s)",
    value: 0,
    unit: "Booking(s)",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Assignments (Issued)",
    value: 3,
    unit: "Assignment(s)",
    color: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export const BASE_STATIONS: BaseStation[] = [
  {
    name: "WPT-01",
    bookings: 2,
    statuses: ["Upcoming"],
    activeLanes: "10/10",
    assignments: 1,
    details: [
      {
        id: "1",
        program: "WPT Group Training for Unit SR1",
        bookingId: "#260602-PTC001",
        trainingType: "Group",
        bookingDate: "02 Jun 2026",
        bookingTime: "08:00 AM - 12:00 PM (AM Session)",
        assignmentId: "-",
        status: "Upcoming",
      },
      {
        id: "2",
        program: "WPT Group Training for Unit Alpha",
        bookingId: "#260602-PTC002",
        trainingType: "Group",
        bookingDate: "02 Jun 2026",
        bookingTime: "01:00 PM - 05:00 PM (PM Session)",
        assignmentId: "-",
        status: "Upcoming",
      },
    ],
  },
  {
    name: "WPT-02",
    bookings: 0,
    statuses: [],
    activeLanes: "0/10",
    assignments: "-",
    details: [],
  },
  {
    name: "WPT-03",
    bookings: 0,
    statuses: [],
    activeLanes: "10/10",
    assignments: "-",
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

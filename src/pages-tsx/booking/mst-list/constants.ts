import type { TabType } from "./types";

export const tabs: TabType[] = [
  "Overall",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
  "Overdue",
];

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const DAY_ABBREVS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const PER_PAGE = 10;

export const TODAY = new Date(2026, 3, 23);

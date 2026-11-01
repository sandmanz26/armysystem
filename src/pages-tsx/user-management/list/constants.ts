import type { TabType } from "./types";
import type { UserRoleType } from "@/data/userManagement";

export const tabs: TabType[] = [
  "Overall",
  "System Admin",
  "Operator",
  "Instructor",
  "Maintainer",
  "Archived",
];

export const RANKS: string[] = [
  "REC", "PTE", "LCP", "CPL", "CFC",
  "3SG", "2SG", "1SG", "SSG", "MSG",
  "3WO", "2WO", "1WO", "MWO", "SWO", "CWO",
  "2LT", "LTA", "CPT", "MAJ", "LTC", "SLTC", "COL", "BG", "MG", "LG",
];

export const ROLES: UserRoleType[] = [
  "System Admin",
  "Operator",
  "Instructor",
  "Maintainer",
];

export const PER_PAGE = 10;

/** Figma `Dropdown - Options` (7014:572509) — the company names the list shows. */
export const COMPANY_NAMES: string[] = [
  "Apex Range Technologies",
  "Meridian Systems Integration",
  "Sentinel Logistics Pte Ltd",
  "Vector Defence Systems",
];

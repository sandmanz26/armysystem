// ── Types & Interfaces for Settings ──────────────────────────────────────────

import { MENU_ITEMS } from "./constants";

export type MenuItem = (typeof MENU_ITEMS)[number];

export type NotifTab = "Booking" | "Asset" | "Training" | "User";

export interface IPEntry {
  id: string;
  name: string;
  ipAddress: string;
  description: string;
  startIp: string;
  endIp: string;
}

export interface RoomEntry {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  description: string;
}

/**
 * Briefing Room (5108:73521) — a richer, Briefing-Room-only shape. Its table
 * carries Level/Capacity/Created at/Created by that Location's `RoomEntry`
 * does not; the two pages stopped being column-for-column twins even though
 * they share the same Add/Edit/Delete drawer pattern.
 */
export interface BriefingRoomEntry {
  id: string;
  name: string;
  /** Figma label "Additional Info" — same field Location calls "Description". */
  additionalInfo: string;
  level: 1 | 2 | 3 | 4;
  capacity: number;
  status: "Active" | "Inactive";
  createdAt: string;
  createdBy: string;
  createdByRole: string;
}

export interface VersionEntry {
  id: string;
  version: string;
  date: string;
  patchNotes: string[];
}

/** General Settings form values (5029:6257). Numbers stay strings while edited. */
export interface GeneralSettingsValues {
  individualBooking: boolean;
  maskSvcId: boolean;
  archiveDays: string;
  humsInterval: string;
  rfidTransition: string;
  armskoteTransition: string;
  missingTransition: string;
}

/** Notification Settings: option label → enabled. */
export type NotificationValues = Record<string, boolean>;

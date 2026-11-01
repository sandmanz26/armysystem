// ── Constants, mock data, and small union types for Settings ─────────────────

import type { BriefingRoomEntry, IPEntry, RoomEntry, VersionEntry } from "./types";

// Figma `Sidebar-Settings New` (General page 7033:691121, frame 5029:6257) —
// six items, in this order. The old one-setting-per-item list (Auto-Archive,
// HUMS Interval, RFID/Armskote/Missing Transition Rules, Individual Booking,
// Mask Service ID) now lives as sections of "General"; "Notification Setting" is
// "Notification".
export const MENU_ITEMS = [
  "General",
  "Briefing Room",
  "Location",
  "Notification",
  "System Version",
  "IP Whitelisting",
] as const;

/**
 * General Settings (5029:6257) defaults — the same values the separate panels
 * used before: Individual Booking / Mask Service ID enabled, Archive after 30 days,
 * HUMS 30 s, RFID 80 s, Armskote 80 s, Missing 15 s.
 */
export const GENERAL_DEFAULTS = {
  individualBooking: true,
  maskSvcId: true,
  archiveDays: "30",
  humsInterval: "30",
  rfidTransition: "80",
  armskoteTransition: "80",
  missingTransition: "15",
};

export const BOOKING_OPTIONS = ["New Booking", "Booking Assignment", "Cancel Booking"];

// Figma `Notification` page (7033:691122), section 5029:6196 — the Asset,
// Training and User tabs, read the same way as Booking's own frame.
export const ASSET_NOTIF_OPTIONS = [
  "Create Assignment",
  "Reissue Assignment",
  "Issue / Top Up Asset",
  "Ready For Return Asset",
  "Return Asset",
  "Asset Detect Activity",
  "Asset Missing Timer And Daily",
];

export const TRAINING_NOTIF_OPTIONS = [
  "Session Ready for Training",
  "Start Training",
  "Stop Training",
  "Pause Training",
  "Resume Training",
  "End Training",
];

export const USER_NOTIF_OPTIONS = ["Create User", "Edit User", "Archive User"];

export const PER_PAGE = 10;

export const IP_ENTRIES: IPEntry[] = [
  { id: "ip5", name: "IP Name 5",      ipAddress: "10.10.10.50",    description: "This Is For IP Name 5",        startIp: "10.10.10.1",    endIp: "10.10.10.255"    },
  { id: "ip4", name: "IP Name 4",      ipAddress: "192.168.100.15", description: "This Is For IP Name 4",        startIp: "192.168.100.1", endIp: "192.168.100.255" },
  { id: "ip3", name: "IP Name 3",      ipAddress: "172.16.0.20",    description: "This Is For IP Name 3",        startIp: "172.16.0.1",    endIp: "172.16.0.255"    },
  { id: "ip2", name: "IP Name 2",      ipAddress: "10.0.0.5",       description: "This Is For IP Name 2",        startIp: "10.0.0.1",      endIp: "10.0.0.255"      },
  { id: "ip1", name: "IP Name 1",      ipAddress: "192.168.1.10",   description: "This Is For IP Name 1",        startIp: "192.168.1.1",   endIp: "192.168.1.255"   },
  { id: "ip0", name: "All IP Address", ipAddress: "0.0.0.0",        description: "Access For All IP Address",    startIp: "0.0.0.0",       endIp: "255.255.255.255" },
];

// Figma `Briefing Room - Full Table` (5029:6492) sample rows, in its own order.
export const BRIEFING_ROOMS: BriefingRoomEntry[] = [
  { id: "br1", name: "L1BR-01", additionalInfo: "Main briefing room, near Level 1 lobby", level: 1, capacity: 40, status: "Active", createdAt: "6 Jun 2026\n11:09 PM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br2", name: "L1BR-02", additionalInfo: "Adjacent to WPT range control room", level: 1, capacity: 30, status: "Inactive", createdAt: "25 May 2026\n03:45 PM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br3", name: "L2BR-01", additionalInfo: "", level: 2, capacity: 25, status: "Active", createdAt: "20 May 2026\n11:30 AM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br4", name: "L3BR-01", additionalInfo: "MST cabin block, level 3", level: 3, capacity: 20, status: "Inactive", createdAt: "15 May 2026\n07:15 PM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br5", name: "L3BR-02", additionalInfo: "", level: 3, capacity: 10, status: "Active", createdAt: "1 May 2026\n09:00 AM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br6", name: "L4BR-02", additionalInfo: "", level: 4, capacity: 40, status: "Active", createdAt: "29 Apr 2026\n01:20 PM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
  { id: "br7", name: "Ops Room 1", additionalInfo: "Reserved for TCT command team briefings", level: 4, capacity: 30, status: "Inactive", createdAt: "28 Apr 2026\n05:55 AM", createdBy: "Olivia Carter", createdByRole: "System Admin" },
];

// Figma `Location - Full Table` (5029:6529) sample rows — 2, not 4. The two
// "Briefing Room N" entries here before were copy-paste leftovers from the
// Briefing Room list; a Location and a Briefing Room are different things.
export const LOCATIONS: RoomEntry[] = [
  { id: "loc1", name: "Operator Room",   status: "Active",   description: "For Operator Room"   },
  { id: "loc2", name: "Maintainer Room", status: "Inactive", description: "For Maintainer Room" },
];

export const INITIAL_VERSIONS: VersionEntry[] = [
  { id: "v15", version: "0.6.9-21", date: "06 May 2026\n11:09:00 PM", patchNotes: ["Release With Major Bug Fixing And Feature Adjustment"] },
  { id: "v14", version: "0.6.9-20", date: "05 May 2026\n09:30:00 PM", patchNotes: ["Release With Major Bug Fixing And Feature Adjustment"] },
  { id: "v13", version: "0.6.9-19", date: "03 May 2026\n08:00:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
  { id: "v12", version: "0.6.9-18", date: "01 May 2026\n06:45:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
  { id: "v11", version: "0.6.9-17", date: "29 Apr 2026\n05:20:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
  { id: "v10", version: "0.6.9-15", date: "26 Apr 2026\n04:00:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
  { id: "v9",  version: "0.6.9-14", date: "24 Apr 2026\n03:10:00 PM", patchNotes: ["Release"] },
  { id: "v8",  version: "0.6.9-4",  date: "20 Apr 2026\n02:30:00 PM", patchNotes: ["Release"] },
  { id: "v7",  version: "0.4.3",    date: "15 Nov 2025\n04:25:14 PM", patchNotes: ["Final PD Release With Bug Fixing"] },
  { id: "v6",  version: "0.4.2",    date: "09 Oct 2025\n03:10:56 PM", patchNotes: ["Third PD Release With Bug Fixing"] },
  { id: "v5",  version: "0.4.1",    date: "30 Sep 2025\n12:10:27 PM", patchNotes: ["Second PD Release With Bug Fixing"] },
  { id: "v4",  version: "0.4.0",    date: "13 Sep 2025\n07:34:47 PM", patchNotes: ["First PD Release"] },
];

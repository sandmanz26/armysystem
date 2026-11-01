import type { WeaponItem } from "./types";

export const PROGRAMS = [
  { id: "WPT"     as const, title: "WPT",       desc: "Focused on mastering advanced weapon handling and operations.",  bg: "from-gray-900 via-gray-700 to-gray-800" },
  { id: "MST"     as const, title: "MST",       desc: "Enhances team tactical skills through mission simulations.",      bg: "from-gray-800 via-gray-600 to-gray-700" },
  { id: "TCT"     as const, title: "TCT",       desc: "Strengthens leadership in strategic planning and operations.",    bg: "from-gray-900 via-gray-700 to-gray-600" },
  { id: "MST+TCT" as const, title: "MST + TCT", desc: "Combined MST and TCT integrated training program.",              bg: "from-gray-800 via-gray-500 to-gray-700" },
];

/** Which program cards to show per session type */
// NOTE: "MST+TCT" is temporarily hidden from the Integrated tab (do NOT delete —
// the full MST+TCT booking flow, onboarding, and live-training dashboard remain
// fully functional in the codebase and can be re-enabled by adding "MST+TCT"
// back to the Integrated array below).
export const PROGRAMS_BY_SESSION: Record<string, readonly string[]> = {
  "Standalone":    ["WPT", "MST", "TCT"],
  "SimIntegrated": ["MST", "TCT"],
  "Integrated":    ["WPT", "MST", "TCT"],   // "MST+TCT" hidden — re-add to show
};

export const STEPS        = ["Booking Details", "Lane Configuration", "Nominal Roll", "Schedule"];
// MST Create Booking (Figma 6068:92702 wizard bar): 4 numbered steps; "Review" is the modal opened from the last step.
export const MST_STEPS    = ["Booking Details", "Schedule", "Cabin Configuration", "Nominal Roll"];
export const TCT_STEPS    = ["Booking Details", "Cluster Configuration", "Nominal Roll"];
export const MSTTCT_STEPS = ["Booking Details", "Cabin Configuration", "Cluster Configuration", "Nominal Roll"];

export const TRAINING_MODES_BY_TYPE: Record<string, string[]> = {
  Individual: ["Marksmanship"],
  Group:      ["Collective", "Judgemental"],
};

export const WEAPON_OPTIONS: WeaponItem[] = [
  { id: "SAR21", label: "SAR21", qty: 0, selected: false },
  { id: "LMG",   label: "LMG",   qty: 0, selected: false },
  { id: "M203",  label: "M203",  qty: 0, selected: false },
  { id: "GPMG",  label: "GPMG",  qty: 0, selected: false },
  { id: "M110",  label: "M110",  qty: 0, selected: false },
];

export const LANE_COUNT = 15;
export const OCCUPIED_LANES = [4, 11, 15]; // 1-based

export const NOMINAL_ROLL_DATA = [
  { rank: "CPT",  name: "Ken Chow",        svcId: "****212A", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "MAJ",  name: "Wayang King",     svcId: "****212B", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "LTA",  name: "Tan Wei Liang",   svcId: "****212C", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "LTC",  name: "Muthu Mohammad",  svcId: "****212D", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "COL",  name: "Liao Kang Chai",  svcId: "****212E", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "LTA",  name: "Ismail Iskandar", svcId: "****212F", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "CPT",  name: "Lee Yep",         svcId: "****212G", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "MAJ",  name: "Chun Xiong",      svcId: "****212H", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "SLTC", name: "Halim Lim",       svcId: "****212I", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "LTC",  name: "Liang Zhi Qiang", svcId: "****212J", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "CPT",  name: "Ahmad Rizal",     svcId: "****212K", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "MAJ",  name: "David Tan",       svcId: "****212L", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "LTA",  name: "Ravi Kumar",      svcId: "****212M", platoon: "Platoon 1", weapon: "SAR21" },
  { rank: "CPT",  name: "Jason Lim",       svcId: "****212N", platoon: "Platoon 2", weapon: "SAR21" },
  { rank: "LTC",  name: "Mohamed Ali",     svcId: "****212O", platoon: "Platoon 1", weapon: "SAR21" },
  ...Array.from({ length: 17 }, (_, i) => ({
    rank: "CPT", name: `Trainee ${i + 16}`, svcId: `****2${i + 10}Z`, platoon: `Platoon ${(i % 2) + 1}`, weapon: "SAR21",
  })),
];

export const PER_PAGE = 10;

export const COLLECTIVE_ROLES = [
  "M110 Team (SNIPERS)", "F.O / OC", "GPMG Team (STEELNET)",
  "SPIKE SR (MPAT)", "SPIKE LR (ATGM)", "MATADOR",
  "SECTION Commander", "LMG", "SAR21 GUNNER", "M203", "PSLAM (PIONEER)",
];

export const COLLECTIVE_WEAPONS = ["SAR21", "LMG", "M110", "MATADOR", "SPIKE SR", "SPIKE LR", "GPMG", "Comd Bino", "Claymore", "PSLAM", "Drone", "M203"];
export const JUDGEMENTAL_WEAPONS = ["SAR21", "LMG", "M203", "GPMG", "M110", "P30"];

export const COURSEWARE_BY_MODE: Record<string, string[]> = {
  Marksmanship: [
    "BTP (SAR21)", "ATP (M) (SAR21/LMG)", "ATP (SP) (SAR21/LMG)",
    "CS(M) (SAR21/LMG)", "CS(SP) (SAR21/LMG)", "Shoot (LMG)",
    "Zeroing (SAR21/LMG)", "APS (SAR21/LMG)", "GPMG (Basic)", "GPMG (Advanced)", "MSTP (M110)",
  ],
  Collective:  ["Component Type Training A", "Component Type Training B", "Component Type Training C"],
  Judgemental: ["Judgemental Shooting A", "Judgemental Shooting B", "Judgemental Shooting C"],
};

export const COLLECTIVE_TEAM_OPTIONS = [
  "M110 Team (SNIPERS)", "F.O / OC", "GPMG Team (STEELNET)",
  "SPIKE SR (MPAT)", "SPIKE LR (ATGM)", "MATADOR",
  "SECTION Commander", "LMG", "SAR21 GUNNER", "M203", "PSLAM (PIONEER)",
];

export const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`]).flat();

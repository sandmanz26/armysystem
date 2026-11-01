import type { Severity, Tone } from "../shared";

/*
 * Mock data for Accel → Detection Feed. Today's three critical events and the
 * 18 May "Asset movement — after-hours" detail are read off the reference
 * screenshots (6 Oct 2026). The remaining four events, every event's thumbnail
 * beyond the first two, and all the VLM-reasoning text except the 18 May one are
 * ASSUMED. Counts are arranged to match the cards drawn: 7 total (4 critical,
 * 2 medium, 1 low), 6 pending, 1 escalated, 5 of them today.
 */

export type Status = "pending" | "escalated" | "dismissed";

/** Description text with inline emphasis: `code` = entity id, `hl` = the finding. */
export interface Part {
  t: "text" | "code" | "hl";
  v: string;
}

export interface Model {
  id: string;
  name: string;
  tone: Tone;
  trained: string;
  mAP: string;
}

export interface FeedEvent {
  id: string;
  /** Long id shown in the drawer. */
  ref: string;
  severity: Severity;
  title: string;
  model: Model;
  status: Status;
  caseId?: string;
  /** Set when escalated: who owns the case and the reason given. */
  assignee?: string;
  note?: string;
  desc: Part[];
  vlm: Part[];
  site: string;
  zone: string;
  camera: string;
  /** "14:23" on the card, "18 May 2026, 22:17:44" in the drawer. */
  time: string;
  full: string;
  day: "2026-05-19" | "2026-05-18";
  thumb: string;
}

const M = {
  asset: { id: "Mdl_002", name: "Asset Movement Detection", tone: "warning", trained: "12 May 2026", mAP: "0.91" },
  sop: { id: "Mdl_001", name: "SOP Compliance", tone: "info", trained: "8 May 2026", mAP: "0.88" },
  zone: { id: "Mdl_005", name: "Restricted Zone Monitor", tone: "purple", trained: "14 May 2026", mAP: "0.93" },
  access: { id: "Mdl_003", name: "Access Control", tone: "success", trained: "10 May 2026", mAP: "0.86" },
  object: { id: "Mdl_004", name: "Unattended Object", tone: "info", trained: "9 May 2026", mAP: "0.84" },
} satisfies Record<string, Model>;

const t = (v: string): Part => ({ t: "text", v });
const c = (v: string): Part => ({ t: "code", v });
const h = (v: string): Part => ({ t: "hl", v });

export const EVENTS: FeedEvent[] = [
  {
    id: "e1",
    ref: "EVT-2026-0519-004",
    severity: "critical",
    title: "Asset movement — unauthorized",
    model: M.asset,
    status: "pending",
    desc: [t("Asset "), c("AST-WPN-0421"), t(" exited "), c("Armoury-B"), t(" at "), t("14:23. Person "), c("PER-U-7782"), t(" detected in frame — "), h("no matching access record within 60s window"), t(".")],
    vlm: [t("At 14:23 a person in camouflage fatigues carries a hard weapon case out of Armoury-B. The access panel shows no sign-out for asset AST-WPN-0421 within the 60-second window, and no second person is present to co-sign.")],
    site: "Ashford Naval",
    zone: "Armoury-B",
    camera: "Cam-12",
    time: "14:23",
    full: "19 May 2026, 14:23:08",
    day: "2026-05-19",
    thumb: "/accel-feeds/event-armoury.jpg",
  },
  {
    id: "e2",
    ref: "EVT-2026-0519-003",
    severity: "critical",
    title: "Restricted zone entry",
    model: M.zone,
    status: "escalated",
    caseId: "CASE-2026-0211",
    desc: [t("Person "), c("PER-U-7790"), t(" entered "), c("Server-Room-3"), t(" at 11:47 — "), h("no clearance on file for this credential"), t(". Dwell time: 4m 12s.")],
    vlm: [t("A person badges into Server-Room-3 using a credential that is not on the room's access list, then remains inside for 4m 12s. No escort is visible and the door was not held open for them.")],
    site: "Cargo Hub Cresthaven",
    zone: "Server Room 3",
    camera: "Cam-04",
    time: "11:47",
    full: "19 May 2026, 11:47:22",
    day: "2026-05-19",
    thumb: "/accel-feeds/event-server-room.jpg",
  },
  {
    id: "e3",
    ref: "EVT-2026-0519-002",
    severity: "critical",
    title: "Compliance breach — Pat-down SOP",
    model: M.sop,
    status: "pending",
    desc: [t("Pat-down procedure not completed for subject at "), c("Checkpoint-A2"), t(" at 10:18 — "), h("required steps missing: torso check, ankle check"), t(".")],
    vlm: [t("The subject is waved through Checkpoint-A2 after a pat-down limited to the arms and back. The torso and ankle checks required by the SOP are not performed before they exit the frame.")],
    site: "Cargo Hub Cresthaven",
    zone: "Loading Bay A",
    camera: "Cam-01",
    time: "10:18",
    full: "19 May 2026, 10:18:40",
    day: "2026-05-19",
    thumb: "/accel-feeds/cam-01.jpg",
  },
  {
    id: "e4",
    ref: "EVT-2026-0519-001",
    severity: "medium",
    title: "Tailgating at entry",
    model: M.access,
    status: "pending",
    desc: [t("Two people passed "), c("Gate-2"), t(" on a single badge tap at 09:32 — "), h("second person has no credential read"), t(".")],
    vlm: [t("One person badges in and holds the door; a second person follows within a second without presenting a credential. Both continue into the loading area.")],
    site: "Cargo Hub Cresthaven",
    zone: "Gate 2",
    camera: "Cam-07",
    time: "09:32",
    full: "19 May 2026, 09:32:15",
    day: "2026-05-19",
    thumb: "/accel-feeds/cam-07.jpg",
  },
  {
    id: "e5",
    ref: "EVT-2026-0519-000",
    severity: "low",
    title: "Unattended object",
    model: M.object,
    status: "pending",
    desc: [t("Object detected in "), c("Concourse-B"), t(" at 08:55, stationary for 3m 12s — "), h("below standard alert threshold"), t("; logged for review.")],
    vlm: [t("A bag is set down beside a pillar and left. Nobody returns to it during the 3m 12s observed, which is under the 5-minute alert threshold, so it is logged rather than raised.")],
    site: "Cargo Hub Cresthaven",
    zone: "Main Gate",
    camera: "Cam-15",
    time: "08:55",
    full: "19 May 2026, 08:55:03",
    day: "2026-05-19",
    thumb: "/accel-feeds/cam-15.jpg",
  },
  {
    id: "e6",
    ref: "EVT-2026-0518-007",
    severity: "critical",
    title: "Asset movement — after-hours",
    model: M.asset,
    status: "pending",
    desc: [t("Asset "), c("AST-EQP-2218"), t(" exited "), c("Storage-C"), t(" at 22:17. Person "), c("PER-K-1140"), t(" identified — "), h("movement outside operational hours (18:00–06:00)"), t(".")],
    vlm: [
      t("At 22:17:44, a figure wearing reflective work gear is observed in Pier-4's Storage-C access corridor. They badge through using a valid credential but "),
      h("access occurs outside the site's operational window (18:00–06:00)"),
      t(". The individual removes a large equipment case — matching asset tag AST-EQP-2218 dimensions — from the storage bay and moves toward the loading dock. No secondary personnel are present. The on-site guard station camera confirms no sign-out log was created for this asset."),
    ],
    site: "Kingsmere Camp",
    zone: "Storage-C",
    camera: "Cam-22",
    time: "22:17",
    full: "18 May 2026, 22:17:44",
    day: "2026-05-18",
    thumb: "/accel-feeds/cam-22.jpg",
  },
  {
    id: "e7",
    ref: "EVT-2026-0518-004",
    severity: "medium",
    title: "Loitering near perimeter",
    model: M.zone,
    status: "pending",
    desc: [t("Person "), c("PER-K-1102"), t(" remained near "), c("Perimeter-N"), t(" at 19:40 for 6m 05s — "), h("no assigned task in this zone"), t(".")],
    vlm: [t("A person stands by the northern fence line for six minutes without carrying equipment or engaging with the gate. No patrol is scheduled for this stretch in the 19:30–20:00 window.")],
    site: "Kingsmere Camp",
    zone: "Perimeter North",
    camera: "Cam-09",
    time: "19:40",
    full: "18 May 2026, 19:40:51",
    day: "2026-05-18",
    thumb: "/accel-feeds/cam-09.jpg",
  },
];

/** People a case can be assigned to — the names that appear in the activity log screenshot. */
export const ASSIGNEES = ["Sze Hui", "Jordan Kim", "Priya Raman"];

/** Open cases Link Case can attach to — the three on the Dashboard's Incident Cases card. */
export const OPEN_CASES = [
  { id: "CASE-2026-0211", title: "Weapon unaccounted — SAR21 #A-0421" },
  { id: "CASE-2026-0209", title: "Tracking gap — Cam-BS-001 outage" },
  { id: "CASE-2026-0204", title: "Late return pattern — Lane 2" },
];

export const TODAY = "2026-05-19";
export const DAY_LABEL: Record<FeedEvent["day"], string> = {
  "2026-05-19": "Today · 19 May 2026",
  "2026-05-18": "Yesterday · 18 May 2026",
};

/** The "Dismissed (7)" counter starts at 7 earlier dismissals that are not listed anywhere. */
export const DISMISSED_BEFORE = 7;

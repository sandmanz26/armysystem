import type { Severity, Tone } from "../shared";

/*
 * Mock data for Accel → Dashboard. "Today" and the "This Month" station totals
 * are read off the reference screenshots (6 Oct 2026); every other range, and the
 * per-bucket chart values, are ASSUMED so the range chips have something to show.
 * Likewise the dashboard (a "Kingsmere Camp" weapon-tracking view) and the
 * Live Monitoring CCTV page use different example data in the screenshots.
 */

export type RangeKey = "today" | "yesterday" | "week" | "month" | "custom";

export const RANGE_OPTIONS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export interface StationId {
  id: "TRX-01" | "TRX-02" | "TRX-03";
  tone: Tone;
}
export const STATIONS: StationId[] = [
  { id: "TRX-01", tone: "info" },
  { id: "TRX-02", tone: "warning" },
  { id: "TRX-03", tone: "success" },
];

export interface RangeData {
  /** "9 events" next to "Showing Today". */
  events: number;
  labels: string[];
  yTicks: number[];
  series: Record<StationId["id"], number[]>;
  /** Per station: total alerts and the critical / medium / low split. */
  stations: Record<StationId["id"], { alerts: number; split: [number, number, number] }>;
}

export const RANGES: Record<Exclude<RangeKey, "custom">, RangeData> = {
  today: {
    events: 9,
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    yTicks: [0, 1, 2, 3, 4],
    series: {
      "TRX-01": [3, 4, 4, 4, 2, 2],
      "TRX-02": [4, 3, 3, 2, 2, 2],
      "TRX-03": [2, 2, 1, 2, 2, 3],
    },
    stations: {
      "TRX-01": { alerts: 4, split: [2, 1, 1] },
      "TRX-02": { alerts: 3, split: [1, 2, 0] },
      "TRX-03": { alerts: 2, split: [0, 1, 1] },
    },
  },
  yesterday: {
    events: 7,
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    yTicks: [0, 1, 2, 3, 4],
    series: {
      "TRX-01": [2, 3, 3, 4, 3, 2],
      "TRX-02": [3, 2, 2, 3, 3, 1],
      "TRX-03": [1, 1, 2, 2, 1, 2],
    },
    stations: {
      "TRX-01": { alerts: 3, split: [1, 1, 1] },
      "TRX-02": { alerts: 2, split: [1, 1, 0] },
      "TRX-03": { alerts: 2, split: [0, 1, 1] },
    },
  },
  week: {
    events: 41,
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    yTicks: [0, 5, 10, 15, 20],
    series: {
      "TRX-01": [12, 15, 14, 18, 16, 9, 7],
      "TRX-02": [10, 12, 15, 13, 14, 8, 6],
      "TRX-03": [6, 7, 5, 8, 7, 4, 3],
    },
    stations: {
      "TRX-01": { alerts: 20, split: [9, 6, 5] },
      "TRX-02": { alerts: 14, split: [5, 7, 2] },
      "TRX-03": { alerts: 7, split: [1, 3, 3] },
    },
  },
  month: {
    events: 198,
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
    yTicks: [0, 15, 30, 45],
    series: {
      "TRX-01": [38, 44, 40, 38],
      "TRX-02": [38, 35, 28, 19],
      "TRX-03": [22, 15, 11, 14],
    },
    stations: {
      "TRX-01": { alerts: 88, split: [44, 22, 22] },
      "TRX-02": { alerts: 66, split: [22, 44, 0] },
      "TRX-03": { alerts: 44, split: [0, 22, 22] },
    },
  },
};

export interface AlertEvent {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  time: string;
  caseId?: string;
}

export const ALERT_EVENTS: AlertEvent[] = [
  { id: "a1", severity: "critical", title: "Weapon missing from rack", detail: "SAR21 #A-0421 not returned · TRX-02 > Lane 11 · 18 min overdue", time: "14:23:08" },
  { id: "a2", severity: "critical", title: "Camera disconnected", detail: "Cam-BS-001 lost signal · TRX-01 · weapon tracking paused", time: "12:10:36", caseId: "CASE-2026-0211" },
  { id: "a3", severity: "critical", title: "Unauthorised weapon removal", detail: "SAR21 #A-0388 lifted without sign-out · TRX-01 > Lane 4", time: "11:47:22" },
  { id: "a4", severity: "medium", title: "Weapon returned late", detail: "SAR21 #A-0402 returned 9 min after session end · TRX-02 > Lane 2", time: "10:18:55" },
  { id: "a5", severity: "low", title: "Base station signal weak", detail: "TRX-03 uplink below threshold for 4 min — auto-recovered", time: "08:55:03" },
];

export interface IncidentCase {
  id: string;
  caseId: string;
  title: string;
  meta: string;
  severity: Severity;
}

export const INCIDENT_CASES: IncidentCase[] = [
  { id: "c1", caseId: "CASE-2026-0211", title: "Weapon unaccounted — SAR21 #A-0421", meta: "CASE-2026-0211 · TRX-02 · Sze Hui", severity: "critical" },
  { id: "c2", caseId: "CASE-2026-0209", title: "Tracking gap — Cam-BS-001 outage", meta: "CASE-2026-0209 · TRX-01 · Jordan Kim", severity: "medium" },
  { id: "c3", caseId: "CASE-2026-0204", title: "Late return pattern — Lane 2", meta: "CASE-2026-0204 · TRX-02 · Priya Raman", severity: "low" },
];

export type ActivityKind = "CASE" | "CAMERA/NVR" | "EVENT" | "AUTHENTICATION" | "CONFIGURATION";

export interface ActivityRow {
  id: string;
  when: string;
  area: string;
  kind: ActivityKind;
  who: string;
  what: string;
}

export const ACTIVITY: ActivityRow[] = [
  { id: "l1", when: "4 min ago", area: "Incident Cases", kind: "CASE", who: "Sze Hui", what: "Opened CASE-2026-0211 — SAR21 #A-0421 unaccounted at TRX-02" },
  { id: "l2", when: "11 min ago", area: "Devices", kind: "CAMERA/NVR", who: "System", what: "Cam-BS-001 went offline — weapon tracking paused on TRX-01" },
  { id: "l3", when: "22 min ago", area: "Alert Log", kind: "EVENT", who: "Jordan Kim", what: "Escalated alert EVT-03 — unauthorised removal at Lane 4" },
  { id: "l4", when: "38 min ago", area: "User Management", kind: "AUTHENTICATION", who: "Delbin Arkar", what: "Signed in via SSO (Okta)" },
  { id: "l5", when: "1 hr ago", area: "System Config", kind: "CONFIGURATION", who: "Delbin Arkar", what: "Set weapon-return grace period to 10 minutes" },
  { id: "l6", when: "2 hr ago", area: "Devices", kind: "CAMERA/NVR", who: "Priya Raman", what: "Re-paired Cam-BS-014 to base station TRX-03" },
];

export const KIND_TONE: Record<ActivityKind, Tone> = {
  CASE: "warning",
  "CAMERA/NVR": "info",
  EVENT: "warning",
  AUTHENTICATION: "info",
  CONFIGURATION: "purple",
};

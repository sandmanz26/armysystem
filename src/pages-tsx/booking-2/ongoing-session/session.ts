// Booking 2.0 — Ongoing Session data (Figma page 5549:141192).
//
// There is no backend: a session lives in sessionStorage, keyed by booking id,
// so it survives the Onboarding → Ongoing Session → Booking Detail → Continue
// Session round trip. Onboarding's Begin Session seeds it from the real Detail
// List the user just confirmed; opening an "Ongoing" booking that was never
// onboarded in this tab falls back to a mock shaped like Figma's
// `Detail List - Mix Status` sample (5520:437962).
import type { Booking } from "@/data/mock";

export type StationType = "flat" | "cshaped";
export type DetailStatus = "Completed" | "Ready" | "In Queue" | "Pending";
export type ResultKind = "Marksman" | "Passed" | "Failed";

export interface Attempt {
  score: number;
  max: number;
  detailNumber: number;
}

export interface SessionTrainee {
  id: string;
  rank: string;
  name: string;
  svcId: string;
  weapon: string[];
  type: StationType;
  station: string;
  lane: number;
  attempts: Attempt[];
}

/** One lane's configuration: the role and weapon(s) it is set up for, and whether it is switched on. */
export interface SessionLane {
  role: string;
  weapon: string[];
  active: boolean;
}

export interface SessionStation {
  type: StationType;
  label: string;
  laneCount: number;
  activeLanes: number[];
  /** Per-lane role/weapon, index 0 = Lane 1. Absent on older sessions — see `lanesOf`. */
  lanes?: SessionLane[];
}

export interface LaneAssignment {
  lane: number;
  traineeId: string;
}

export interface SessionDetail {
  id: string;
  type: StationType;
  station: string;
  number: number;
  /** Queue position within the station. Separate from `number` so a detail
   *  keeps its name ("Detail 6") after Cut Queue moves it forward — past
   *  attempts are labelled by that name. */
  order: number;
  status: DetailStatus;
  assignments: LaneAssignment[];
}

export interface DraftDetail {
  id: string;
  type: StationType;
  station: string;
  stages: string[];
  assignments: LaneAssignment[];
}

export interface OngoingSession {
  bookingId: string;
  bookingCode: string;
  bookingName: string;
  courseware: string;
  startedAt: number;
  endedAt?: number;
  trainees: SessionTrainee[];
  stations: SessionStation[];
  details: SessionDetail[];
  drafts: DraftDetail[];
  laneDown?: { station: string; lane: number };
}

export const SCORE_MAX = 20;

// ⚠️ Not specified anywhere in Figma or the PRD — inferred from the only
// samples there are (20/20 Marksman, 15/20 Passed, 10/20 and 8/20 Failed).
// See docs/OPEN-DECISIONS.md before relying on these cut-offs.
const MARKSMAN_MIN = 18;
const PASS_MIN = 12;

export function bestAttempt(t: SessionTrainee): Attempt | null {
  if (t.attempts.length === 0) return null;
  return t.attempts.reduce((best, a) => (a.score > best.score ? a : best));
}

export function resultOf(t: SessionTrainee): ResultKind | null {
  const best = bestAttempt(t);
  if (!best) return null;
  if (best.score >= MARKSMAN_MIN) return "Marksman";
  if (best.score >= PASS_MIN) return "Passed";
  return "Failed";
}

/** One attempt's result on the same cut-offs as `resultOf`. */
export function attemptResult(a: Attempt): ResultKind {
  if (a.score >= MARKSMAN_MIN) return "Marksman";
  if (a.score >= PASS_MIN) return "Passed";
  return "Failed";
}

/** Figma `Ongoing - Detail List` card (5520:437962): Marksman / Passed /
 *  Failed counted over the attempts shot IN this detail; null = "No result yet". */
export function detailResults(session: OngoingSession, detail: SessionDetail): Record<ResultKind, number> | null {
  const counts: Record<ResultKind, number> = { Marksman: 0, Passed: 0, Failed: 0 };
  let any = false;
  detail.assignments.forEach(({ traineeId }) => {
    const t = session.trainees.find((x) => x.id === traineeId);
    const a = t?.attempts.find((x) => x.detailNumber === detail.number);
    if (!a) return;
    any = true;
    counts[attemptResult(a)] += 1;
  });
  return any ? counts : null;
}

export function attemptPassed(a: Attempt): boolean {
  return a.score >= PASS_MIN;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function stationsOf(session: OngoingSession, type: StationType): SessionStation[] {
  return session.stations.filter((s) => s.type === type);
}

export function detailsOf(session: OngoingSession, station: string): SessionDetail[] {
  return session.details.filter((d) => d.station === station).sort((a, b) => a.order - b.order);
}

export function nextDetailNumber(session: OngoingSession, station: string): number {
  return session.details.filter((d) => d.station === station).reduce((m, d) => Math.max(m, d.number), 0) + 1;
}

// Figma `Detail List - Mix Status`: Cut Queue is greyed out on Completed and
// Ready details and on the first detail still waiting (nothing waiting ahead
// of it to jump). See OPEN-DECISIONS — `Detail List - Default` disagrees on
// one card.
export function canCutQueue(session: OngoingSession, detail: SessionDetail): boolean {
  if (detail.status !== "In Queue" && detail.status !== "Pending") return false;
  return cutBeforeOptions(session, detail).some((d) => d.status === "In Queue" || d.status === "Pending");
}

// Figma `Cut Queue - Filled` (5552:215848) lists every detail ahead of the one
// being cut that hasn't finished — Ready included.
export function cutBeforeOptions(session: OngoingSession, detail: SessionDetail): SessionDetail[] {
  const queue = detailsOf(session, detail.station);
  const idx = queue.findIndex((d) => d.id === detail.id);
  return queue.slice(0, idx).filter((d) => d.status !== "Completed");
}

export function nextDetailOrder(session: OngoingSession, station: string): number {
  return session.details.filter((d) => d.station === station).reduce((m, d) => Math.max(m, d.order), 0) + 1;
}

// Moves `detail` in front of `before`. Status follows the queue slot, not the
// detail: whichever detail now sits in the "In Queue" slot is the one In Queue.
export function applyCutQueue(session: OngoingSession, detailId: string, beforeId: string): OngoingSession {
  const moving = session.details.find((d) => d.id === detailId);
  if (!moving) return session;
  const queue = detailsOf(session, moving.station).filter((d) => d.id !== detailId);
  const at = queue.findIndex((d) => d.id === beforeId);
  queue.splice(at, 0, moving);
  const statusBySlot = detailsOf(session, moving.station).map((d) => d.status);
  const orders = detailsOf(session, moving.station).map((d) => d.order);
  const renumbered = new Map(queue.map((d, i) => [d.id, { ...d, order: orders[i], status: statusBySlot[i] }]));
  return { ...session, details: session.details.map((d) => renumbered.get(d.id) ?? d) };
}

// ── Persistence ─────────────────────────────────────────────────────────────

const KEY = (bookingId: string) => `booking2-ongoing-session:${bookingId}`;

export function loadSession(bookingId: string): OngoingSession | null {
  try {
    const raw = sessionStorage.getItem(KEY(bookingId));
    return raw ? (JSON.parse(raw) as OngoingSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: OngoingSession) {
  try {
    sessionStorage.setItem(KEY(session.bookingId), JSON.stringify(session));
  } catch {
    /* storage unavailable — the page still works for this visit */
  }
}

/** "Ongoing" / "Completed" once a session exists for this booking in this tab. */
export function sessionStatusOverride(bookingId: string): "Ongoing" | "Completed" | null {
  const s = loadSession(bookingId);
  if (!s) return null;
  return s.endedAt ? "Completed" : "Ongoing";
}

// ── Seeding ────────────────────────────────────────────────────────────────

export interface SeedTrainee {
  id: string;
  rank: string;
  name: string;
  svcId: string;
  weapon: string[];
}

export interface SeedDetail {
  type: StationType;
  station: string;
  number: number;
  assignments: { lane: number; trainee: SeedTrainee }[];
}

export interface SeedStation {
  type: StationType;
  label: string;
  laneCount: number;
  activeLanes: number[];
  lanes?: SessionLane[];
}

/** Begin Session: Detail 1 of every station is In Queue, the rest Pending —
 *  Figma `Detail List - Default` (5516:411670) at 00:00:01. */
export function sessionFromOnboarding(
  booking: Booking,
  courseware: string,
  stations: SeedStation[],
  details: SeedDetail[],
): OngoingSession {
  const trainees = new Map<string, SessionTrainee>();
  details.forEach((d) =>
    d.assignments.forEach(({ lane, trainee }) => {
      if (!trainees.has(trainee.id)) {
        trainees.set(trainee.id, { ...trainee, type: d.type, station: d.station, lane, attempts: [] });
      }
    }),
  );
  return {
    bookingId: booking.id,
    bookingCode: booking.bookingId.replace(/^#/, ""),
    bookingName: booking.program,
    courseware,
    startedAt: Date.now(),
    trainees: [...trainees.values()],
    stations: stations.filter((s) => details.some((d) => d.station === s.label)),
    details: details.map((d) => ({
      id: `${d.station}-${d.number}`,
      type: d.type,
      station: d.station,
      number: d.number,
      order: d.number,
      status: d.number === 1 ? "In Queue" : "Pending",
      assignments: d.assignments.map(({ lane, trainee }) => ({ lane, traineeId: trainee.id })),
    })),
    drafts: [],
  };
}

const MOCK_FIRST = ["Adam", "Benjamin", "Charlotte", "Emma", "Emily", "Evelyn", "Fatimah", "James", "Joseph", "Kevin", "Will", "Joshua", "Sarah", "Daniel", "Ryan"];
const MOCK_LAST = ["White", "Hall", "Taylor", "Brown", "Davis", "Osman", "Rodriguez", "Garcia", "Anderson", "Power", "Lim", "Tan", "Lee", "Wong", "Kumar"];
const MOCK_SCORES = [20, 20, 15, 10, 20, 8, 20, 20, 11, 20, 18, 20];
const MOCK_LANES = [1, 2, 3, 6, 7, 8, 9, 10, 13, 14];
// Per station: the status of each detail in queue order, Figma Mix Status.
const MOCK_PLAN: DetailStatus[][] = [
  ["Completed", "Ready", "In Queue", "In Queue", "Pending", "Pending"],
  ["Completed", "Ready"],
  ["Completed", "Completed"],
];
const MOCK_SIZES = [[10, 10, 5, 10, 3, 5], [10, 10], [10, 10]];

/** Resuming a booking that was never onboarded in this tab. */
export function mockSession(booking: Booking): OngoingSession {
  const labels = (booking.assignedStations?.length ? booking.assignedStations : ["WPT-01", "WPT-02", "WPT-03"]).slice(0, 3);
  const trainees: SessionTrainee[] = [];
  const details: SessionDetail[] = [];
  let seq = 0;
  labels.forEach((station, si) => {
    const plan = MOCK_PLAN[si] ?? ["In Queue"];
    const sizes = MOCK_SIZES[si] ?? [10];
    plan.forEach((status, di) => {
      const assignments: LaneAssignment[] = [];
      MOCK_LANES.slice(0, sizes[di]).forEach((lane) => {
        const i = seq++;
        const t: SessionTrainee = {
          id: `mock-${i}`,
          rank: i % 3 === 0 ? "3SG" : "REC",
          name: `${MOCK_FIRST[i % MOCK_FIRST.length]} ${MOCK_LAST[(i * 7) % MOCK_LAST.length]}`,
          svcId: `*****${String((i * 137) % 1000).padStart(3, "0")}${String.fromCharCode(65 + (i % 26))}`,
          weapon: [i % 7 === 0 ? "LMG, M203" : "SAR21"],
          type: "flat",
          station,
          lane,
          attempts: status === "Completed" ? [{ score: MOCK_SCORES[i % MOCK_SCORES.length], max: SCORE_MAX, detailNumber: di + 1 }] : [],
        };
        trainees.push(t);
        assignments.push({ lane, traineeId: t.id });
      });
      details.push({ id: `${station}-${di + 1}`, type: "flat", station, number: di + 1, order: di + 1, status, assignments });
    });
  });
  return {
    bookingId: booking.id,
    bookingCode: booking.bookingId.replace(/^#/, ""),
    bookingName: booking.program,
    courseware: booking.courseware.split(",")[0]?.trim() ?? "",
    startedAt: Date.now() - 30_000,
    trainees,
    stations: labels.map((label) => ({
      type: "flat" as const, label, laneCount: 15, activeLanes: MOCK_LANES,
      lanes: Array.from({ length: 15 }, (_, i) => MOCK_LANES.includes(i + 1)
        ? { role: "M110 Team (SNIPERS)", weapon: ["SAR21", "LMG", "M203"], active: true }
        : { role: "", weapon: [], active: false }),
    })),
    details,
    drafts: [],
  };
}

// ── Lane configuration & detail-list edits while the session is running ────
//
// Not in Figma yet (product owner, 3 Oct 2026: "belum ada figmanya"); built from the
// reference screenshots. Rules the screenshots state: a started or finished detail is
// locked ("Locked (already started or completed)"), and on a lane-config change "only
// trainees in queue or pending are recalculated".

/** Ready and Completed details have started or finished — they can't be edited or recalculated. */
export const isLockedDetail = (d: SessionDetail) => d.status === "Ready" || d.status === "Completed";

/** Weapons can be stored as "LMG, M203" in one string; this always gives single weapons. */
export function weaponsOf(list: string[]): string[] {
  return list.flatMap((w) => w.split(",")).map((w) => w.trim()).filter(Boolean);
}

/** A lane with no weapon set accepts anyone; otherwise the trainee needs one of its weapons. */
export function laneFits(lane: SessionLane | undefined, traineeWeapon: string[]): boolean {
  if (!lane || !lane.active) return false;
  const lw = weaponsOf(lane.weapon);
  if (lw.length === 0) return true;
  const tw = weaponsOf(traineeWeapon);
  return tw.length === 0 || tw.some((w) => lw.includes(w));
}

/** Lane rows of a station. Sessions made before lanes were stored get a neutral set (no role/weapon). */
export function lanesOf(st: SessionStation): SessionLane[] {
  if (st.lanes && st.lanes.length === st.laneCount) return st.lanes;
  return Array.from({ length: st.laneCount }, (_, i) => ({ role: "", weapon: [], active: st.activeLanes.includes(i + 1) }));
}

/**
 * Lane Configuration → Confirm & recalculate. Updates every station's lanes, then re-deals the trainees
 * of its In Queue / Pending details (in their current order) over the new active lanes, first free
 * matching lane first. Ready and Completed details are untouched. Details left empty are removed and
 * extra ones are added at the back of the queue as Pending.
 */
export function applyLaneConfig(session: OngoingSession, lanesByStation: Record<string, SessionLane[]>): OngoingSession {
  const traineeById = new Map(session.trainees.map((t) => [t.id, t]));
  const stations = session.stations.map((st) => {
    const lanes = lanesByStation[st.label];
    return lanes ? { ...st, lanes, laneCount: lanes.length, activeLanes: lanes.flatMap((l, i) => (l.active ? [i + 1] : [])) } : st;
  });
  let next: OngoingSession = { ...session, stations };
  const trainees = new Map(session.trainees.map((t) => [t.id, t]));

  for (const st of stations) {
    if (!lanesByStation[st.label]) continue;
    const lanes = lanesOf(st);
    const open = detailsOf(next, st.label).filter((d) => !isLockedDetail(d));
    if (open.length === 0) continue;
    const queue = open.flatMap((d) => [...d.assignments].sort((a, b) => a.lane - b.lane).map((a) => a.traineeId));
    const everyLaneMisses = (w: string[]) => !st.activeLanes.some((n) => laneFits(lanes[n - 1], w));

    const rebuilt: SessionDetail[] = [];
    let slot = 0;
    const take = (): SessionDetail => {
      const reuse = open[slot];
      slot += 1;
      return reuse
        ? { ...reuse, assignments: [] }
        : { id: `${st.label}-${Date.now()}-${slot}`, type: st.type, station: st.label, number: nextDetailNumber({ ...next, details: [...next.details, ...rebuilt] }, st.label), order: nextDetailOrder({ ...next, details: [...next.details, ...rebuilt] }, st.label), status: "Pending", assignments: [] };
    };
    let current = take();
    for (const id of queue) {
      const t = traineeById.get(id);
      if (!t) continue;
      const free = () => st.activeLanes.find((n) => !current.assignments.some((a) => a.lane === n) && (laneFits(lanes[n - 1], t.weapon) || everyLaneMisses(t.weapon)));
      let lane = free();
      if (lane === undefined) {
        rebuilt.push(current);
        current = take();
        lane = free();
      }
      if (lane !== undefined) current.assignments.push({ lane, traineeId: id });
    }
    rebuilt.push(current);
    const kept = rebuilt.filter((d) => d.assignments.length > 0);
    // the queue always has something In Queue if it did before
    const hadInQueue = open.some((d) => d.status === "In Queue");
    kept.sort((a, b) => a.order - b.order);
    if (hadInQueue && kept.length > 0 && !kept.some((d) => d.status === "In Queue")) kept[0] = { ...kept[0], status: "In Queue" };
    const openIds = new Set(open.map((d) => d.id));
    next = { ...next, details: [...next.details.filter((d) => !openIds.has(d.id)), ...kept] };
    kept.forEach((d) => d.assignments.forEach((a) => {
      const t = trainees.get(a.traineeId);
      if (t) trainees.set(t.id, { ...t, station: st.label, lane: a.lane });
    }));
  }
  return { ...next, trainees: [...trainees.values()] };
}

/** Edit Detail List → Save changes: takes the edited details as they are. */
export function applyDetailEdits(session: OngoingSession, details: SessionDetail[]): OngoingSession {
  const trainees = new Map(session.trainees.map((t) => [t.id, t]));
  details.forEach((d) => d.assignments.forEach((a) => {
    const t = trainees.get(a.traineeId);
    if (t) trainees.set(t.id, { ...t, station: d.station, lane: a.lane });
  }));
  return { ...session, details, trainees: [...trainees.values()] };
}

// ── Mutations ───────────────────────────────────────────────────────────────

/** Appends a Pending detail at the back of the station's queue. */
export function addDetail(session: OngoingSession, station: string, assignments: LaneAssignment[]): { session: OngoingSession; detail: SessionDetail } {
  const st = session.stations.find((s) => s.label === station);
  const detail: SessionDetail = {
    id: `${station}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: st?.type ?? "flat",
    station,
    number: nextDetailNumber(session, station),
    order: nextDetailOrder(session, station),
    status: "Pending",
    assignments,
  };
  const moved = new Map(assignments.map((a) => [a.traineeId, a.lane]));
  return {
    session: {
      ...session,
      details: [...session.details, detail],
      trainees: session.trainees.map((t) => (moved.has(t.id) ? { ...t, station, lane: moved.get(t.id)! } : t)),
    },
    detail,
  };
}

/** Live Results → Create New Detail: fills the station's active lanes in
 *  order, spilling into as many extra details as the selection needs —
 *  Figma `Toast - Multiple Detail Created` (5753:139733). */
export function addReshootDetails(session: OngoingSession, station: string, traineeIds: string[]): { session: OngoingSession; created: SessionDetail[] } {
  const lanes = session.stations.find((s) => s.label === station)?.activeLanes ?? [];
  const size = Math.max(1, lanes.length);
  const created: SessionDetail[] = [];
  let next = session;
  for (let i = 0; i < traineeIds.length; i += size) {
    const chunk = traineeIds.slice(i, i + size);
    const r = addDetail(next, station, chunk.map((traineeId, j) => ({ lane: lanes[j] ?? j + 1, traineeId })));
    next = r.session;
    created.push(r.detail);
  }
  return { session: next, created };
}

// ── Reshoot Failed Trainees (Figma `Action - Reshoot`, 7897:50464) ─────────

/** Failed trainees (best attempt) who are not already waiting in an
 *  unfinished detail — the ones a reshoot still has to schedule. */
export function reshootCandidates(session: OngoingSession): SessionTrainee[] {
  const queued = new Set(
    session.details.filter((d) => d.status !== "Completed").flatMap((d) => d.assignments.map((a) => a.traineeId)),
  );
  return session.trainees.filter((t) => resultOf(t) === "Failed" && !queued.has(t.id));
}

export interface ReshootGroup {
  key: string;
  station: string;
  /** Same lane filling as `addReshootDetails`: the station's active lanes, in order. */
  assignments: LaneAssignment[];
}

/** One group per detail the reshoot would create: per station, the failed
 *  trainees fill its active lanes in order and spill into further details. */
export function reshootGroups(session: OngoingSession, trainees: SessionTrainee[]): ReshootGroup[] {
  const groups: ReshootGroup[] = [];
  session.stations.forEach((st) => {
    const ids = trainees.filter((t) => t.station === st.label).map((t) => t.id);
    const lanes = st.activeLanes;
    const size = Math.max(1, lanes.length);
    for (let i = 0; i < ids.length; i += size) {
      groups.push({
        key: `${st.label}-${i / size}`,
        station: st.label,
        assignments: ids.slice(i, i + size).map((traineeId, j) => ({ lane: lanes[j] ?? j + 1, traineeId })),
      });
    }
  });
  return groups;
}

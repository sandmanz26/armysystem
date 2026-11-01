// Booking 2.0 — Booking Details › Nominal Roll: data + mock seed (BD-1, F-008).
//
// One roll per courseware × station type ("{courseware}::flat" / "{courseware}::cshaped"), the
// same keying as Create Booking 2.0 Step 4 (`NominalRollStep`), whose `Trainee` model and mock
// generator are reused read-only. Booking Details adds the "Last Updated On" column.
//
// Seed: a booking whose mock carries `traineesCount: 0` (e.g. `bd-today`) starts empty — that is
// what raises the "Add trainees to the Nominal Roll…" banner. Any other booking gets its count
// (or Figma's 32 when it carries none, e.g. booking 11 → `Nominal Rolls - Filled` 5511:53579) of
// generated trainees on its first courseware's Flat Screen roll.
//
// Persistence: in-memory + sessionStorage per booking (same approach as laneConfigStore), so
// trainees added here survive a tab switch, the Start Onboarding round trip and a reload.
// `useNominalRollVersion()` lets the page re-render (readiness banner) when a roll changes.
import { useSyncExternalStore } from "react";
import type { Booking } from "@/data/mock";
import { generateTrainees, type Trainee } from "@/pages-tsx/booking-2/create/nominalRollTypes";

export type RollStation = "flat" | "cshaped";

export interface DetailTrainee extends Trainee {
  /** "17 January 2025" — Figma `Last Updated On`. */
  updatedOn: string;
}

export type NominalRolls = Record<string, DetailTrainee[]>;

const SEED_DATE = "17 January 2025";
const KEY = (id: string) => `toms.booking2.nominalRoll.${id}`;
const cache = new Map<string, NominalRolls>();
const listeners = new Set<() => void>();
let version = 0;

export const rollKey = (courseware: string, station: RollStation) => `${courseware}::${station}`;

export function todayLabel(now = new Date()): string {
  return now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function seed(booking: Booking, coursewares: string[]): NominalRolls {
  const count = booking.traineesCount ?? booking.trainees;
  const rolls: NominalRolls = {};
  coursewares.forEach((cw, i) => {
    rolls[rollKey(cw, "flat")] =
      i === 0 && count !== 0
        ? generateTrainees(count ?? 32).map((t) => ({ ...t, updatedOn: SEED_DATE }))
        : [];
    rolls[rollKey(cw, "cshaped")] = [];
  });
  return rolls;
}

export function getNominalRolls(booking: Booking, coursewares: string[]): NominalRolls {
  const hit = cache.get(booking.id);
  if (hit) return hit;
  try {
    const raw = sessionStorage.getItem(KEY(booking.id));
    if (raw) {
      const parsed = JSON.parse(raw) as NominalRolls;
      cache.set(booking.id, parsed);
      return parsed;
    }
  } catch { /* storage unavailable — fall back to the seed */ }
  const s = seed(booking, coursewares);
  cache.set(booking.id, s);
  return s;
}

export function saveNominalRolls(id: string, rolls: NominalRolls) {
  cache.set(id, rolls);
  try { sessionStorage.setItem(KEY(id), JSON.stringify(rolls)); } catch { /* ignore */ }
  version += 1;
  listeners.forEach((l) => l());
}

export function traineeTotal(booking: Booking, coursewares: string[]): number {
  return Object.values(getNominalRolls(booking, coursewares)).reduce((n, list) => n + list.length, 0);
}

/** Re-render when any booking's Nominal Roll changes (readiness banner, Start Onboarding). */
export function useNominalRollVersion(): number {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => version,
  );
}

// Booking 2.0 — Nominal Roll shared types/mock generator. Local to booking-2.
export interface Trainee {
  id: string;
  rank: string;
  name: string;
  svcId: string;
  platoon: string;
  role: string;
  weapon: string[];
}

export const RANK_OPTIONS = ["REC", "PFC", "LCP", "CPL", "CFC", "SGT", "3SG", "2SG", "1SG", "SSG", "MSG", "3WO", "2WO", "1WO", "MWO", "SWO", "CWO"];

const FIRST_NAMES = ["Adam", "Emma", "Fatimah", "Kevin", "Charlotte", "Evelyn", "Joseph", "Benjamin", "Emily", "James", "Sarah", "Daniel", "Michelle", "Ryan", "Amanda"];
const LAST_NAMES = ["White", "Taylor", "Osman", "Anderson", "Hall", "Davis", "Garcia", "Brown", "Rodriguez", "Lee", "Tan", "Kumar", "Ibrahim", "Wong", "Lim"];

function pad(n: number, w: number) {
  return String(n).padStart(w, "0");
}

export function generateTrainees(count: number, seedOffset: number = 0): Trainee[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = i + seedOffset;
    const first = FIRST_NAMES[idx % FIRST_NAMES.length];
    const last = LAST_NAMES[(idx * 3) % LAST_NAMES.length];
    return {
      id: `t-${idx}`,
      rank: "CPT",
      name: `${first} ${last}`,
      svcId: `*****${pad((idx * 137) % 1000, 3)}${String.fromCharCode(65 + (idx % 26))}`,
      platoon: `Platoon ${(idx % 2) + 1}`,
      role: "",
      weapon: [],
    };
  });
}

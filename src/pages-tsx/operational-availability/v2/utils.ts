import { AO_COMPLIANT_THRESHOLD } from "./constants";

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Parse "April 2026" → { year: 2026, month: 3 } (month 0-indexed). */
export function parseMonthLabel(label: string): { year: number; month: number } {
  const [monthName, yearStr] = label.split(" ");
  const month = new Date(`${monthName} 1, 2000`).getMonth();
  return { year: parseInt(yearStr, 10), month };
}

export function monthToKey(year: number, month: number): number {
  return year * 12 + month;
}

/** Figma's applied-filter label, e.g. "3 Nov 2025" (5119:297929). */
export function formatAppliedDate(d: Date): string {
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

/** Seconds → Figma's month-level duration, e.g. "49h 52m 18s", "1h 0m 24s". */
export function formatHMS(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

/** Parse "49h 52m 18s" / "45m 30s" / "0m 0s" → seconds. */
export function parseHMS(text: string): number {
  const h = /(\d+)h/.exec(text)?.[1];
  const m = /(\d+)m/.exec(text)?.[1];
  const s = /(\d+)s/.exec(text)?.[1];
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

/**
 * AO = UT / (UT + DT), TRUNCATED (not rounded) to 2 decimals — that is what
 * every Figma row shows (e.g. July: 93.9258… → "93.92%", June: 95.9978… →
 * "95.99%"). Whether UT is CDR's OT − DT is still open (PRD-GAPS P-12).
 */
export function computeAO(utSeconds: number, dtSeconds: number): number {
  const total = utSeconds + dtSeconds;
  if (total === 0) return 0;
  return Math.floor((utSeconds / total) * 10000 + 1e-9) / 100;
}

export function isCompliant(ao: number): boolean {
  return ao >= AO_COMPLIANT_THRESHOLD;
}

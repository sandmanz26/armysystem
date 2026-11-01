// TCT capacity rules (product owner, 2 Oct 2026; shown per zone 5 Oct 2026).
//
//   • A booking holds at most 256 trainees.
//   • Clusters are grouped into Zones. Zone A, B and C take at most 12 clusters each;
//     Zone D takes at most 28. Together that is the 64 clusters a TCT booking can use.
//
// A zone has many clusters, and the zone's size IS its cluster count: Cluster Configuration shows
// one zone at a time with exactly that many rows (Zone A = clusters 1–12, B = 13–24, C = 25–36,
// D = 37–64). Keep every number below in this table — nothing else in the app should hard-code
// 12, 28, 64 or 256.

export interface TCTZone { id: "A" | "B" | "C" | "D"; max: number }

export const TCT_ZONES: readonly TCTZone[] = [
  { id: "A", max: 12 },
  { id: "B", max: 12 },
  { id: "C", max: 12 },
  { id: "D", max: 28 },
];

/** 64 — derived from the zones, not typed in twice. */
export const TCT_MAX_CLUSTERS = TCT_ZONES.reduce((sum, z) => sum + z.max, 0);

/** Most trainees one TCT booking can hold. */
export const TCT_MAX_TRAINEES = 256;

export type TCTZoneId = TCTZone["id"];

/** How many of `rows` sit in each zone (rows without a zone are not counted). */
export function zoneUsage(rows: { zone?: string }[]): { id: TCTZoneId; used: number; max: number }[] {
  return TCT_ZONES.map(z => ({ id: z.id, used: rows.filter(r => r.zone === z.id).length, max: z.max }));
}

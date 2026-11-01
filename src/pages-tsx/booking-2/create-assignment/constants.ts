// Booking 2.0 — Create Assignment. Confirmed against Figma node 5869:43239
// ("Create Assignment - Filled", Collective variant): Claymore, Cond Bino,
// and Drone are the only weapon-list entries shown as "Controlled Item" —
// every other entry (SAR21, LMG, M110, M203, MATADOR, PSLAM, GPMG, P30, and
// the two SPIKE variants which don't appear in the scanned example but share
// the same "Weapon" category as MATADOR/PSLAM) defaults to "Weapon".
export const CONTROLLED_ITEMS = new Set(["Claymore", "Cond Bino", "Drone"]);

export function assetTypeLabel(weaponType: string): "Controlled Item" | "Weapon" {
  return CONTROLLED_ITEMS.has(weaponType) ? "Controlled Item" : "Weapon";
}

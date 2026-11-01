/*
 * Resource Planning — mock data seeded 1:1 from Figma `Resource Planning - View`
 * (6875:125827). The page keeps everything in local state; nothing is persisted.
 *
 * Model (from the frame's own copy):
 *   - Resource Types: Pax is "Entered per role"; every other resource is
 *     "= sum of these weapons" — the weapons ticked for it.
 *   - System Limits: "Maximum per base station" — one number per resource × station.
 *   - Role Requirements: weapons × roles (how many of each weapon a role uses) + the role's Pax.
 *     "Resources Needed" per role = its Pax, and for every other resource the sum of the role's
 *     weapon counts over the weapons ticked for that resource.
 */

export const STATIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05"] as const;
export type Station = (typeof STATIONS)[number];

/** Figma's weapon row order (alphabetical) in Role Requirements and the Edit chip list. */
export const WEAPONS = [
  "Claymore",
  "Comd Bino",
  "Drone",
  "GPMG",
  "LMG",
  "M110",
  "MATADOR",
  "PSLAM",
  "SAR21",
  "SAR21+M203",
  "SPIKE LR",
  "SPIKE SR",
] as const;
export type Weapon = (typeof WEAPONS)[number];

export interface ResourceType {
  id: string;
  name: string;
  /** Built-in resource — lock icon, cannot be deleted (Figma: lock vs trash button). */
  locked: boolean;
  /** `pax` = "Entered per role"; `weapons` = "= sum of these weapons". */
  kind: "pax" | "weapons";
  weapons: Weapon[];
}

export type Limits = Record<string, Record<Station, number>>;

export interface Role {
  id: string;
  name: string;
  pax: number;
  /** Weapon → count. A missing / 0 entry renders as "—". */
  weapons: Partial<Record<Weapon, number>>;
}

export const INITIAL_RESOURCES: ResourceType[] = [
  { id: "pax", name: "Pax", locked: true, kind: "pax", weapons: [] },
  {
    id: "ports",
    name: "Ports",
    locked: true,
    kind: "weapons",
    weapons: ["Claymore", "GPMG", "LMG", "M110", "MATADOR", "PSLAM", "SAR21", "SAR21+M203"],
  },
  {
    id: "igs",
    name: "IGs",
    locked: true,
    kind: "weapons",
    weapons: ["Comd Bino", "Drone", "GPMG", "SPIKE LR", "SPIKE SR"],
  },
  { id: "monitors", name: "Monitors", locked: true, kind: "weapons", weapons: ["Drone"] },
  { id: "laser-emitters", name: "Laser Emitters", locked: false, kind: "weapons", weapons: [] },
];

const row = (a: number, b: number, c: number, d: number, e: number): Record<Station, number> => ({
  "WPT-01": a,
  "WPT-02": b,
  "WPT-03": c,
  "WPT-04": d,
  "WPT-05": e,
});

export const INITIAL_LIMITS: Limits = {
  pax: row(15, 13, 14, 15, 14),
  ports: row(11, 17, 8, 8, 8),
  igs: row(7, 1, 6, 7, 7),
  monitors: row(2, 0, 2, 2, 2),
  "laser-emitters": row(0, 0, 0, 0, 0),
};

/*
 * The 8 role columns Figma draws. Its section header reads "Role Requirements 11" and the
 * System Limits error tooltip (8060:57595) names two more roles — "SPIKE SR (MPAT)" and
 * "SPIKE LR (ATGM)" — but no frame gives their weapon/pax values, so they are not seeded
 * (open question in the F-005 report). The count shown is the real number of roles.
 */
export const INITIAL_ROLES: Role[] = [
  { id: "fo-oc", name: "F.O/OC", pax: 1, weapons: { "Comd Bino": 1 } },
  { id: "gpmg-team", name: "GPMG Team (STEELNET)", pax: 3, weapons: { Drone: 2, GPMG: 1 } },
  { id: "lmg", name: "LMG", pax: 2, weapons: { LMG: 2 } },
  { id: "m110-team", name: "M110 Team (SNIPERS)", pax: 2, weapons: { M110: 2, MATADOR: 4 } },
  { id: "m203", name: "M203", pax: 1, weapons: { Claymore: 2, "SAR21+M203": 1 } },
  { id: "matador", name: "MATADOR", pax: 2, weapons: { MATADOR: 2 } },
  { id: "pslam", name: "PSLAM (PIONEER)", pax: 3, weapons: { PSLAM: 1 } },
  { id: "sar21-gunner", name: "SAR21 GUNNER", pax: 1, weapons: { SAR21: 1 } },
];

/** How much of `resource` one `role` needs. */
export function roleNeed(role: Role, resource: ResourceType): number {
  if (resource.kind === "pax") return role.pax;
  return resource.weapons.reduce((sum, w) => sum + (role.weapons[w] ?? 0), 0);
}

export function newResourceId(name: string, taken: string[]): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resource";
  let id = base;
  let n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}

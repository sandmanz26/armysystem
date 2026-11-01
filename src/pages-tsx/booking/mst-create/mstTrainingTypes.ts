// MST Create Booking — Training Type list and what hangs off it (Figma 6068:92693 dropdown,
// 6183:422450 `Table - Body Cell - MST Role`).
//
// Figma's Training Type dropdown lists course names (MST_AdvanceDriving … MST_GunneryIA_CoaxialMG) and
// the Role chips in Cabin Configuration come in four variants (What = Standalone / Gunnery / Driving /
// SVBC). The mapping name → variant below is read from the names, not drawn in Figma — see the report.
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";

export type MstTrainingKind = "Standalone" | "Gunnery" | "Driving" | "SVBC";

export interface MstTrainingType { value: string; kind: MstTrainingKind }

/** The 7 names Figma's dropdown shows + MST_Standalone (used by every Standalone frame; the list is clipped at 297px). */
const FIGMA_TRAINING_TYPES: MstTrainingType[] = [
  { value: "MST_AdvanceDriving",        kind: "Driving" },
  { value: "MST_BasicDriving",          kind: "Driving" },
  { value: "MST_Gunnery_CoaxialMG",     kind: "Gunnery" },
  { value: "MST_Gunnery_HMG",           kind: "Gunnery" },
  { value: "MST_Gunnery_SGL",           kind: "Gunnery" },
  { value: "MST_Gunnery_AGL",           kind: "Gunnery" },
  { value: "MST_GunneryIA_CoaxialMG",   kind: "Gunnery" },
  { value: "MST_Standalone",            kind: "Standalone" },
];

/** The pre-Figma list, kept behind HIDDEN_FEATURES.mstLegacyTrainingTypes. */
const LEGACY_TRAINING_TYPES: MstTrainingType[] = [
  { value: "MST_Driving", kind: "Driving" },
  { value: "MST_Gunnery", kind: "Gunnery" },
  { value: "MST_Vehicle", kind: "SVBC" },
];

export function mstTrainingTypes(): MstTrainingType[] {
  return HIDDEN_FEATURES.mstLegacyTrainingTypes ? [...FIGMA_TRAINING_TYPES, ...LEGACY_TRAINING_TYPES] : FIGMA_TRAINING_TYPES;
}

export function mstTrainingKind(value: string): MstTrainingKind | null {
  return [...FIGMA_TRAINING_TYPES, ...LEGACY_TRAINING_TYPES].find((t) => t.value === value)?.kind ?? null;
}

/** Role chips per kind — Figma `Table - Body Cell - MST Role` variants. Driving shows VO only ("Only role for this training type"). */
export const MST_ROLES_BY_KIND: Record<MstTrainingKind, string[]> = {
  Standalone: ["VO", "VC", "TC", "SO", "SC"],
  SVBC:       ["VO", "VC", "TC", "SO", "SC"],
  Gunnery:    ["VC", "SC"],
  Driving:    ["VO"],
};

/** Standalone books up to 11 cabins ("Up to 11 cabins"); every other type is "Max 1". */
export const MST_MAX_CABINS_STANDALONE = 11;
export const mstMaxCabins = (kind: MstTrainingKind | null) => (kind === "Standalone" ? MST_MAX_CABINS_STANDALONE : 1);

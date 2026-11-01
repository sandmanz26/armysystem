import type { CreateAssignmentFormValues } from "./types";

export const INITIAL_FORM_VALUES: CreateAssignmentFormValues = {
  operator: "",
  personnelOperator: "",
  assignmentType: "",
  baseStation: "",
  courseware: "",
  bookingIds: [],
};

// Same classification as booking-2/create-assignment/constants.ts (duplicated
// rather than cross-imported — the two Issue Asset flows are deliberately
// isolated modules). Confirmed against Figma node 5869:43239 ("Create
// Assignment - Filled", Collective variant): Claymore, Cond Bino, and Drone
// are "Controlled Item"; everything else is "Weapon".
export const CONTROLLED_ITEMS = new Set(["Claymore", "Cond Bino", "Drone"]);

export function assetTypeLabel(weaponType: string): "Controlled Item" | "Weapon" {
  return CONTROLLED_ITEMS.has(weaponType) ? "Controlled Item" : "Weapon";
}

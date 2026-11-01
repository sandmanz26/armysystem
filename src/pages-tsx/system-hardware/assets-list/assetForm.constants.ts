/*
 * Options and defaults for the Add / Edit Asset form. Moved here from the
 * retired `asset-creation` page — Figma turned Add Asset into a drawer on the
 * Asset List, so this module owns the form now.
 */
import type { AssetCreationFormValues } from "./assetForm.types";

export const ASSET_CATEGORIES = [
  "Weapon",
  "Laptop Computer Device",
  "RFID Reader",
  "Siren",
  "Network Equipment",
  "Other",
];

export const ASSET_TYPES = [
  "SAR21",
  "LMG",
  "M16",
  "M203",
  "GPMG",
  "M110",
  "Lenovo Laptop",
  "RFID Reader",
  "Siren Unit",
];

/*
 * Figma `Add - Empty` (5133:51392) has no Hardware Info section, so Asset Tag
 * ID, Initial Status, Site / Location and Number of Layers are gone from the
 * form. A new asset is created as `Available` with no RFID tag (it shows on
 * the `No RFID` tab) — the same default the removed Initial Status field had.
 */
export const NEW_ASSET_STATUS = "Available" as const;

export const INITIAL_FORM_VALUES: AssetCreationFormValues = {
  assetName: "",
  assetCategory: "",
  assetType: "",
  serialNumber: "",
  remarks: "",
};

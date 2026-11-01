import type { AssetCategory } from "@/data/systemHardware";

export interface EditTarget {
  name: string;
  status: string;
  alert: string;
}

export interface AssetCategoryRow extends AssetCategory {
  _idx: number;
}

export const STATUS_OPTIONS = ["Active", "Inactive"] as const;
/* Figma `Dropdown - Alert Mode` (5159:114564) lists exactly these two. The
   previous values ("Critical Component" / "Non-Critical Component") appear
   nowhere in the design and did not match the Alert column's own data. */
export const ALERT_MODE_OPTIONS = ["Low Stock", "Maintenance Due"] as const;

export type StatusOption = (typeof STATUS_OPTIONS)[number];
export type AlertModeOption = (typeof ALERT_MODE_OPTIONS)[number];

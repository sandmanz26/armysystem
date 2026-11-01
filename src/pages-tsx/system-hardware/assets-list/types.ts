import type { AssetStatus } from "@/data/systemHardware";

/**
 * Figma `Tab Group v2` on `List - Full Table` (5133:38670), in this order.
 * Previously the set was missing `Available` and `Archived`, carried an
 * `Overdue` tab Figma does not have, and spelled the RFID one `No RFI`.
 */
export const TABS = [
  "Overall",
  "Available",
  "Issued",
  "Maintenance",
  "Pending Return",
  "Not Returned",
  "Missing",
  "No RFID",
  "Archived",
] as const;
export type Tab = (typeof TABS)[number];

export const TAB_STATUS_MAP: Partial<Record<Tab, AssetStatus>> = {
  Available: "Available",
  Issued: "Issued",
  Maintenance: "Maintenance",
  "Pending Return": "Pending Return",
  "Not Returned": "Not Returned",
  Missing: "Missing",
};

export interface AssetsListProps {
  onNavigate?: (path: string) => void;
}

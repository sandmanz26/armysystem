export const TABS = ["RFID Details", "Activities", "Disposal List"] as const;
export type Tab = (typeof TABS)[number];

export interface AssetDetailProps {
  /** Figma page header: `Edit Asset` (primary) and `Move to Archive` (secondary). */
  onEdit?: (asset: any) => void;
  onArchive?: (asset: any) => void;
  assetId?: string;
  onNavigate?: (path: string) => void;
}

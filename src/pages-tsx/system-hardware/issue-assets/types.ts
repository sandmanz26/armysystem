export interface ScannedAsset {
  id: string;
  no: number;
  name: string;
  assetTagId: string;
  assetType: string;
  assetCategory: string;
  status: "Available" | "Issued";
  targetBaseStation: string;
  targetLane: string;
}

export type Phase = "scanning" | "scanned";

export interface IssueAssetsProps {
  onNavigate?: (path: string) => void;
}

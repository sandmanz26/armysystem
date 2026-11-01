export interface ScannedAsset {
  id: string;
  no: number;
  name: string;
  assetTagId: string;
  assetType: string;
  assetCategory: string;
  status: "Available" | "Issued" | "Pending Return";
  targetBaseStation: string;
  targetLane: string;
}

export type Phase = "scanning" | "scanned";

/** `issue` = the original Issue Assets flow; `topup` / `return` = F-009 (see scanMode.ts). */
export type ScanMode = "issue" | "topup" | "return";

export interface IssueAssetsProps {
  onNavigate?: (path: string) => void;
}

import type { AssetType as AssetTypeData } from "@/data/systemHardware";

export type { AssetTypeData };

export interface AssetTypeRow extends AssetTypeData {
  _idx: number;
}

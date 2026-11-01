import type { MasterDataItem } from "@/data/mstTctMasterData";

export type { MasterDataItem };

export interface MasterDataRow extends MasterDataItem {
  _idx: number;
}

export type MasterDataEntityKey = "platformType" | "callSign" | "role" | "vehicle";

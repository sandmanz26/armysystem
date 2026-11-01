import type { AntennaEntry } from "@/data/rfidConfig";

export type { AntennaEntry };

export interface AntennaRow extends AntennaEntry {
  _idx: number;
}

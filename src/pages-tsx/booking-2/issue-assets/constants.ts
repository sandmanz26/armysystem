import type { ScannedAsset } from "./types";

// Flat Screen / C-Shaped master station lists (mirrors booking/detail's naming).
// Flat Screen stations always have a fixed 15-lane layout; C-Shaped stations
// have a dynamic lane count configured per-station at Create Booking time.
export const FLAT_STATION_OPTIONS = ["WPT-01", "WPT-02", "WPT-03", "WPT-04", "WPT-05", "WPT-06"];
export const CSHAPED_STATION_OPTIONS = ["C-Shaped 01", "C-Shaped 02", "C-Shaped 03"];

export const BASE_STATION_OPTIONS = [...FLAT_STATION_OPTIONS, ...CSHAPED_STATION_OPTIONS];

export const FLAT_LANE_COUNT = 15;

// Mock per-station lane counts for C-Shaped stations (dynamic, unlike Flat Screen's fixed 15).
export const CSHAPED_LANE_COUNTS: Record<string, number> = {
  "C-Shaped 01": 4,
  "C-Shaped 02": 3,
  "C-Shaped 03": 5,
};

export function isCShapedStation(station: string): boolean {
  return station.startsWith("C-Shaped");
}

export function getLaneOptions(station: string): string[] {
  const count = isCShapedStation(station)
    ? CSHAPED_LANE_COUNTS[station] ?? 4
    : FLAT_LANE_COUNT;
  return Array.from({ length: count }, (_, i) => `Lane ${i + 1}`);
}

export const DUMMY_SCANNED_ASSETS: ScannedAsset[] = [
  {
    id: "sa1",
    no: 1,
    name: "SAR21 Unit A",
    assetTagId: "260427-SAR21001",
    assetType: "SAR21",
    assetCategory: "Weapon",
    status: "Available",
    targetBaseStation: "WPT-03",
    targetLane: "Lane 1",
  },
  {
    id: "sa2",
    no: 2,
    name: "SAR21 Unit B",
    assetTagId: "260427-SAR21002",
    assetType: "SAR21",
    assetCategory: "Weapon",
    status: "Available",
    targetBaseStation: "WPT-03",
    targetLane: "Lane 2",
  },
  {
    id: "sa3",
    no: 3,
    name: "GPMG Unit A",
    assetTagId: "260427-GPMG001",
    assetType: "GPMG",
    assetCategory: "Weapon",
    status: "Available",
    targetBaseStation: "WPT-03",
    targetLane: "Lane 3",
  },
  {
    id: "sa4",
    no: 4,
    name: "SPIKE SR Unit A",
    assetTagId: "260427-SPKSR001",
    assetType: "SPIKE SR",
    assetCategory: "Weapon",
    status: "Available",
    targetBaseStation: "C-Shaped 01",
    targetLane: "Lane 1",
  },
  // Deliberately a 2nd SAR21 (required qty for this demo booking is 1) — demonstrates
  // the over-scanned state/warning in the Assets to Withdraw panel out of the box.
  {
    id: "sa5",
    no: 5,
    name: "SAR21 Unit C",
    assetTagId: "260427-SAR21003",
    assetType: "SAR21",
    assetCategory: "Weapon",
    status: "Available",
    targetBaseStation: "WPT-03",
    targetLane: "Lane 4",
  },
];

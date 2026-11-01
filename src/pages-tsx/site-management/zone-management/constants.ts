import type { BlackoutDate } from "../components/BlackoutDatesPanel";
import type { Cluster, Zone } from "./types";

export const PER_PAGE = 10;
export const STATUS_OPTIONS: Cluster["status"][] = ["Available", "Unavailable", "Degraded"];

export const INITIAL_ZONES: Zone[] = [
  { id: "z01", name: "Zone A" },
  { id: "z02", name: "Zone B" },
  { id: "z03", name: "Zone C" },
];

const mockBlackout = (id: string, startDate: string, endDate = startDate): BlackoutDate => ({
  id, startDate, endDate, startTime: "08:00 AM", endTime: "05:00 PM", recurringDays: [],
});

// The 12 clusters that used to be one flat list, split across the 3 example
// zones above (4 each) — an example grouping, not data from any spec.
export const INITIAL_CLUSTERS: Cluster[] = [
  { id: "c01", zoneId: "z01", name: "TCT01", clusterId: "TCT-CLUSTER-01", status: "Available",   blackoutDates: [mockBlackout("cbo1","2025-01-08"),mockBlackout("cbo2","2025-02-09"),mockBlackout("cbo3","2025-02-10"),mockBlackout("cbo4","2025-03-15")], updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c02", zoneId: "z01", name: "TCT02", clusterId: "TCT-CLUSTER-02", status: "Unavailable", blackoutDates: [mockBlackout("cbo5","2025-01-08")],                                                                                                          updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c03", zoneId: "z01", name: "TCT03", clusterId: "TCT-CLUSTER-03", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c04", zoneId: "z01", name: "TCT04", clusterId: "TCT-CLUSTER-04", status: "Degraded",    blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c05", zoneId: "z02", name: "TCT05", clusterId: "TCT-CLUSTER-05", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c06", zoneId: "z02", name: "TCT06", clusterId: "TCT-CLUSTER-06", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c07", zoneId: "z02", name: "TCT07", clusterId: "TCT-CLUSTER-07", status: "Degraded",    blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c08", zoneId: "z02", name: "TCT08", clusterId: "TCT-CLUSTER-08", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c09", zoneId: "z03", name: "TCT09", clusterId: "TCT-CLUSTER-09", status: "Unavailable", blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c10", zoneId: "z03", name: "TCT10", clusterId: "TCT-CLUSTER-10", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c11", zoneId: "z03", name: "TCT11", clusterId: "TCT-CLUSTER-11", status: "Available",   blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
  { id: "c12", zoneId: "z03", name: "TCT12", clusterId: "TCT-CLUSTER-12", status: "Degraded",    blackoutDates: [],                                                                                                                                             updatedOn: "10 January 2025\n08:00:00 AM" },
];

import type { BlackoutDate } from "../components/BlackoutDatesPanel";

/*
 * CMS Zone / CMS Cluster — a double layer added on top of what used to be a
 * single flat "Cluster Management" list. One zone can hold many clusters;
 * a cluster now belongs to exactly one zone (`zoneId`).
 *
 * Zone's own fields are deliberately just `id` and `name` — nothing else was
 * asked for, so nothing else was added (no status, no timestamp).
 */
export interface Zone {
  id: string;
  name: string;
}

export type ClusterStatus = "Available" | "Unavailable" | "Degraded";

export interface Cluster {
  id: string;
  zoneId: string;
  name: string;
  clusterId: string;
  status: ClusterStatus;
  blackoutDates: BlackoutDate[];
  updatedOn: string;
}

export type View = { type: "list" } | { type: "zone"; zone: Zone };

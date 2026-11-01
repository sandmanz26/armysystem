import { useState } from "react";
import type { BlackoutDate } from "../components/BlackoutDatesPanel";
import { INITIAL_ZONES, INITIAL_CLUSTERS } from "./constants";
import { ZoneList } from "./components/ZoneList";
import { ZoneDetail } from "./components/ZoneDetail";
import type { Cluster, ClusterStatus, View, Zone } from "./types";

/*
 * CMS Zone / CMS Cluster — a double layer added on top of what used to be a
 * single flat "Cluster Management" list, at the user's request: one Zone can
 * hold many Clusters. Navigation mirrors this app's own Site Management ->
 * Base Station Details -> Lane Details pattern (view-state switch on one
 * route, not a real page navigation) rather than inventing a new one.
 */
export function ZoneManagement() {
  const [view, setView] = useState<View>({ type: "list" });
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [clusters, setClusters] = useState<Cluster[]>(INITIAL_CLUSTERS);

  const handleAddZone = (data: { name: string }) => {
    setZones((prev) => [...prev, { id: `z-${Date.now()}`, ...data }]);
  };

  const handleEditZone = (zone: Zone, data: { name: string }) => {
    setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, ...data } : z)));
    setView((prev) => (prev.type === "zone" && prev.zone.id === zone.id ? { type: "zone", zone: { ...zone, ...data } } : prev));
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    setClusters((prev) => prev.filter((c) => c.zoneId !== zoneId));
  };

  const handleAddCluster = (zoneId: string, data: { name: string; clusterId: string; status: ClusterStatus }) => {
    const now = new Date();
    setClusters((prev) => [...prev, {
      id: `c-${Date.now()}`,
      zoneId,
      ...data,
      blackoutDates: [],
      updatedOn: `${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}\n${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
    }]);
  };

  const handleEditCluster = (clusterId: string, data: { name: string; clusterId: string; status: ClusterStatus }) => {
    setClusters((prev) => prev.map((c) => (c.id === clusterId ? { ...c, ...data } : c)));
  };

  const handleUpdateBlackoutDates = (clusterId: string, next: BlackoutDate[]) => {
    setClusters((prev) => prev.map((c) => (c.id === clusterId ? { ...c, blackoutDates: next } : c)));
  };

  const handleDeleteCluster = (clusterId: string) => setClusters((prev) => prev.filter((c) => c.id !== clusterId));
  const handleDeleteClusters = (clusterIds: string[]) =>
    setClusters((prev) => prev.filter((c) => !clusterIds.includes(c.id)));

  if (view.type === "zone") {
    const zone = zones.find((z) => z.id === view.zone.id) ?? view.zone;
    return (
      <ZoneDetail
        zone={zone}
        clusters={clusters.filter((c) => c.zoneId === zone.id)}
        onBack={() => setView({ type: "list" })}
        onAddCluster={(data) => handleAddCluster(zone.id, data)}
        onEditCluster={handleEditCluster}
        onDeleteCluster={handleDeleteCluster}
        onDeleteClusters={handleDeleteClusters}
        onUpdateBlackoutDates={handleUpdateBlackoutDates}
      />
    );
  }

  return (
    <ZoneList
      zones={zones}
      clusters={clusters}
      onView={(zone) => setView({ type: "zone", zone })}
      onAdd={handleAddZone}
      onEdit={handleEditZone}
      onDelete={handleDeleteZone}
    />
  );
}

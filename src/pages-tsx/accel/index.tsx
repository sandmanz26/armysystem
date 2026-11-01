import { Navigate, useParams } from "react-router-dom";
import { Icon } from "@/components/icon";
import { AccelLayout, ACCEL_NAV } from "./AccelLayout";
import { Dashboard } from "./dashboard";
import { DetectionFeed } from "./detection-feed";
import { LiveMonitoring } from "./live-monitoring";

/*
 * Accel — a separate app opened in its own browser tab from TOMS's SYSTEM menu
 * (see NEW_TAB_PATHS in App.tsx). Own shell, own routes under /accel/*; it is
 * deliberately outside TOMS's MainLayout. Dashboard, Live Monitoring and
 * Detection Feed have a design so far (reference screenshots, 6 Oct 2026); the other nav items are listed
 * as drawn but open an empty page until they have one. No Figma page, no PRD.
 */
export function Accel() {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/login" replace />;
  }
  return <AccelRoutes />;
}

function AccelRoutes() {
  const { section } = useParams();
  const item = ACCEL_NAV.find((n) => n.slug === section);
  if (!item) return <Navigate to="/accel/dashboard" replace />;

  return (
    <AccelLayout>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="text-body">{item.group}</span>
        <Icon name="chevron-right" size={14} className="text-body" />
        <span className="text-default">{item.label}</span>
      </div>
      {item.slug === "dashboard" ? (
        <Dashboard />
      ) : item.slug === "live-monitoring" ? (
        <LiveMonitoring />
      ) : item.slug === "detection-feed" ? (
        <DetectionFeed />
      ) : (
        <h1 className="text-xl font-semibold text-default">{item.label}</h1>
      )}
    </AccelLayout>
  );
}

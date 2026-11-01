/*
 * Mock data for Accel → Live Monitoring, read off the reference screenshots
 * the product owner sent on 6 Oct 2026 (there is no Figma page or PRD for
 * Accel yet). Anything the screenshots do not show is marked ASSUMED.
 */

import type { Severity } from "../shared";

export interface Camera {
  id: string; // "Cam-01"
  online: boolean;
  /** Open detections on this camera. 0 = no badge. */
  detections: number;
  /** Highest severity among them — colours the badge. ASSUMED: the screenshots show one yellow for all. */
  top?: Severity;
  /** Offline cameras: when the signal was lost. ASSUMED. */
  lastSeen?: string;
  site: string;
  /** Cropped from the screenshot; offline cameras have none. */
  feed?: string;
}

export const SITES = ["Cargo Hub Cresthaven", "Ashford Naval"] as const;

// Site per camera: Cam-01/04/15 and Cam-12 come from the detection cards in the
// screenshots. The other seven are ASSUMED so the site filter has something to do.
export const CAMERAS: Camera[] = [
  { id: "Cam-01", online: true, detections: 0, site: "Cargo Hub Cresthaven", feed: "/accel-feeds/cam-01.jpg" },
  { id: "Cam-04", online: true, detections: 3, site: "Cargo Hub Cresthaven", feed: "/accel-feeds/cam-04.jpg", top: "critical" },
  { id: "Cam-07", online: true, detections: 1, site: "Cargo Hub Cresthaven", feed: "/accel-feeds/cam-07.jpg", top: "low" },
  { id: "Cam-09", online: true, detections: 3, site: "Cargo Hub Cresthaven", feed: "/accel-feeds/cam-09.jpg", top: "medium" },
  { id: "Cam-12", online: true, detections: 2, site: "Ashford Naval", feed: "/accel-feeds/cam-12.jpg", top: "critical" },
  { id: "Cam-15", online: true, detections: 0, site: "Cargo Hub Cresthaven", feed: "/accel-feeds/cam-15.jpg" },
  { id: "Cam-18", online: true, detections: 3, site: "Ashford Naval", feed: "/accel-feeds/cam-18.jpg", top: "medium" },
  { id: "Cam-22", online: true, detections: 3, site: "Ashford Naval", feed: "/accel-feeds/cam-22.jpg", top: "critical" },
  { id: "Cam-24", online: false, detections: 0, site: "Ashford Naval", lastSeen: "Yesterday 22:05" },
  { id: "Cam-30", online: false, detections: 2, site: "Ashford Naval", top: "low", lastSeen: "09:12" },
  { id: "Cam-32", online: false, detections: 4, site: "Cargo Hub Cresthaven", top: "critical", lastSeen: "06:40" },
];

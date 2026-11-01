import type { BadgeTone } from "@/components/status-badge";
import type { DetailStatus } from "./session";

// Figma `Badge - Ongoing Session Detail List Status` (5520:437962).
export const STATUS_TONE: Record<DetailStatus, BadgeTone> = {
  Completed: "success",
  Ready: "info",
  "In Queue": "warning",
  Pending: "neutral",
};

import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import type { AccountStatusBadgeProps } from "../types";

/** User List's own status → tone mapping; the pill itself is the shared one. */
const TONE: Record<string, BadgeTone> = {
  Active: "success",
  Archived: "warning",
};

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  return <StatusBadge tone={TONE[status] ?? "neutral"}>{status}</StatusBadge>;
}

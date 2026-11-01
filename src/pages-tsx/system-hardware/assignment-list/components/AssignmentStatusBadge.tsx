import { cn } from "@/lib/utils";
import type { AssignmentStatus } from "@/data/systemHardware";

/**
 * Figma `Badge - Assignment Status` → inner `Badge`, resolved from the
 * Assignment List full table (5154:76301) and reused on Assignment Details
 * (5839:148780). Pill: radius 9999, padding 2/8, 12 Medium.
 *
 * Every pair below is the variable NAME Figma binds, not a lookalike:
 *   Issued                 background/purple/invert/default  · border/invert/purple  · text/purple
 *   Pending Return          background/warning/invert/default · border/invert/warning · text/warning
 *   Returned                background/success/invert/default · border/invert/success · text/success
 *   Missing                 background/danger/invert/default  · border/invert/danger  · text/danger
 *   Ownership Transferred   text/success in the list table — same triplet as Returned
 *   Ownership Received      text/purple in the list table — same triplet as Issued
 *
 * `Return Assets` carries the same triplet as `Pending Return` in Figma.
 * `Not Returned` has no badge in the file — it exists only as a tab — so it
 * follows Missing's danger triplet, which is the nearest stated intent.
 */
const STATUS_STYLES: Record<AssignmentStatus, string> = {
  Issued: "bg-purple-invert-default text-purple border-invert-purple",
  Returned: "bg-success-invert-default text-success border-invert-success",
  "Pending Return": "bg-warning-invert-default text-warning border-invert-warning",
  "Not Returned": "bg-danger-invert-default text-danger border-invert-danger",
  Missing: "bg-danger-invert-default text-danger border-invert-danger",
  "Return Assets": "bg-warning-invert-default text-warning border-invert-warning",
  "Ownership Transferred": "bg-success-invert-default text-success border-invert-success",
  "Ownership Received": "bg-purple-invert-default text-purple border-invert-purple",
};

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border text-xs font-medium px-2 py-0.5",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

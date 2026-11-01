import { cn } from "@/lib/utils";
import type { AssetStatus } from "@/data/systemHardware";

interface AssetStatusBadgeProps {
  status: AssetStatus;
}

/**
 * Figma `Badge` in the Asset List status column (`List - Full Table`,
 * 5133:38670). Every pair below is the variable NAME Figma binds, resolved
 * from the frame rather than matched by eye:
 *
 *   Available       background/success/invert/default · text/success
 *   Issued          background/purple/invert/default  · text/purple
 *   Pending Return  background/warning/invert/default · text/warning
 *   Not Returned    background/danger/invert/default  · text/danger
 *   Missing         background/danger/invert/default  · text/danger
 *   Maintenance     background/danger/invert/default  · text/danger
 *
 * Five of these were wrong before, and two in the way this file keeps getting
 * wrong (cf. AssignmentStatusBadge): `Pending Return` sat on the ORANGE family
 * where Figma uses warning, and `Missing` was a neutral grey where Figma uses
 * danger — so the state that needs attention read as the calmest one.
 *
 * `Overdue` has no row in Figma's sample; it follows the other danger states.
 */
const STATUS_STYLES: Record<AssetStatus, string> = {
  Available: "bg-success-invert-default text-success border-invert-success",
  Issued: "bg-purple-invert-default text-purple border-invert-purple",
  "Pending Return": "bg-warning-invert-default text-warning border-invert-warning",
  "Not Returned": "bg-danger-invert-default text-danger border-invert-danger",
  Missing: "bg-danger-invert-default text-danger border-invert-danger",
  Maintenance: "bg-danger-invert-default text-danger border-invert-danger",
  Overdue: "bg-danger-invert-default text-danger border-invert-danger",
};

export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  return (
    <span
      className={cn(
        // Figma pill: radius full, 2/8 padding, 12 Medium.
        "inline-flex items-center rounded-full border text-xs font-medium px-2 py-0.5",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

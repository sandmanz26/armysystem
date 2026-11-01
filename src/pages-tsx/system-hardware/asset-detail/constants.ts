/**
 * Figma `Badge - Asset Status` — the SAME badge as the Asset List's status
 * column (5133:38670), so the same variables. This copy had drifted: Issued on
 * purple-50, Pending Return on the ORANGE family where Figma uses warning,
 * Missing neutral where Figma uses danger, Maintenance on yellow.
 */
export const ASSET_STATUS_STYLES: Record<string, string> = {
  Available: "bg-success-invert-default text-success border-invert-success",
  Issued: "bg-purple-invert-default text-purple border-invert-purple",
  "Pending Return": "bg-warning-invert-default text-warning border-invert-warning",
  "Not Returned": "bg-danger-invert-default text-danger border-invert-danger",
  Missing: "bg-danger-invert-default text-danger border-invert-danger",
  Maintenance: "bg-danger-invert-default text-danger border-invert-danger",
  Overdue: "bg-danger-invert-default text-danger border-invert-danger",
};

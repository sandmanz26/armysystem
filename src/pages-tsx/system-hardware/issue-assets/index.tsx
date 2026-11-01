import { ScanFlowView } from "@/pages-tsx/booking-2/issue-assets/components/ScanFlowView";
import { readScanMode } from "@/pages-tsx/booking-2/issue-assets/scanMode";
import type { IssueAssetsProps } from "./types";

/**
 * System Hardware route of Scan Assets (Issue / Top Up / Scan & Return). One view for all three
 * modes, shared with Booking 2.0 — see booking-2/issue-assets/index.tsx and scanMode.ts.
 */
export function IssueAssets(props: IssueAssetsProps) {
  const mode = readScanMode();
  return <ScanFlowView key={mode} mode={mode} onNavigate={props.onNavigate} />;
}

import { ScanFlowView } from "./components/ScanFlowView";
import { readScanMode } from "./scanMode";
import type { IssueAssetsProps } from "./types";

/**
 * Scan Assets (Step 2 of Issue Asset, and Top Up / Scan & Return).
 *
 * F-009: `mode=topup|return`. F-010 (SH-3 / SH-15 / SH-16): no mode = Issue, built from Create
 * Assignment's URL params (`bookingIds` / `cw` for a Booking, `type` + `reason` for Administration /
 * Maintenance — see scanMode.ts). All three modes are one view (ScanFlowView), as in Figma; the
 * System Hardware route (`/system-hardware/issue-assets`) renders the same one.
 */
export function IssueAssets2(props: IssueAssetsProps) {
  const mode = readScanMode();
  return <ScanFlowView key={mode} mode={mode} onNavigate={props.onNavigate} />;
}

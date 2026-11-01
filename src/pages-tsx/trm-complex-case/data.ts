// Reference list of complex, cross-module QA test cases for TOMS.
// "Complex" here specifically means: the case only exercises real behavior
// when 2+ modules are chained together (e.g. a booking action that then
// depends on asset state, which then shows up in a report) — single-module
// happy-path cases belong in the regular test plan, not here.

export interface ComplexCase {
  id: string;
  title: string;
  modules: string[];
  precondition: string;
  steps: string[];
  expected: string;
  priority: "High" | "Medium" | "Low";
}

export const COMPLEX_CASES: ComplexCase[] = [
  {
    id: "TC-CX-001",
    title: "Issue Assets from Booking Detail reflects correctly in Assignment List and Assets List",
    modules: ["Booking", "System Hardware — Assignment List", "System Hardware — Assets List"],
    precondition: "An Upcoming WPT booking exists with no assets issued yet.",
    steps: [
      "Open the booking's detail page and click \"Issue Assets\".",
      "Complete the assignment form (Operator, Armskote Personnel, Assignment Type, Base Station) with the booking pre-locked, pick a courseware, and confirm the weapons to withdraw.",
      "Submit the assignment.",
      "Navigate to System Hardware → Assignment List and locate the new assignment.",
      "Navigate to System Hardware → Assets List and check the status of each withdrawn asset.",
    ],
    expected:
      "The new assignment appears in Assignment List linked to the correct booking ID. Each withdrawn asset's status in Assets List changes to \"Issued\" with the correct Issued Date — no asset should still show \"Available\".",
    priority: "High",
  },
  {
    id: "TC-CX-002",
    title: "Archiving an asset with an active assignment is blocked or reflected consistently",
    modules: ["System Hardware — Assets List", "System Hardware — Assignment List", "Booking"],
    precondition: "An asset is currently Issued against an Ongoing booking.",
    steps: [
      "Go to Assets List and attempt to Archive the Issued asset.",
      "Confirm the archive action in the dialog.",
      "Check Assignment List for the booking that had this asset issued.",
      "Check the booking's own Booking Detail page.",
    ],
    expected:
      "Either the archive is blocked with a clear reason (asset currently issued), or — if archiving is allowed — the Assignment List and Booking Detail both continue to show the asset issue record consistently (no orphaned or contradictory state between the three pages).",
    priority: "High",
  },
  {
    id: "TC-CX-003",
    title: "Completing WPT onboarding produces a Training Result and a correct Detail List",
    modules: ["Booking Onboarding", "Training Results", "Detail List"],
    precondition: "An Upcoming WPT booking with a full nominal roll and lane configuration.",
    steps: [
      "Start Onboarding on the booking, scan/confirm the nominal roll, confirm the Station & Lane Assignment, and confirm the Detail List.",
      "Complete the live training session (or simulate completion).",
      "Open Training Results (or Training Results 2.0) and locate the corresponding entry.",
      "Open its Detail List tab.",
    ],
    expected:
      "A new Training Result record appears with matching booking ID, courseware, and trainee count. The Detail List tab's station/lane breakdown matches exactly what was confirmed during onboarding (same stations, same trainee-to-lane mapping).",
    priority: "High",
  },
  {
    id: "TC-CX-004",
    title: "MST+TCT shared booking shows consistent, rail-scoped data across Booking Detail, Training Results, and Asset Report",
    modules: ["MST/TCT Booking Detail", "Training Results", "Asset Report"],
    precondition: "A shared MST+TCT booking (systemType \"MST TCT\") exists with completed training.",
    steps: [
      "View the booking from the MST rail — note the title and which columns/tabs appear.",
      "View the same booking from the TCT rail — note the title and which columns/tabs appear.",
      "Check Training Results on both the MST and TCT rails for this booking.",
      "Check the Asset Audit / Asset Movement report for assets tied to this booking.",
    ],
    expected:
      "MST rail shows only the MST/Cabin column and \"MST Training for Unit X\"; TCT rail shows only the TCT/Cluster column and \"TCT Training for Unit X\" — never a mix, and never the other programme's name. Training Results shows this booking under TCT only (not duplicated under MST). Asset Report entries tie back to the correct programme.",
    priority: "Medium",
  },
  {
    id: "TC-CX-005",
    title: "RFID heartbeat loss triggers System Health alert, Activity Log entry, and blocks new Issue Assets at that station",
    modules: ["System Health", "Activity Log", "Booking — Issue Assets"],
    precondition: "A base station's RFID reader is online and healthy.",
    steps: [
      "Simulate the RFID reader going offline (or use the System Health \"Run BIT\" / simulate-failure control if available).",
      "Check System Health / System Health 2.0 for a Needs Attention entry for that station.",
      "Check Activity Log for a corresponding entry (filtered by Program + Module = SHM).",
      "Attempt to Issue Assets at the same base station from a booking.",
    ],
    expected:
      "System Health shows the station as degraded/offline in Needs Attention. Activity Log records the outage with the correct Program and Module. Issue Assets either warns the operator that the station's RFID is offline, or proceeds but the resulting assignment is flagged for manual verification — behavior should be consistent with what System Health reports, not silently normal.",
    priority: "Medium",
  },
  {
    id: "TC-CX-006",
    title: "Asset Audit \"Not Found\" result flows through to Asset Tracking and Assets List status",
    modules: ["Reports — Asset Audit Report", "System Hardware — Asset Tracking", "System Hardware — Assets List"],
    precondition: "An asset currently shows \"Available\" in Assets List.",
    steps: [
      "Go to Reports → Asset Audit Report → Generate Report.",
      "Scan/select the asset with RFID and leave the without-RFID equivalent unselected, so it comes back \"Not Found\" in the audit results.",
      "Generate the audit and confirm.",
      "Check the asset's status in Asset Tracking → Asset List.",
      "Check the same asset's status in Assets List.",
    ],
    expected:
      "The audit report shows the asset as \"Not Found\". Asset Tracking and Assets List both reflect an updated status for that asset (e.g. \"Missing\") consistently — the two pages must never disagree on the same asset's status.",
    priority: "Medium",
  },
  {
    id: "TC-CX-007",
    title: "Reshoot (WPT Live Results) creates a new Detail that appears correctly in Detail List and Training Results",
    modules: ["Booking — Live Results / Reshoot", "Detail List", "Training Results"],
    precondition: "An Ongoing WPT booking with at least one Detail already trained, some trainees Failed.",
    steps: [
      "Open Live Results, select several Failed trainees from the same station, and click \"Create New Detail\".",
      "Pick the practice/courseware for the reshoot and confirm.",
      "Return to the Details grid and check the new Detail card.",
      "Check the Detail List tab for the same booking.",
      "Check Training Results for updated pass/fail counts.",
    ],
    expected:
      "A new Detail appears under the correct station with the right trainee count and any skipped-trainee toast message. Detail List shows the new detail consistently. Training Results' pass/fail totals update to reflect the reshoot outcome once the new detail is completed.",
    priority: "Medium",
  },
  {
    id: "TC-CX-008",
    title: "System Maintenance \"Clear Logs\" does not remove entries still referenced by an open Activity Log filter",
    modules: ["System Maintenance — ICD Logs", "Activity Log"],
    precondition: "ICD Logs exist for a given date, and at least one Activity Log entry references the same date/module (SHM).",
    steps: [
      "Open System Maintenance → ICD Logs for a specific date and note the log count.",
      "Click Clear Logs and confirm.",
      "Go to Activity Log, filter by Program + Module = SHM, and filter to the same date.",
    ],
    expected:
      "ICD Logs for that date now shows 0 entries (with the \"No logs to show\" empty state). Activity Log's own historical entries for that date are unaffected by the ICD Logs clear — the two logs are independent audit trails and clearing one must never silently clear or corrupt the other.",
    priority: "Low",
  },
  {
    id: "TC-CX-009",
    title: "Switching \"Super\" nav structure mid-session preserves in-progress Booking + Onboarding state",
    modules: ["Global — Nav Switcher", "Booking Onboarding"],
    precondition: "A booking's onboarding flow is partway through (e.g. nominal roll scanned, not yet confirmed).",
    steps: [
      "While in the middle of onboarding, open the Dev Toolbar and toggle Navbar Structure from Super to Default (or vice versa).",
      "Return to the booking.",
    ],
    expected:
      "The onboarding flow resumes at the same step with the same scanned data — switching the navbar/layout preference must not reset or lose in-progress booking/onboarding state.",
    priority: "Low",
  },
  {
    id: "TC-CX-010",
    title: "Deleting/archiving an Asset Type used by an existing Asset does not orphan that asset's records",
    modules: ["System Hardware — Asset Type", "System Hardware — Assets List", "Reports — Asset Audit Report"],
    precondition: "An Asset Type (e.g. \"RFID Reader\") is in use by one or more assets in Assets List.",
    steps: [
      "Go to System Hardware Management → Asset Type and attempt to delete/archive the in-use Asset Type.",
      "Check Assets List for assets that used that type.",
      "Generate a new Asset Audit Report covering those assets.",
    ],
    expected:
      "The system either blocks deleting an Asset Type still in use (with a clear message), or the affected assets in Assets List retain a valid (not blank/broken) Asset Type value. The Asset Audit Report must still render those assets' rows without errors or missing columns.",
    priority: "Medium",
  },
];

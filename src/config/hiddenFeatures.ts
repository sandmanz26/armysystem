/**
 * Capabilities that the product owner still needs but that are NOT shown in the
 * Figma-matching UI. Flip a flag to true to bring the old behaviour back.
 * All false = UI exactly as in Figma.
 */
export const HIDDEN_FEATURES = {
  /** Create/Issue Assignment: pick a target lane per asset (per-row lane select). */
  targetLanePerAsset: false,
  /** Create/Issue Assignment: bulk-assign lanes to selected assets. */
  bulkAssignLanes: false,
  /** Create Assignment: success modal after creating (with "View Assignment"). */
  successModal: false,
  /** Issue Assets scan flow: auto-scan timer that simulates scans automatically. */
  autoScanTimer: false,
  /** Admin: base-station dropdown in the assignment/issue-asset views. */
  adminBaseStationDropdown: false,
  /** Activity Log: CSV/XLSX export choice. */
  activityLogCsvXlsExport: false,
  /** Activity Log: single-day date picker. */
  activityLogSingleDayPicker: false,
  /** Header search: programme tabs. */
  searchProgrammeTabs: false,
  /** Create Booking > Schedule: "Full Day (Multiple Dates)" option and the Ad-hoc custom date RANGE
   *  (Figma shows only AM, PM, Full Day single date, Ad-hoc single date with flexible time). */
  scheduleFullDayMultipleDates: false,
  /** Onboarding > Detail List: a second "Confirm Detail List" button beside "Edit Detail List"
   *  (Figma has only the one in the wizard header). */
  detailListInlineConfirm: false,
  /** Ongoing Session > Create New Detail drawer: the "Booking Type" section (Select All + Stage A-E).
   *  Figma's drawer has only Base Station. Stages are sent as [] while hidden. */
  createDetailBookingType: false,
  /** MST Create Booking > Booking Details: the pre-Figma Training Type list (MST_Driving, MST_Gunnery,
   *  MST_Vehicle) next to Figma's course names (MST_AdvanceDriving, MST_BasicDriving, MST_Gunnery_*,
   *  MST_Standalone). Figma's Training Type dropdown (6068:92693) only lists the course names. */
  mstLegacyTrainingTypes: false,
  /** MST Create Booking > Cabin Configuration: the per-IOS "Master IOS" Yes/No switch. Figma (6189:133869)
   *  has none: IOS 1 is always the Master and IOS 2-4 are "Optional". While hidden, IOS 1 is saved as
   *  Master: Yes and the others as Master: No. */
  mstMasterIosToggle: false,
  /** MST Create Booking > Nominal Roll: the floating "Show 3 / 5 / 10 / 15" pill that re-seeds the mock roll of the
   *  open IOS tab (prototype demo control, not in Figma). */
  mstRollDemoSwitcher: false,
} as const;

export type HiddenFeatureKey = keyof typeof HIDDEN_FEATURES;

export type Status =
  | "Passed" | "Failed"
  | "Running" | "Unknown" | "Battery Low" | "Not Found"
  | "Not Running" | "Ok" | "Jammed" | "Shutting Down" | "Low"
  | "Connected";

export interface StationStatus {
  station: string;
  status: Status;
}

export interface SubCheck {
  label: string;
  status: Status;
  errorMessage: string;
}

export interface CheckItem {
  label: string;
  status: Status;
  info?: { description: string; errorMessage: string };
  /** TRX hardware isn't a single global unit — each item exists per base station.
   *  `status` above stays as the headline/representative status; this array is
   *  the per-station breakdown backing the "2/3 Running" style count. */
  perStation?: StationStatus[];
  /** BIT (TOMS)/HUMS (TOMS) items drill one level deeper into named checks
   *  (e.g. "Connectivity with RFID Sensors" -> RFID Reader 1, RFID Reader 2),
   *  each with its own status and error message. Takes precedence over `info`
   *  when present. */
  subChecks?: SubCheck[];
}

export interface SectionData {
  id: string;
  title: string;
  infoTitle: string;
  overallStatus: Status;
  items: CheckItem[];
}

export type NavNode = {
  id: string;
  label: string;
  status?: Status;
  sectionId?: string;
  children?: NavNode[];
};

export type AssetStatus =
  | "Available"
  | "Issued"
  | "Pending Return"
  | "Not Returned"
  | "Missing"
  | "Maintenance"
  | "Overdue";

export type AssignmentStatus =
  | "Issued"
  | "Returned"
  | "Pending Return"
  | "Not Returned"
  | "Missing"
  /** Figma's Assignment List full table (5154:76301) shows three more status
   *  values with no corresponding tab — "Return Assets" carries the same
   *  warning triplet as "Pending Return"; the other two mark a transfer of
   *  custody between operators rather than a return to the armskote. */
  | "Return Assets"
  | "Ownership Transferred"
  | "Ownership Received";

export type AssetTypeStatus = "Active" | "Inactive";

export interface Asset {
  id: string;
  no: number;
  name: string;
  serialNumber: string;
  assetType: string;
  assetCategory: string;
  status: AssetStatus;
  issuedDate: string;
  /**
   * Figma's `List - Archived` section (`5943:14704`) swaps the Issued Date
   * column for **Archived Date**, so an archived asset needs its own stamp.
   */
  archivedDate?: string;
  assetTagId?: string;
  createdDate?: string;
  createdBy?: string;
  createdByRole?: string;
  issuanceCycle?: number;
  rfidTag1Status?: string;
  rfidTag2Status?: string;
  rfidTag1Id?: string;
  rfidTag2Id?: string;
  rfidUniqueId?: string;
  rfidLocation?: string;
  /** Figma `Asset Details` card → Remarks. */
  remarks?: string;
  lastCheckedOn?: string;
}

export interface Assignment {
  id: string;
  no: number;
  assignmentId: string;
  assignmentType: string;
  bookings: string[];
  status: AssignmentStatus;
  baseStations: string[];
  assetQty: number;
  issuedDate?: string;
  returnedDate?: string;
  /** Figma `Assignment Details` → Operator. */
  operator?: string;
  /** Figma `Assignment Details` → Armskote Personnel Operator. */
  armskotePersonnel?: string;
  /** Figma `Issuance Details` → Issued Reason. Administration / Maintenance only. */
  issuedReason?: string;
}

export interface AssetType {
  id: string;
  no: number;
  assetType: string;
  assetCategory: string;
  code: string;
  status: AssetTypeStatus;
  createdBy: string;
  createdByRole: string;
  lastUpdatedOn: string;
}

export interface AssetCategory {
  id: string;
  no: number;
  assetCategory: string;
  alert: string;
  status: AssetTypeStatus;
  createdBy: string;
  createdByRole: string;
  lastUpdatedOn: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export const assetStats = {
  total: 18,
  available: 12,
  issued: 5,
  pendingReturn: 1,
  notReturned: 0,
  missing: 0,
  maintenance: 0,
  overdue: 0,
};

/*
 * `Assets by Category` — Figma `Chart - Asset` on page SHM (`5133:38313`).
 *
 * The eight segment colours were hand-picked hex values with no relationship
 * to the token layer (#115e59, #5fa8a1, #1A6B3C …). Figma binds every segment
 * to a real token, so `color` is now a CSS custom property name and the chart
 * reads it through `rgb(var(...))` — a palette change in Figma now reaches the
 * chart instead of stopping at it.
 */
export const assetsByCategory = [
  { label: "RFID Reader",  value: 6, percentage: 33.3, color: "--color-background-info-default" },
  { label: "Siren",        value: 3, percentage: 16.7, color: "--color-background-success-default" },
  { label: "Antenna",      value: 2, percentage: 11.1, color: "--color-background-danger-default" },
  { label: "Controller",   value: 2, percentage: 11.1, color: "--color-background-warning-default" },
  { label: "Power Supply", value: 2, percentage: 11.1, color: "--color-background-orange-default" },
  { label: "Display Unit", value: 1, percentage: 5.6,  color: "--color-background-purple-default" },
  { label: "Cable Set",    value: 1, percentage: 5.6,  color: "--color-background-primary-default" },
  { label: "Sensor",       value: 1, percentage: 5.6,  color: "--color-background-info-pressed" },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Reader Siren Notification",
    description: "Asset SN-0041 has been issued to Booking #BK-2024-001",
    timestamp: "22 Apr 2026, 09:15 AM",
    isRead: false,
  },
  {
    id: "n2",
    title: "Reader Siren Notification",
    description: "Asset SN-0038 pending return from Base Station Alpha",
    timestamp: "22 Apr 2026, 08:30 AM",
    isRead: false,
  },
  {
    id: "n3",
    title: "Reader Siren Notification",
    description: "Asset SN-0022 successfully returned and verified",
    timestamp: "21 Apr 2026, 05:00 PM",
    isRead: true,
  },
];

export const assets: Asset[] = [
  {
    id: "a1",
    no: 1,
    name: "trst",
    serialNumber: "XAERRWR43R34R",
    assetType: "SAR21",
    assetCategory: "Weapon",
    status: "Available",
    issuedDate: "—",
    assetTagId: "260427-SAR21003",
    createdDate: "27 Apr 2026 11:21:05 AM",
    createdBy: "Olivia Carter",
    createdByRole: "System Admin",
    issuanceCycle: 0,
    rfidTag1Status: "Connected",
    rfidTag2Status: "No RFID",
    rfidTag1Id: "260427-RFI002",
    rfidTag2Id: "—",
    rfidUniqueId: "001",
    rfidLocation: "No Location Found",
    lastCheckedOn: "—"
  },
  { id: "a2",  no: 2,  name: "RFID Reader Unit B",  serialNumber: "SN-0002", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a3",  no: 3,  name: "RFID Reader Unit C",  serialNumber: "SN-0003", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a4",  no: 4,  name: "RFID Reader Unit D",  serialNumber: "SN-0004", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a5",  no: 5,  name: "RFID Reader Unit E",  serialNumber: "SN-0005", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a6",  no: 6,  name: "RFID Reader Unit F",  serialNumber: "SN-0006", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a7",  no: 7,  name: "RFID Reader Unit G",  serialNumber: "SN-0007", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a8",  no: 8,  name: "RFID Reader Unit H",  serialNumber: "SN-0008", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a9",  no: 9,  name: "RFID Reader Unit I",  serialNumber: "SN-0009", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a10", no: 10, name: "RFID Reader Unit J",  serialNumber: "SN-0010", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a11", no: 11, name: "RFID Reader Unit K",  serialNumber: "SN-0011", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a12", no: 12, name: "RFID Reader Unit L",  serialNumber: "SN-0012", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Available",     issuedDate: "—" },
  { id: "a13", no: 13, name: "Siren Unit Alpha",    serialNumber: "SN-0013", assetType: "Siren",       assetCategory: "Siren",       status: "Issued",        issuedDate: "15 Apr 2026" },
  { id: "a14", no: 14, name: "Siren Unit Beta",     serialNumber: "SN-0014", assetType: "Siren",       assetCategory: "Siren",       status: "Issued",        issuedDate: "15 Apr 2026" },
  { id: "a15", no: 15, name: "RFID Reader Unit M",  serialNumber: "SN-0015", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Issued",        issuedDate: "18 Apr 2026" },
  { id: "a16", no: 16, name: "RFID Reader Unit N",  serialNumber: "SN-0016", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Issued",        issuedDate: "18 Apr 2026" },
  { id: "a17", no: 17, name: "RFID Reader Unit O",  serialNumber: "SN-0017", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Issued",        issuedDate: "20 Apr 2026" },
  { id: "a18", no: 18, name: "RFID Reader Unit P",  serialNumber: "SN-0018", assetType: "RFID Reader", assetCategory: "RFID Reader", status: "Pending Return",issuedDate: "10 Apr 2026" },
];

export const assignments: Assignment[] = [
  {
    id: "as1", no: 1,
    operator: "Laura Norder", armskotePersonnel: "Patience Wait",
    assignmentId: "ASG-2026-0142",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-001", "BK-2026-002"],
    status: "Issued",
    baseStations: ["WPT-01", "WPT-02"],
    assetQty: 6,
    issuedDate: "10:35:58 PM\n28 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as2", no: 2,
    operator: "Ken Chow", armskotePersonnel: "Patrick Ta",
    assignmentId: "ASG-2026-0158",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-003"],
    status: "Issued",
    baseStations: ["WPT-03"],
    assetQty: 4,
    issuedDate: "04:13:16 PM\n28 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as3", no: 3,
    operator: "Liam Johansson", armskotePersonnel: "Sofia Moretti",
    assignmentId: "ASG-2026-0201",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-004"],
    status: "Returned",
    baseStations: ["WPT-02"],
    assetQty: 11,
    issuedDate: "02:47:56 PM\n28 Apr 2026",
    returnedDate: "05:14:58 PM\n28 Apr 2026",
  },
  {
    id: "as4", no: 4,
    operator: "Sarah Mitchell", armskotePersonnel: "James Rodriguez",
    assignmentId: "ASG-2026-0219",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-005", "BK-2026-006"],
    status: "Issued",
    baseStations: ["WPT-05"],
    assetQty: 1,
    issuedDate: "02:44:11 PM\n28 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as5", no: 5,
    operator: "David Chen", armskotePersonnel: "Emma Thompson",
    assignmentId: "ASG-2026-0244",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-007"],
    status: "Returned",
    baseStations: ["WPT-01"],
    assetQty: 1,
    issuedDate: "02:38:53 PM\n28 Apr 2026",
    returnedDate: "04:44:29 PM\n28 Apr 2026",
  },
  {
    id: "as6", no: 6,
    operator: "Ken Chow", armskotePersonnel: "Patrick Ta",
    assignmentId: "ASG-2026-0287",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-008"],
    status: "Returned",
    baseStations: ["WPT-02"],
    assetQty: 1,
    issuedDate: "12:06:50 PM\n28 Apr 2026",
    returnedDate: "02:38:16 PM\n28 Apr 2026",
  },
  {
    id: "as7", no: 7,
    operator: "Laura Norder", armskotePersonnel: "Sofia Moretti",
    assignmentId: "ASG-2026-0301",
    assignmentType: "Base Station",
    bookings: ["BK-2026-009"],
    status: "Issued",
    baseStations: ["WPT-01"],
    assetQty: 1,
    issuedDate: "12:01:48 PM\n28 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as8", no: 8,
    operator: "Laura Norder", armskotePersonnel: "Patience Wait",
    assignmentId: "ASG-2026-0355",
    assignmentType: "Administration",
    bookings: [],
    status: "Issued",
    baseStations: ["WPT-03", "WPT-04", "WPT-05"],
    assetQty: 8,
    issuedDate: "11:21:05 AM\n27 Apr 2026",
    returnedDate: undefined,
    issuedReason:
      "Weekly stock count and condition check for WPT-03 to WPT-05 controlled items ahead of next month's audit.",
  },
  {
    id: "as9", no: 9,
    operator: "Ken Chow", armskotePersonnel: "Emma Thompson",
    assignmentId: "ASG-2026-0378",
    assignmentType: "Maintenance",
    bookings: [],
    status: "Pending Return",
    baseStations: ["WPT-02"],
    assetQty: 3,
    issuedDate: "09:02:40 AM\n28 Apr 2026",
    returnedDate: undefined,
    issuedReason:
      "SAR21 unit #14 flagged for trigger mechanism fault during last session \u2014 withdrawing for workshop inspection and repair.",
  },
  // Figma's Assignment List (5154:76248) also draws Return Assets, Missing,
  // Ownership Transferred and Ownership Received rows, and a Not Returned tab
  // count — one mock row each so every badge and tab has something to show.
  {
    id: "as10", no: 10,
    operator: "Sarah Mitchell", armskotePersonnel: "Patrick Ta",
    assignmentId: "ASG-2026-0402",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-002"],
    status: "Return Assets",
    baseStations: ["WPT-01", "WPT-03"],
    assetQty: 5,
    issuedDate: "08:15:00 AM\n29 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as11", no: 11,
    operator: "David Chen", armskotePersonnel: "Sofia Moretti",
    assignmentId: "ASG-2026-0417",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-006"],
    status: "Missing",
    baseStations: ["WPT-05"],
    assetQty: 2,
    issuedDate: "09:40:12 AM\n29 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as12", no: 12,
    operator: "Liam Johansson", armskotePersonnel: "Emma Thompson",
    assignmentId: "ASG-2026-0425",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-008"],
    status: "Ownership Transferred",
    baseStations: ["WPT-02"],
    assetQty: 4,
    issuedDate: "08:09:00 AM\n30 Apr 2026",
    returnedDate: "12:00:00 PM\n30 Apr 2026",
  },
  {
    id: "as13", no: 13,
    operator: "Ken Chow", armskotePersonnel: "James Rodriguez",
    assignmentId: "ASG-2026-0433",
    assignmentType: "Single Booking",
    bookings: ["BK-2026-008"],
    status: "Ownership Received",
    baseStations: ["WPT-02"],
    assetQty: 4,
    issuedDate: "12:00:00 PM\n30 Apr 2026",
    returnedDate: undefined,
  },
  {
    id: "as14", no: 14,
    operator: "Laura Norder", armskotePersonnel: "Patience Wait",
    assignmentId: "ASG-2026-0448",
    assignmentType: "Maintenance",
    bookings: [],
    status: "Not Returned",
    baseStations: ["WPT-04"],
    assetQty: 2,
    issuedDate: "10:05:30 AM\n30 Apr 2026",
    returnedDate: undefined,
    issuedReason: "Scheduled battery replacement for RFID readers at WPT-04.",
  },
];

export const assetTypes: AssetType[] = [
  {
    id: "at1", no: 1,
    assetType: "RFID Reader",
    assetCategory: "RFID Reader",
    code: "RFID-RDR",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "at2", no: 2,
    assetType: "Siren",
    assetCategory: "Siren",
    code: "SRN-001",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "at3", no: 3,
    assetType: "Antenna",
    assetCategory: "RFID Reader",
    code: "ANT-001",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "15 Jan 2026\n10:30 AM",
  },
  {
    id: "at4", no: 4,
    assetType: "Power Supply Unit",
    assetCategory: "Siren",
    code: "PSU-001",
    status: "Inactive",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "20 Feb 2026\n02:15 PM",
  },
  {
    id: "at5", no: 5,
    assetType: "Cable Assembly",
    assetCategory: "RFID Reader",
    code: "CBL-001",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "10 Mar 2026\n11:00 AM",
  },
];

export const assetCategories: AssetCategory[] = [
  {
    id: "ac1", no: 1,
    assetCategory: "RFID Reader",
    alert: "Low Stock",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "ac2", no: 2,
    assetCategory: "Siren",
    alert: "—",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "ac3", no: 3,
    assetCategory: "Antenna",
    alert: "—",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "15 Jan 2026\n10:30 AM",
  },
  {
    id: "ac4", no: 4,
    assetCategory: "Power Supply",
    alert: "Maintenance Due",
    status: "Inactive",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "20 Feb 2026\n02:15 PM",
  },
  {
    id: "ac5", no: 5,
    assetCategory: "Cable & Accessories",
    alert: "—",
    status: "Active",
    createdBy: "Admin User",
    createdByRole: "System Admin",
    lastUpdatedOn: "10 Mar 2026\n11:00 AM",
  },
];

// Operators for issue assets
export const operators = [
  "Ken Chow",
  "Liam Johansson",
  "Sarah Mitchell",
  "David Chen",
];

// Armskote Personnel Operators
export const armskokePersonnelOperators = [
  "Patrick Ta",
  "Sofia Moretti",
  "James Rodriguez",
  "Emma Thompson",
];

// Assignment types — Figma `Chip Advanced` on Issue Asset Step 1's Assignment
// Configuration card (page "↪ Action - Issue Asset (Booking)", 5869:43219):
// exactly 3 options, single-select. Narrowed from the previous 5-option list
// ("Single Booking"/"Multiple Bookings"/"Base Station"/"Maintenance"/
// "Administration") 30 Sep 2026 — a real behavior change, not a rename.
export const assignmentTypes = ["Administration", "Booking", "Maintenance"];

// Base stations
export const baseStations = [
  "WPT-01",
  "WPT-02",
  "WPT-04",
  "WPT-05",
  "WPT-01",
  "WPT-02",
  "WPT-03",
];

// Mapping of base stations to available bookings (uses actual booking IDs from mock.ts)
export const baseStationBookings: Record<string, string[]> = {
  "WPT-01": ["1", "2", "4", "5"],
  "WPT-02": ["3", "8"],
  "WPT-04": ["7"],
  "WPT-05": ["6"],
  "WPT-03": ["9"],
};

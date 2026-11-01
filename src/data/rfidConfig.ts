export interface RFIDReader {
  id: string;
  no: number;
  displayName: string;
  macAddress: string;
  status: "Active" | "Inactive";
  armStatus: "Arm" | "Disarm";
  serialNumber: string;
  ipAddress: string;
  firmwareVersion?: string;
  mqttTopic?: string;
  /** Figma `Last Updated on` — two lines: date, then time. */
  lastUpdatedOn?: string;
  /** Figma `Created by` — two lines: name, then role. */
  createdBy?: string;
  createdByRole?: string;
}

export interface AntennaEntry {
  id: string;
  no: number;
  /** Figma column "Base Station". */
  station: string;
  rfidReader: string;
  antennaPortNumber: string;
  antenna: string;
  /** Figma column "Antenna Key" (the Group Key picked in the drawer). */
  antennaKey: string;
  /** Figma column "GPO" (the Group GPO picked in the drawer). */
  gpo: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdByRole: string;
  /** "<date>\n<time>" — the table renders it as a two-line cell. */
  lastUpdatedOn: string;
}

export const rfidReaders: RFIDReader[] = [
  {
    id: "r1", no: 1,
    lastUpdatedOn: "6 Jun 2026\n10:09:00 AM",
    createdBy: "Olivia Carter", createdByRole: "System Admin",
    displayName: "RFID Reader 1",
    macAddress: "84248DF03FC8001",
    status: "Active",
    armStatus: "Arm",
    serialNumber: "JX3621390195-001",
    ipAddress: "352.323.322.1",
    firmwareVersion: "1.0.1",
    mqttTopic: "R01123110001",
  },
  {
    id: "r2", no: 2,
    lastUpdatedOn: "7 Jun 2026\n11:09:00 AM",
    createdBy: "Ken Chow", createdByRole: "Operator",
    displayName: "RFID Reader 2",
    macAddress: "84248DF03FC8002",
    status: "Active",
    armStatus: "Arm",
    serialNumber: "JX3621390195-002",
    ipAddress: "352.323.322.2",
    firmwareVersion: "1.0.1",
    mqttTopic: "R01123110002",
  },
  {
    id: "r3", no: 3,
    lastUpdatedOn: "8 Jun 2026\n12:09:00 PM",
    createdBy: "Sarah Mitchell", createdByRole: "System Admin",
    displayName: "RFID Reader 3",
    macAddress: "84248DF03FC8003",
    status: "Active",
    armStatus: "Arm",
    serialNumber: "JX3621390195-003",
    ipAddress: "352.323.322.3",
    firmwareVersion: "1.0.1",
    mqttTopic: "R01123110003",
  },
];

export const antennaEntries: AntennaEntry[] = [
  { id: "a1", no: 1, station: "WPT-01", rfidReader: "RFID Reader 1", antennaPortNumber: "25255DF8FC01001", antenna: "RFID Reader 1 - Antenna 1", antennaKey: "ANT1", gpo: "GPO1", status: "Active", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "06 Jun 2026\n11:09:00 PM" },
  { id: "a2", no: 2, station: "WPT-02", rfidReader: "RFID Reader 1", antennaPortNumber: "25255DF8FC01002", antenna: "RFID Reader 1 - Antenna 2", antennaKey: "ANT2", gpo: "GPO2", status: "Inactive", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "03 Jun 2026\n08:00:00 PM" },
  { id: "a3", no: 3, station: "WPT-03", rfidReader: "RFID Reader 2", antennaPortNumber: "25255DF8FC02001", antenna: "RFID Reader 2 - Antenna 1", antennaKey: "ANT1", gpo: "GPO1", status: "Active", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "15 May 2026\n04:25:14 PM" },
  { id: "a4", no: 4, station: "WPT-04", rfidReader: "RFID Reader 2", antennaPortNumber: "25255DF8FC02002", antenna: "RFID Reader 2 - Antenna 2", antennaKey: "ANT2", gpo: "GPO2", status: "Active", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "05 May 2026\n09:30:00 PM" },
  { id: "a5", no: 5, station: "WPT-05", rfidReader: "RFID Reader 3", antennaPortNumber: "25255DF8FC03001", antenna: "RFID Reader 3 - Antenna 1", antennaKey: "ANT1", gpo: "GPO1", status: "Active", createdBy: "Marcus Lim", createdByRole: "System Admin", lastUpdatedOn: "28 Apr 2026\n10:12:40 AM" },
  { id: "a6", no: 6, station: "WPT-06", rfidReader: "RFID Reader 3", antennaPortNumber: "25255DF8FC03002", antenna: "RFID Reader 3 - Antenna 2", antennaKey: "ANT2", gpo: "GPO2", status: "Active", createdBy: "Marcus Lim", createdByRole: "System Admin", lastUpdatedOn: "22 Apr 2026\n02:45:00 PM" },
  { id: "a7", no: 7, station: "WPT-01", rfidReader: "RFID Reader 1", antennaPortNumber: "25255DF8FC01003", antenna: "RFID Reader 1 - Antenna 3", antennaKey: "ANT3", gpo: "GPO3", status: "Inactive", createdBy: "Marcus Lim", createdByRole: "System Admin", lastUpdatedOn: "18 Apr 2026\n09:05:22 AM" },
  { id: "a8", no: 8, station: "WPT-02", rfidReader: "RFID Reader 1", antennaPortNumber: "25255DF8FC01004", antenna: "RFID Reader 1 - Antenna 4", antennaKey: "ANT4", gpo: "GPO4", status: "Active", createdBy: "Priya Nair", createdByRole: "System Admin", lastUpdatedOn: "11 Apr 2026\n07:40:10 PM" },
  { id: "a9", no: 9, station: "WPT-03", rfidReader: "RFID Reader 2", antennaPortNumber: "25255DF8FC02003", antenna: "RFID Reader 2 - Antenna 3", antennaKey: "ANT3", gpo: "GPO3", status: "Active", createdBy: "Priya Nair", createdByRole: "System Admin", lastUpdatedOn: "02 Apr 2026\n03:18:55 PM" },
  { id: "a10", no: 10, station: "WPT-04", rfidReader: "RFID Reader 2", antennaPortNumber: "25255DF8FC02004", antenna: "RFID Reader 2 - Antenna 4", antennaKey: "ANT4", gpo: "GPO4", status: "Active", createdBy: "Priya Nair", createdByRole: "System Admin", lastUpdatedOn: "25 Mar 2026\n11:52:03 AM" },
  { id: "a11", no: 11, station: "WPT-05", rfidReader: "RFID Reader 3", antennaPortNumber: "25255DF8FC03003", antenna: "RFID Reader 3 - Antenna 3", antennaKey: "ANT3", gpo: "GPO3", status: "Inactive", createdBy: "Daniel Ong", createdByRole: "System Admin", lastUpdatedOn: "17 Mar 2026\n08:33:47 AM" },
  { id: "a12", no: 12, station: "WPT-06", rfidReader: "RFID Reader 3", antennaPortNumber: "25255DF8FC03004", antenna: "RFID Reader 3 - Antenna 4", antennaKey: "ANT4", gpo: "GPO4", status: "Active", createdBy: "Daniel Ong", createdByRole: "System Admin", lastUpdatedOn: "09 Mar 2026\n05:21:09 PM" },
  { id: "a13", no: 13, station: "WPT-01", rfidReader: "RFID Reader 1", antennaPortNumber: "25255DF8FC01005", antenna: "RFID Reader 1 - Antenna 5", antennaKey: "ANT1", gpo: "GPO1", status: "Active", createdBy: "Daniel Ong", createdByRole: "System Admin", lastUpdatedOn: "28 Feb 2026\n01:14:36 PM" },
  { id: "a14", no: 14, station: "WPT-02", rfidReader: "RFID Reader 2", antennaPortNumber: "25255DF8FC02005", antenna: "RFID Reader 2 - Antenna 5", antennaKey: "ANT2", gpo: "GPO2", status: "Active", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "16 Feb 2026\n10:02:58 AM" },
  { id: "a15", no: 15, station: "WPT-03", rfidReader: "RFID Reader 3", antennaPortNumber: "25255DF8FC03005", antenna: "RFID Reader 3 - Antenna 5", antennaKey: "ANT3", gpo: "GPO3", status: "Inactive", createdBy: "Olivia Carter", createdByRole: "System Admin", lastUpdatedOn: "04 Feb 2026\n06:47:12 PM" },
];

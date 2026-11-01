export type BriefingRoomStatus = "Available" | "Not Available";
export type BriefingRoomLevel = 1 | 2 | 3 | 4;

export interface BriefingRoom {
  id: string;
  no: number;
  name: string;
  additionalInfo: string;
  status: BriefingRoomStatus;
  level: BriefingRoomLevel;
  capacity: number;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export const briefingRooms: BriefingRoom[] = [
  {
    id: "br1", no: 1,
    name: "Briefing Room A",
    additionalInfo: "Main briefing room, near Level 1 lobby",
    status: "Available",
    level: 1,
    capacity: 40,
    createdBy: "Admin User",
    createdByRole: "System Admin",
    createdAt: "01 Jan 2026\n09:00 AM",
    lastUpdatedAt: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "br2", no: 2,
    name: "Briefing Room B",
    additionalInfo: "Adjacent to WPT range control room",
    status: "Available",
    level: 1,
    capacity: 30,
    createdBy: "Admin User",
    createdByRole: "System Admin",
    createdAt: "01 Jan 2026\n09:00 AM",
    lastUpdatedAt: "01 Jan 2026\n09:00 AM",
  },
  {
    id: "br3", no: 3,
    name: "Briefing Room C",
    additionalInfo: "",
    status: "Not Available",
    level: 2,
    capacity: 25,
    createdBy: "Admin User",
    createdByRole: "System Admin",
    createdAt: "03 Jan 2026\n10:30 AM",
    lastUpdatedAt: "12 Feb 2026\n02:15 PM",
  },
  {
    id: "br4", no: 4,
    name: "Briefing Room D",
    additionalInfo: "MST cabin block, Level 3",
    status: "Available",
    level: 3,
    capacity: 20,
    createdBy: "Olivia Carter",
    createdByRole: "System Admin",
    createdAt: "10 Jan 2026\n08:45 AM",
    lastUpdatedAt: "10 Jan 2026\n08:45 AM",
  },
  {
    id: "br5", no: 5,
    name: "Ops Room 1",
    additionalInfo: "Reserved for TCT command team briefings",
    status: "Available",
    level: 4,
    capacity: 15,
    createdBy: "Olivia Carter",
    createdByRole: "System Admin",
    createdAt: "15 Jan 2026\n01:20 PM",
    lastUpdatedAt: "15 Jan 2026\n01:20 PM",
  },
];

export interface MasterDataItem {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdOn: string; // "DD Mon YYYY\nHH:MM:SS AM/PM"
}

export const platformTypes: MasterDataItem[] = [
  { id: "pt-1", name: "40AGL",             status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:12:04 AM" },
  { id: "pt-2", name: "50HMG",             status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:12:04 AM" },
  { id: "pt-3", name: "7.62 COAX",         status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:12:04 AM" },
  { id: "pt-4", name: "Smoke Discharger",  status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:12:04 AM" },
];

export const callSigns: MasterDataItem[] = [
  { id: "cs-1",  name: "09",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-2",  name: "09Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-3",  name: "08",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-4",  name: "08Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-5",  name: "07",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-6",  name: "01",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-7",  name: "06",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-8",  name: "06Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-9",  name: "05",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-10", name: "05Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-11", name: "03",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-12", name: "45Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-13", name: "81",     status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-14", name: "81A",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-15", name: "81AZ",   status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-16", name: "81Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-17", name: "83Z",    status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-18", name: "83A1Z",  status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-19", name: "83A2Z",  status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-20", name: "83A3Z",  status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
  { id: "cs-21", name: "83A4Z",  status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:15:41 AM" },
];

export const roles: MasterDataItem[] = [
  { id: "role-1", name: "VO", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:18:22 AM" },
  { id: "role-2", name: "VC", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:18:22 AM" },
  { id: "role-3", name: "TC", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:18:22 AM" },
  { id: "role-4", name: "SC", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:18:22 AM" },
  { id: "role-5", name: "SO", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:18:22 AM" },
];

export const vehicles: MasterDataItem[] = [
  { id: "veh-1", name: "ICV (TERREX)",       status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:21:10 AM" },
  { id: "veh-2", name: "Armour",             status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:21:10 AM" },
  { id: "veh-3", name: "Engineer",           status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:21:10 AM" },
  { id: "veh-4", name: "PCSV",               status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:21:10 AM" },
  { id: "veh-5", name: "Transport Vehicles", status: "Active", createdBy: "Olivia Carter", createdOn: "12 Jan 2026\n09:21:10 AM" },
];

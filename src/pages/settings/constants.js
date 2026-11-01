// ── Constants, mock data, and small union types for Settings ─────────────────
export const MENU_ITEMS = [
    "Preference",
    "Notification Setting",
    "Auto-Archive Setting",
    "IP Whitelisting",
    "Briefing Room",
    "Location",
    "HUMS Interval",
    "RFID Transition Rules",
    "Armskote Transition Rules",
    "Missing Transition Rules",
    "Individual Booking",
    "Mask Service ID",
    "System Version",
];
export const BOOKING_OPTIONS = ["New Booking", "Booking Assignment", "Cancel Booking"];
export const PER_PAGE = 10;
export const IP_ENTRIES = [
    { id: "ip5", name: "IP Name 5", ipAddress: "10.10.10.50", description: "This Is For IP Name 5", startIp: "10.10.10.1", endIp: "10.10.10.255" },
    { id: "ip4", name: "IP Name 4", ipAddress: "192.168.100.15", description: "This Is For IP Name 4", startIp: "192.168.100.1", endIp: "192.168.100.255" },
    { id: "ip3", name: "IP Name 3", ipAddress: "172.16.0.20", description: "This Is For IP Name 3", startIp: "172.16.0.1", endIp: "172.16.0.255" },
    { id: "ip2", name: "IP Name 2", ipAddress: "10.0.0.5", description: "This Is For IP Name 2", startIp: "10.0.0.1", endIp: "10.0.0.255" },
    { id: "ip1", name: "IP Name 1", ipAddress: "192.168.1.10", description: "This Is For IP Name 1", startIp: "192.168.1.1", endIp: "192.168.1.255" },
    { id: "ip0", name: "All IP Address", ipAddress: "0.0.0.0", description: "Access For All IP Address", startIp: "0.0.0.0", endIp: "255.255.255.255" },
];
export const BRIEFING_ROOMS = [
    { id: "br2", name: "Briefing Room 2", status: "Active", description: "For Station 2" },
    { id: "br1", name: "Briefing Room 1", status: "Active", description: "For Station 1" },
];
export const LOCATIONS = [
    { id: "loc1", name: "Operator Room", status: "Active", description: "For Operator Room" },
    { id: "loc2", name: "Maintainer Room", status: "Active", description: "For Maintainer Room" },
    { id: "loc3", name: "Briefing Room 1", status: "Active", description: "For Station 1" },
    { id: "loc4", name: "Briefing Room 2", status: "Active", description: "For Station 2" },
];
export const INITIAL_VERSIONS = [
    { id: "v15", version: "0.6.9-21", date: "06 May 2026\n11:09:00 PM", patchNotes: ["Release With Major Bug Fixing And Feature Adjustment"] },
    { id: "v14", version: "0.6.9-20", date: "05 May 2026\n09:30:00 PM", patchNotes: ["Release With Major Bug Fixing And Feature Adjustment"] },
    { id: "v13", version: "0.6.9-19", date: "03 May 2026\n08:00:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
    { id: "v12", version: "0.6.9-18", date: "01 May 2026\n06:45:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
    { id: "v11", version: "0.6.9-17", date: "29 Apr 2026\n05:20:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
    { id: "v10", version: "0.6.9-15", date: "26 Apr 2026\n04:00:00 PM", patchNotes: ["Release With Bug Fixing And Feature Adjustment"] },
    { id: "v9", version: "0.6.9-14", date: "24 Apr 2026\n03:10:00 PM", patchNotes: ["Release"] },
    { id: "v8", version: "0.6.9-4", date: "20 Apr 2026\n02:30:00 PM", patchNotes: ["Release"] },
    { id: "v7", version: "0.4.3", date: "15 Nov 2025\n04:25:14 PM", patchNotes: ["Final PD Release With Bug Fixing"] },
    { id: "v6", version: "0.4.2", date: "09 Oct 2025\n03:10:56 PM", patchNotes: ["Third PD Release With Bug Fixing"] },
    { id: "v5", version: "0.4.1", date: "30 Sep 2025\n12:10:27 PM", patchNotes: ["Second PD Release With Bug Fixing"] },
    { id: "v4", version: "0.4.0", date: "13 Sep 2025\n07:34:47 PM", patchNotes: ["First PD Release"] },
];

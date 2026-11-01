import type { CheckItem, NavNode, SectionData, Status, StationStatus } from "./types";
import { overallOf } from "./utils";

export const LAST_UPDATE = "29 Apr 2026 09:24:54 PM";

// TRX hardware isn't one global unit — each item (battery, CPU, joystick, …)
// physically exists at every base station, so its health has to be tracked
// per station, not as a single flat status.
export const BASE_STATIONS = ["Base Station 1", "Base Station 2", "Base Station 3"];

/** Build the 3-station breakdown for an TRX/HUMS item. `overrides` lets a
 *  specific station diverge from the item's own headline status (e.g. one
 *  station's battery is Not Running while the other two are Running). */
function perStationOf(status: Status, overrides: Partial<Record<number, Status>> = {}): StationStatus[] {
  return BASE_STATIONS.map((station, i) => ({ station, status: overrides[i] ?? status }));
}

export const BIT_TOMS_SECTIONS: SectionData[] = [
  {
    id: "toms-network", title: "Network", infoTitle: "Network Information", overallStatus: "Failed",
    items: [
      { label: "MQTT",                            status: "Passed" },
      {
        label: "Connectivity with RFID Sensors", status: "Failed",
        subChecks: [
          { label: "RFID Reader 1", status: "Failed", errorMessage: "Unable to establish connection with RFID Reader 1. Verify network and sensor connectivity" },
          { label: "RFID Reader 2", status: "Failed", errorMessage: "Unable to establish connection with RFID Reader 2. Verify network and sensor connectivity" },
        ],
      },
      { label: "Connectivity with TRX system",    status: "Passed" },
    ],
  },
  {
    id: "toms-microservices", title: "Microservices", infoTitle: "Microservices Information", overallStatus: "Passed",
    items: [
      { label: "System Hardware Management",    status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Booking",                       status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "User",                          status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Trainee",                       status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "System Settings",                status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Site Management & Operational", status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Gateway",                       status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
    ],
  },
  {
    id: "toms-database", title: "Database", infoTitle: "Database Information", overallStatus: "Passed",
    items: [
      { label: "Personnel",        status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "SHMS",             status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Training Results", status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "Resource",         status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
      { label: "System Settings",  status: "Passed", subChecks: [{ label: "Connectivity", status: "Passed", errorMessage: "" }] },
    ],
  },
];

export const BIT_TRX_ITEMS: CheckItem[] = [
  { label: "battery",           status: "Running",       info: { description: "Battery unit",             errorMessage: "" },                                    perStation: perStationOf("Running", { 2: "Not Running" }) },
  { label: "Bio Device",        status: "Battery Low",   info: { description: "Biometric device",         errorMessage: "Battery level at 12%" },                perStation: perStationOf("Battery Low", { 1: "Ok" }) },
  { label: "CPU",               status: "Unknown",       info: { description: "Central processing unit",  errorMessage: "Unable to retrieve CPU status" },       perStation: perStationOf("Unknown") },
  { label: "Critical Software", status: "Not Running",   info: { description: "Critical software stack",  errorMessage: "Process not responding" },              perStation: perStationOf("Not Running", { 0: "Ok", 1: "Ok" }) },
  { label: "envSensor",         status: "Running",       info: { description: "Environmental sensor",     errorMessage: "" },                                    perStation: perStationOf("Running") },
  { label: "Graphic Card",      status: "Unknown",       info: { description: "GPU",                      errorMessage: "Driver communication error" },          perStation: perStationOf("Unknown", { 1: "Ok" }) },
  { label: "Hard Drive",        status: "Unknown",       info: { description: "Primary HDD",              errorMessage: "SMART status unavailable" },            perStation: perStationOf("Unknown") },
  { label: "Hit Detect Camera", status: "Ok",            info: { description: "HD camera unit",           errorMessage: "" },                                    perStation: perStationOf("Ok") },
  { label: "Joystick",          status: "Not Found",     info: { description: "Input joystick",           errorMessage: "Device not detected" },                 perStation: perStationOf("Not Found", { 2: "Ok" }) },
  { label: "Keyboard",          status: "Unknown",       info: { description: "Keyboard",                 errorMessage: "HID status unknown" },                  perStation: perStationOf("Unknown") },
  { label: "Monitor",           status: "Unknown",       info: { description: "Display monitor",          errorMessage: "EDID read error" },                     perStation: perStationOf("Unknown", { 0: "Ok" }) },
  { label: "Motherboard",       status: "Ok",            info: { description: "Motherboard",              errorMessage: "" },                                    perStation: perStationOf("Ok") },
  { label: "Mouse",             status: "Not Found",     info: { description: "Input mouse",              errorMessage: "Device not detected" },                 perStation: perStationOf("Not Found") },
  { label: "Network Card",      status: "Unknown",       info: { description: "NIC",                      errorMessage: "Link status unavailable" },             perStation: perStationOf("Unknown", { 2: "Ok" }) },
  { label: "Printer",           status: "Jammed",        info: { description: "Laser printer",            errorMessage: "Paper jam detected in tray 1" },        perStation: perStationOf("Jammed", { 0: "Ok", 1: "Ok" }) },
  { label: "Projector",         status: "Shutting Down", info: { description: "Room projector",           errorMessage: "Lamp thermal shutdown initiated" },     perStation: perStationOf("Shutting Down", { 0: "Ok" }) },
  { label: "Sound Card",        status: "Not Found",     info: { description: "Audio device",             errorMessage: "Device not detected" },                 perStation: perStationOf("Not Found") },
  { label: "System Memory",     status: "Low",           info: { description: "RAM",                      errorMessage: "Available memory below threshold (2 GB)" }, perStation: perStationOf("Low", { 1: "Ok" }) },
];

export const HUMS_ITEMS: CheckItem[] = [
  { label: "Temperature Sensor", status: "Ok",      info: { description: "Ambient temperature sensor", errorMessage: "" },              perStation: perStationOf("Ok") },
  { label: "Humidity Sensor",    status: "Ok",      info: { description: "Humidity sensor",            errorMessage: "" },              perStation: perStationOf("Ok", { 2: "Unknown" }) },
  { label: "Air Quality",        status: "Unknown", info: { description: "Air quality monitor",        errorMessage: "Sensor read timeout" }, perStation: perStationOf("Unknown", { 0: "Ok" }) },
  { label: "Ventilation",        status: "Running", info: { description: "HVAC ventilation system",    errorMessage: "" },              perStation: perStationOf("Running") },
  { label: "Fire Sensor",        status: "Ok",      info: { description: "Fire detection sensor",      errorMessage: "" },              perStation: perStationOf("Ok") },
];

export const HUMS_TOMS_SECTIONS: SectionData[] = [
  {
    id: "hums-toms-network", title: "Network", infoTitle: "Network Information", overallStatus: "Connected",
    items: [
      { label: "Connectivity", status: "Connected" },
    ],
  },
];

export const NAV_TREE: NavNode[] = [
  { id: "hums-trx", label: "HUMS (TRX)", status: overallOf(HUMS_ITEMS), sectionId: "hums-trx" },
  {
    id: "hums-toms", label: "HUMS (TOMS)",
    children: HUMS_TOMS_SECTIONS.map((s) => ({
      id: s.id, label: s.title, status: s.overallStatus, sectionId: s.id,
    })),
  },
  {
    id: "bit-toms", label: "BIT (TOMS)",
    children: BIT_TOMS_SECTIONS.map((s) => ({
      id: s.id, label: s.title, status: s.overallStatus, sectionId: s.id,
    })),
  },
  { id: "bit-trx", label: "BIT (TRX)", status: overallOf(BIT_TRX_ITEMS), sectionId: "bit-trx" },
];

export function getSectionData(sectionId: string): { items: CheckItem[]; title: string; overallStatus: Status } | null {
  const toms = BIT_TOMS_SECTIONS.find((s) => s.id === sectionId);
  if (toms) return { items: toms.items, title: toms.infoTitle, overallStatus: toms.overallStatus };
  const humsToms = HUMS_TOMS_SECTIONS.find((s) => s.id === sectionId);
  if (humsToms) return { items: humsToms.items, title: humsToms.infoTitle, overallStatus: humsToms.overallStatus };
  if (sectionId === "bit-trx") return { items: BIT_TRX_ITEMS, title: "TRX Hardware Information", overallStatus: overallOf(BIT_TRX_ITEMS) };
  if (sectionId === "hums-trx") return { items: HUMS_ITEMS, title: "HUMS (TRX) Information", overallStatus: overallOf(HUMS_ITEMS) };
  return null;
}

export const PER_PAGE = 10;

/*
 * Drawer select options — Figma `Action - Add Antenna` (5171:25784).
 *
 * Figma's sample values spell the Group Key / Group GPO with a space
 * ("ANT 1", "GPO 1") inside the drawer, but the listing table renders them
 * without one ("ANT1", "GPO1"). The table spelling wins here so a value picked
 * in the drawer matches the column it lands in.
 */
export const STATUS_OPTIONS = ["Active", "Inactive"] as const;

export const RFID_LOCATION_OPTIONS = [
  "RFID Reader 1",
  "RFID Reader 2",
  "RFID Reader 3",
] as const;

export const BASE_STATION_OPTIONS = [
  "WPT-01",
  "WPT-02",
  "WPT-03",
  "WPT-04",
  "WPT-05",
  "WPT-06",
] as const;

export const GROUP_KEY_OPTIONS = ["ANT1", "ANT2", "ANT3", "ANT4", "ANT5"] as const;

export const GROUP_GPO_OPTIONS = ["GPO1", "GPO2", "GPO3", "GPO4", "GPO5"] as const;

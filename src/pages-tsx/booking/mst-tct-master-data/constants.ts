import type { MasterDataEntityKey } from "./types";

export const PER_PAGE = 10;

export const STATUS_OPTIONS = ["Active", "Inactive"] as const;

export const ENTITY_TABS: { key: MasterDataEntityKey; label: string; singular: string }[] = [
  { key: "platformType", label: "Platform Type", singular: "Platform Type" },
  { key: "callSign",     label: "Call Sign",      singular: "Call Sign"     },
  { key: "role",         label: "Role",           singular: "Role"          },
  { key: "vehicle",      label: "Vehicle",        singular: "Vehicle"       },
];

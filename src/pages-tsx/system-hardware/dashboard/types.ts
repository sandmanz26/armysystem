import type { ReactNode } from "react";

/**
 * One `Data Display - Training Result, System Health` tile on the SHM Dashboard
 * (Figma `SHM Dashboard` 5133:38715): 262×84, a 48×48 `surface lv1` icon well,
 * then the label in `color/text/body` at Regular 12 above the value in
 * `color/text/default` at Bold 24.
 */
export interface StatCard {
  label: string;
  value: number;
  /** Tile fill + outline, by Figma variable name. */
  tone: string;
  icon: ReactNode;
}

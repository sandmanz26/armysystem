export const PER_PAGE = 10;

/**
 * Figma `Filter - WPT - Training Result List` (5029:101404 / 5029:101408) has
 * exactly three sections: Booking Date, Training Type(s) and Training Slot.
 *
 * The old FILTER_SECTIONS also listed `Briefing Room` and `Courseware`. Neither
 * is a field on `TrainingResult`, so neither could ever have filtered anything —
 * they are dropped rather than carried forward as dead controls.
 */
export const TRAINING_TYPES = ["Group", "Individual"] as const;

/** Figma lays the slot checkboxes out two per row, in this order. */
export const TRAINING_SLOT_ROWS: readonly (readonly string[])[] = [
  ["AM Session", "PM Session"],
  ["Full Day", "Hourly"],
  ["Ad-hoc"],
] as const;

export const TRAINING_SLOTS = TRAINING_SLOT_ROWS.flat();

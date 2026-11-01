export const PER_PAGE = 10;

/**
 * Compliant / Non-compliant cut-off for Operational Availability (AO), in percent.
 *
 * Source: Figma `List - Filled` (5119:297872). No Notes frame, PRD or CDR states a
 * number (open question PRD-GAPS P-12), but every Figma row agrees with 95%:
 * 95.62% and 95.67% are "Compliant", 94.98% and 93.92% are "Non-compliant".
 * A value exactly at the threshold counts as compliant.
 */
export const AO_COMPLIANT_THRESHOLD = 95;

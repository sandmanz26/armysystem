import { StatusBadge } from "@/components/status-badge";
import { isCompliant } from "../utils";

/*
 * Compliance pill — Figma `Badge` in the AO cell of `List - Filled` (5119:297872)
 * and next to the month title on `Operational Availability Details` (8033:293789).
 * success → "Compliant", danger → "Non-compliant"; threshold in constants.ts.
 */
export function AOBadge({ value }: { value: number }) {
  return isCompliant(value)
    ? <StatusBadge tone="success">Compliant</StatusBadge>
    : <StatusBadge tone="danger">Non-compliant</StatusBadge>;
}

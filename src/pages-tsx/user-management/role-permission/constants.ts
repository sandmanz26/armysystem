import type { Role } from "./types";

/**
 * Column order follows Figma `Table - User Mgmt - User Permission`
 * (5029:2029). System Admin is first and is the read-only column.
 */
export const ROLES: readonly Role[] = [
  "System Admin",
  "Operator",
  "Instructor",
  "Maintainer",
] as const;

/**
 * Figma's `Modules` column is 456px with four roles (5029:2029) and shrinks to
 * 376px once a fifth appears (`List - If >4 User Roles`, 6027:907601) — the
 * table itself stays at its 1096 container width either way.
 */
export const MODULES_COL_WIDTH = ROLES.length > 4 ? 376 : 456;

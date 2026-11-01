import type { UserRoleType } from "@/data/userManagement";

export type TabType = "Overall" | UserRoleType | "Archived";

/** react-router `navigate` — the optional `state` carries the clicked row to User Details. */
export type UserNavigate = (path: string, options?: { state?: unknown }) => void;

export interface UserListProps {
  onNavigate?: UserNavigate;
}

export interface AddUserFormValues {
  name: string;
  rank: string;
  svcId: string;
  /** Replaces the old "Unit Name" field (Figma 5014:9194). Optional. */
  companyName: string;
  role: string;
  /** Only meaningful when role = Operator (Figma 7021:594352). */
  armskotePersonnel: boolean;
  password: string;
}

export interface AddUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (values: AddUserFormValues) => void;
  /** Existing company names for the creatable Company Name dropdown. */
  companyOptions: string[];
  /**
   * "edit" = Figma `Action - Edit User` (5014:9323): title "Edit User", no
   * Password field, footer Cancel · Confirm, fields prefilled from `initialValues`.
   * Defaults to "add" so the User List's Add User drawer is unchanged.
   */
  mode?: "add" | "edit";
  /** Prefill for edit mode. */
  initialValues?: Partial<AddUserFormValues>;
  /** Called on Confirm in edit mode. */
  onUpdate?: (values: AddUserFormValues) => void;
}

export interface UserRowMenuProps {
  onEdit: () => void;
  onArchive: () => void;
  onResetPassword: () => void;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

export interface AccountStatusBadgeProps {
  status: import("@/data/userManagement").AccountStatus;
}

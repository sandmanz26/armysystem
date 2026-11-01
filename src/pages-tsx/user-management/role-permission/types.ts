export type Role = "System Admin" | "Operator" | "Instructor" | "Maintainer";

export type PermState = Record<string, Record<Role, boolean>>;

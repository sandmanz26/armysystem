import { Fragment, useMemo, useState } from "react";
import { permissionGroups, operatorDefaultPerms } from "@/data/userManagement";
import { Icon } from "@/components/icon";
import { Toast } from "@/components/toast";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { ROLES, MODULES_COL_WIDTH } from "./constants";
import type { Role, PermState } from "./types";
import { CustomCheckbox } from "./components/CustomCheckbox";


function buildInitialState(): PermState {
  const state: PermState = {};
  permissionGroups.forEach((g) => {
    g.permissions.forEach((p) => {
      const key = `${g.module}::${p}`;
      state[key] = {
        "System Admin": true,
        Operator: operatorDefaultPerms[key] ?? false,
        Instructor: false,
        Maintainer: false,
      };
    });
  });
  return state;
}

export function RolePermission() {
  const [perms, setPerms] = useState<PermState>(buildInitialState);
  const [savedPerms, setSavedPerms] = useState<PermState>(buildInitialState);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("29 Apr 2026 09:24:54 AM");

  const toggleModule = (module: string) =>
    setCollapsed((prev) => ({ ...prev, [module]: !prev[module] }));

  const togglePerm = (key: string, role: Role) => {
    if (role === "System Admin") return;
    setPerms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [role]: !prev[key][role] },
    }));
  };

  const isDirty = useMemo(
    () => JSON.stringify(perms) !== JSON.stringify(savedPerms),
    [perms, savedPerms],
  );

  const handleSaveChanges = () => {
    if (!isDirty) {
      return;
    }

    const snapshot = Object.fromEntries(
      Object.entries(perms).map(([k, v]) => [k, { ...v }]),
    ) as PermState;

    setSavedPerms(snapshot);
    setToast("User permission updated");
    setLastUpdatedAt(
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="p-6 space-y-6">
        {/* Page header — Figma `User Permission` (5029:2029). Figma's Right
            Content slot is empty; Save Changes is kept because permission edits
            would otherwise have no way to persist. */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold text-default whitespace-nowrap">User Permission</h1>
            <p className="text-xs text-body mt-1">
              Last Update: {lastUpdatedAt} ·{" "}
              <span className={isDirty ? "text-warning" : "text-success"}>
                {isDirty ? "Unsaved changes detected" : "All changes saved"}
              </span>
            </p>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={!isDirty}
            className={cn(
              "w-auto shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 py-0 rounded-lg text-sm font-semibold transition-colors",
              isDirty
                ? "bg-primary-default text-invert-default hover:bg-primary-hovered"
                : "bg-disabled text-body cursor-not-allowed",
            )}
          >
            <Icon name="save" size={16} /> Save Changes
          </Button>
        </div>

        {/* Section Layout - Table */}
        <div className="bg-surface rounded-xl border border-invert-default overflow-hidden">
          <div className="p-5">
            <h2 className="text-base font-semibold text-default">User Permission</h2>
          </div>

          {/* Collapsible module groups can't be expressed in the flat TableCustom
              model, so this stays a raw table — Figma's own `Table - Collapsible`
              rows do the same thing. Role columns come from ROLES; Figma's
              `List - If >4 User Roles` (6027:907601) narrows the Modules column
              rather than widening the table, which MODULES_COL_WIDTH mirrors. */}
          <div className="overflow-x-auto w-full relative">
            <table className="w-full min-w-[820px]">
              <thead className="sticky top-0 z-[1001]">
                <tr className="bg-danger-invert-soft border-b border-invert-default">
                  <th
                    className="text-left px-5 py-3 text-sm font-semibold text-primary"
                    style={{ minWidth: MODULES_COL_WIDTH }}
                  >
                    Modules
                  </th>
                  {ROLES.map((role) => (
                    <th
                      key={role}
                      className="px-5 py-3 text-center text-sm font-semibold text-primary w-40"
                    >
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionGroups.map((group) => (
                  <Fragment key={group.module}>
                    {/* Figma `Table - Collapsible` (7021:610098): 28px chevron button, module name and
                        "N permission(s)" both 14 Semi Bold, count in text/body, 8px apart. */}
                    <tr
                      key={`${group.module}-header`}
                      className="bg-default-default border-b border-invert-default cursor-pointer hover:bg-disabled transition-colors"
                      onClick={() => toggleModule(group.module)}
                    >
                      <td colSpan={ROLES.length + 1} className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center text-body">
                            <Icon name={collapsed[group.module] ? "chevron-right" : "chevron-down"} size={16} />
                          </span>
                          <span className="text-sm font-semibold text-default">{group.module}</span>
                          <span className="text-sm font-semibold text-body">
                            {group.permissions.length} permission{group.permissions.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {!collapsed[group.module] &&
                      group.permissions.map((perm) => {
                        const key = `${group.module}::${perm}`;
                        return (
                          <tr
                            key={key}
                            className="h-14 border-b border-invert-default last:border-b-0 hover:bg-main-background transition-colors"
                          >
                            <td className="px-5 py-3 text-sm text-default">{perm}</td>
                            {ROLES.map((role) => {
                              const checked = perms[key]?.[role] ?? false;
                              const isAdmin = role === "System Admin";
                              return (
                                <td key={role} className="px-5 py-3 text-center">
                                  <div className="flex justify-center">
                                    <CustomCheckbox
                                      checked={checked}
                                      readOnly={isAdmin}
                                      onChange={() => togglePerm(key, role)}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast message={toast ?? ""} open={!!toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

import { useState } from "react";
import { permissionGroups, operatorDefaultPerms } from "@/data/userManagement";
import { ChevronDown, ChevronRight, Check, Settings, Monitor, BookOpen, Wrench } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { ROLES, ROLE_COLORS } from "./constants";
import { CustomCheckbox } from "./components/CustomCheckbox";
const ROLE_ICONS = {
    "System Admin": <Settings size={12}/>,
    Operator: <Monitor size={12}/>,
    Instructor: <BookOpen size={12}/>,
    Maintainer: <Wrench size={12}/>,
};
function buildInitialState() {
    const state = {};
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
    const [perms, setPerms] = useState(buildInitialState);
    const [collapsed, setCollapsed] = useState({});
    const toggleModule = (module) => setCollapsed((prev) => ({ ...prev, [module]: !prev[module] }));
    const togglePerm = (key, role) => {
        if (role === "System Admin")
            return;
        setPerms((prev) => ({
            ...prev,
            [key]: { ...prev[key], [role]: !prev[key][role] },
        }));
    };
    // Count enabled perms per role
    const totalPerms = Object.keys(perms).length;
    const roleCounts = ROLES.reduce((acc, role) => {
        acc[role] = Object.values(perms).filter((p) => p[role]).length;
        return acc;
    }, {});
    return (<div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-brand-primary">Role Permission</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage access permissions per role across all modules
            </p>
          </div>
          <Button className="flex items-center w-fit gap-2 px-5 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-semibold transition-colors">
            <Check size={14}/> Save Changes
          </Button>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {ROLES.map((role) => (<div key={role} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1 rounded-md", ROLE_COLORS[role].split(" ").slice(0, 1).join(" "), ROLE_COLORS[role].split(" ")[1])}>
                  {ROLE_ICONS[role]}
                </div>
                <span className="text-xs font-semibold text-gray-700">{role}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{roleCounts[role]}</p>
              <p className="text-xs text-gray-400">of {totalPerms} permissions</p>
            </div>))}
        </div>

        {/* Permission table
            Note: This table uses collapsible module-group rows with colSpan,
            which cannot be expressed in the flat TanStack TableCustom model.
            The outer container follows TRX overflow-auto conventions; the
            internal grouped-row structure is intentionally preserved. */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full relative">
            <table className="w-full min-w-[820px]">
              <thead className="bg-gray-50 sticky top-0 z-[1001]">
                <tr className="bg-red-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-brand-primary w-[260px]">
                    Module / Permission
                  </th>
                  {ROLES.map((role) => (<th key={role} className="px-5 py-3 text-center">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold", ROLE_COLORS[role])}>
                        {role}
                      </span>
                    </th>))}
                </tr>
              </thead>
              <tbody>
                {permissionGroups.map((group) => (<>
                    {/* Module header row — raw button (toggle widget) */}
                    <tr key={`${group.module}-header`} className="bg-gray-50/80 border-b border-gray-100 cursor-pointer hover:bg-gray-100/80 transition-colors" onClick={() => toggleModule(group.module)}>
                      <td colSpan={5} className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {collapsed[group.module] ? (<ChevronRight size={13}/>) : (<ChevronDown size={13}/>)}
                          </span>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                            {group.module}
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal ml-1">
                            ({group.permissions.length} permission
                            {group.permissions.length > 1 ? "s" : ""})
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Permission rows */}
                    {!collapsed[group.module] &&
                group.permissions.map((perm) => {
                    const key = `${group.module}::${perm}`;
                    return (<tr key={key} className={cn("border-b border-gray-50 last:border-b-0 transition-colors", "hover:bg-gray-50/60")}>
                            <td className="px-5 py-3 text-sm text-gray-600 pl-10">{perm}</td>
                            {ROLES.map((role) => {
                            const checked = perms[key]?.[role] ?? false;
                            const isAdmin = role === "System Admin";
                            return (<td key={role} className="px-5 py-3 text-center">
                                  <div className="flex justify-center">
                                    <CustomCheckbox checked={checked} disabled={isAdmin} onChange={() => togglePerm(key, role)}/>
                                  </div>
                                </td>);
                        })}
                          </tr>);
                })}
                  </>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);
}

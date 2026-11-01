import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast } from "@/components/toast";
import { StatusBadge } from "@/components/status-badge";
import { users as seedUsers } from "@/data/userManagement";
import type { User, UserRoleType } from "@/data/userManagement";
import { AddUserDrawer } from "../list/modals/AddUserDrawer";
import { COMPANY_NAMES } from "../list/constants";
import type { AddUserFormValues } from "../list/types";
import { ActivitiesTable } from "./components/ActivitiesTable";
import { MoreMenu } from "./components/MoreMenu";
import { activitiesFor, CREATED_ON, FALLBACK_USER_ID } from "./constants";
import type { UserDetailProps } from "./types";

/*
 * User Details — Figma page 5109:111647:
 *   Active            5014:9360 (+ `Activities Filled` 5014:9392, `Dropdown - More` 7021:596179)
 *   Active (Operator) 7021:593632 (+ `Dropdown - More` 7021:593634) — adds "Armskote Personnel"
 *   Archived          5947:73530 — "Inactive" badge, header holds only "Restore"
 * No tabs: a `User Details` key-value card and an `Activities` table card.
 * Header actions: Edit User → the Add User drawer in edit mode (5014:9323);
 * ⋮ → Move to Archive / Reset Password; Restore (archived). Dialog + toast copy
 * from the User List page's `Action - …` sections (5014:57).
 */

/** Figma `Key Value` (Vertical): 12 Regular text/body title, 4px gap, 14 Semi Bold text/default value. */
function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-body">{label}</span>
      <span className="truncate text-sm font-semibold text-default">{children}</span>
    </div>
  );
}

/** Figma `Section Layout`: white card, border/invert/default, r12; `Section Header` 20px padding, 16 Semi Bold. */
function SectionCard({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-invert-default bg-surface">
      <div className="flex items-center gap-2 p-5 text-base font-semibold leading-6">
        <h2 className="text-default">{title}</h2>
        {count !== undefined && <span className="text-body">{count}</span>}
      </div>
      {children}
    </section>
  );
}

function resolveUser(state: unknown, search: string): User {
  const fromState = (state as { user?: User } | null)?.user;
  if (fromState) return fromState;
  const id = new URLSearchParams(search).get("id") ?? FALLBACK_USER_ID;
  return seedUsers.find((u) => u.id === id) ?? seedUsers[0];
}

export function UserDetail(_props: UserDetailProps) {
  const location = useLocation();
  // Local copy: Edit / Archive / Restore change what this page shows (mock data, no API).
  const [user, setUser] = useState<User>(() => resolveUser(location.state, location.search));
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<"archive" | "reset" | "restore" | null>(null);
  const [toast, setToast] = useState("");

  const archived = user.accountStatus !== "Active";
  const isOperator = user.userRole === "Operator";
  const activities = useMemo(() => activitiesFor(user), [user]);
  const companyOptions = useMemo(
    () => [...new Set([...COMPANY_NAMES, user.companyName ?? ""].filter(Boolean))].sort(),
    [user.companyName],
  );

  const handleUpdate = (v: AddUserFormValues) => {
    const svcId = v.svcId.trim();
    setUser((u) => ({
      ...u,
      name: v.name.trim(),
      rank: v.rank,
      // Prefilled Service ID is the masked one; only re-mask when a new Service ID was typed.
      svcId: svcId.startsWith("*") ? svcId : `*****${svcId.slice(-4).toUpperCase()}`,
      companyName: v.companyName || undefined,
      userRole: v.role as UserRoleType,
      armskotePersonnel: v.role === "Operator" ? v.armskotePersonnel : undefined,
    }));
    // Figma `Action - Edit User` → `Toast - Success` (5014:9335): "{Name} updated".
    setToast(`${v.name.trim()} updated`);
  };

  const onConfirm = () => {
    if (confirm === "archive") {
      setUser((u) => ({ ...u, accountStatus: "Archived" }));
      // 5157:101519: "{Name} moved to archive".
      setToast(`${user.name} moved to archive`);
    } else if (confirm === "restore") {
      setUser((u) => ({ ...u, accountStatus: "Active" }));
      // 6024:467863: "{Name} restored".
      setToast(`${user.name} restored`);
    } else if (confirm === "reset") {
      // 5157:102967: "Password reset sent to {Name}".
      setToast(`Password reset sent to ${user.name}`);
    }
    setConfirm(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="flex flex-col gap-6 p-6">
        {/* Figma `Page Header`: name + status badge (10px gap), "ID #…" badge 4px below; actions right. */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-default">{user.name}</h1>
              {archived ? (
                <StatusBadge tone="danger">Inactive</StatusBadge>
              ) : (
                <StatusBadge tone="success">Active</StatusBadge>
              )}
            </div>
            {/* Figma `Badge` solid: background/default/invert/default, border/base, r4, 12/2 padding, 14 Medium. */}
            <span className="inline-flex w-fit items-center rounded border border-base bg-default-invert-default px-3 py-0.5 text-sm font-medium text-invert-default">
              ID #{user.userId}
            </span>
          </div>

          {archived ? (
            /* Figma `Button Secondary` "Restore" (5947:73530). Its `archive-restore`
               icon is not in the Icon library — label only until it is added. */
            <button
              type="button"
              onClick={() => setConfirm("restore")}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors"
            >
              Restore
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-3">
              <Button
                onClick={() => setEditOpen(true)}
                className="inline-flex h-10 w-auto items-center justify-center gap-2 rounded-lg bg-primary-default px-4 py-0 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
              >
                <Icon name="pencil" size={18} />
                Edit User
              </Button>
              <MoreMenu
                onArchive={() => setConfirm("archive")}
                onResetPassword={() => setConfirm("reset")}
              />
            </div>
          )}
        </div>

        {/* User Details card — rows of 4 `Key Value`s, 20px gaps. */}
        <SectionCard title="User Details">
          <div className="grid grid-cols-4 gap-5 px-5 pb-5">
            <KeyValue label="Rank">{user.rank}</KeyValue>
            <KeyValue label="Service ID">{user.svcId}</KeyValue>
            <KeyValue label="Company Name">{user.companyName || "—"}</KeyValue>
            <KeyValue label="Role">{user.userRole}</KeyValue>
            {isOperator && (
              <KeyValue label="Armskote Personnel">{user.armskotePersonnel ? "Yes" : "No"}</KeyValue>
            )}
            <KeyValue label="Created on">{CREATED_ON}</KeyValue>
          </div>
        </SectionCard>

        <SectionCard title="Activities" count={activities.length}>
          <ActivitiesTable rows={activities} />
        </SectionCard>
      </div>

      <AddUserDrawer
        mode="edit"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdate}
        companyOptions={companyOptions}
        initialValues={{
          name: user.name,
          rank: user.rank,
          svcId: user.svcId,
          companyName: user.companyName ?? "",
          role: user.userRole,
          armskotePersonnel: !!user.armskotePersonnel,
        }}
      />

      {/* Copy verbatim from the User List page's confirmation frames (5014:57). */}
      <ConfirmDialog
        open={confirm === "archive"}
        tone="warning"
        title={`Archive “${user.name}”?`}
        subtitle="This will be moved to the archive and removed from active lists. You can restore it at any time."
        confirmLabel="Move to Archive"
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        tone="warning"
        title={`Reset password for “${user.name}”?`}
        subtitle="They'll be sent a new temporary password and asked to set a new one at next login."
        confirmLabel="Reset Password"
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        open={confirm === "restore"}
        tone="warning"
        title={`Restore “${user.name}”?`}
        subtitle={
          <>
            This user will be moved back to the User List with status{" "}
            <span className="font-semibold">Active</span>.
          </>
        }
        confirmLabel="Restore"
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirm}
      />

      <Toast message={toast} open={!!toast} onDismiss={() => setToast("")} />
    </div>
  );
}

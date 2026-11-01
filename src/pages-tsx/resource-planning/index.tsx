import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { FormikProps } from "formik";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { STATIONS, INITIAL_LIMITS, INITIAL_RESOURCES, INITIAL_ROLES, type Limits, type ResourceType, type Role, type Station } from "./data";
import { ResourceTypesCard } from "./components/ResourceTypesCard";
import { SystemLimitsCard } from "./components/SystemLimitsCard";
import { RoleRequirementsCard } from "./components/RoleRequirementsCard";

/*
 * Resource Planning — Figma page `Resource Planning` (5004:113420), new design:
 * `Resource Planning - View` (6875:125827) and its Edit sections (Resource Types 6900:44444 ·
 * System Limits 8054:29705 · Role Requirements 8054:34862, with their error frames) and the
 * shared `Discard` dialog (6900:43691).
 *
 * Page Header (title + subtitle, no page-level button), then three cards, gap 24, each with its
 * own "Edit". Editing one card turns its header button into Cancel + Save Changes and the
 * breadcrumb into "Resource Planning › Edit Resource Planning" (?edit=<card> — Header.tsx reads it).
 * One card is edited at a time; Cancel (or Edit on another card) with unsaved changes opens the
 * Discard dialog. Everything is local state — nothing is persisted.
 *
 * Replaces the earlier design (Base Stations tab list, per-station System Limits row,
 * "Weapon × Resources" table, single "Edit Resource Planning" button) — see F-005 RP-1.
 */

type CardKey = "types" | "limits" | "roles";
const CARD_KEYS: CardKey[] = ["types", "limits", "roles"];

export function ResourcePlanning() {
  const [resources, setResources] = useState<ResourceType[]>(INITIAL_RESOURCES);
  const [limits, setLimits] = useState<Limits>(INITIAL_LIMITS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);

  const [params, setParams] = useSearchParams();
  const editParam = params.get("edit") as CardKey | null;
  const editing: CardKey | null = editParam && CARD_KEYS.includes(editParam) ? editParam : null;
  const setEditing = (key: CardKey | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key) next.set("edit", key);
        else next.delete("edit");
        return next;
      },
      { replace: true },
    );

  const formRef = useRef<FormikProps<any> | null>(null);
  /** Where to go once the user confirms the Discard dialog: another card, or out of edit. */
  const [pending, setPending] = useState<{ to: CardKey | null } | null>(null);

  const requestEdit = (key: CardKey) => {
    if (editing && editing !== key && formRef.current?.dirty) setPending({ to: key });
    else setEditing(key);
  };
  const requestCancel = (dirty: boolean) => {
    if (dirty) setPending({ to: null });
    else setEditing(null);
  };

  const saveResources = (next: ResourceType[]) => {
    setResources(next);
    // A new resource starts at 0 on every station; a deleted one drops its limits row.
    setLimits((prev) =>
      Object.fromEntries(
        next.map((r) => [
          r.id,
          prev[r.id] ?? (Object.fromEntries(STATIONS.map((st) => [st, 0])) as Record<Station, number>),
        ]),
      ),
    );
    setEditing(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-main-background">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-default">Resource Planning</h1>
          <p className="text-xs text-body">Configure resource limits and weapon-to-resource mapping per station</p>
        </div>

        <ResourceTypesCard
          resources={resources}
          editing={editing === "types"}
          onEdit={() => requestEdit("types")}
          onCancel={requestCancel}
          onSave={saveResources}
          formRef={formRef}
        />
        <SystemLimitsCard
          resources={resources}
          roles={roles}
          limits={limits}
          editing={editing === "limits"}
          onEdit={() => requestEdit("limits")}
          onCancel={requestCancel}
          onSave={(next) => {
            setLimits(next);
            setEditing(null);
          }}
          formRef={formRef}
        />
        <RoleRequirementsCard
          resources={resources}
          roles={roles}
          limits={limits}
          editing={editing === "roles"}
          onEdit={() => requestEdit("roles")}
          onCancel={requestCancel}
          onSave={(next) => {
            setRoles(next);
            setEditing(null);
          }}
          formRef={formRef}
        />
      </div>

      <ConfirmDialog
        open={pending !== null}
        tone="warning"
        title="Leave this page?"
        subtitle="You have unsaved settings. If you go back now, all the information you’ve entered will be lost."
        cancelLabel="Continue Editing"
        confirmLabel="Yes, Leave"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          setEditing(pending?.to ?? null);
          setPending(null);
        }}
      />
    </div>
  );
}

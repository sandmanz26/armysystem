import { useMemo } from "react";
import { Formik, Form, yupToFormErrors, useFormikContext, type FormikProps } from "formik";
import * as Yup from "yup";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";
import { STATIONS, WEAPONS, roleNeed, type Limits, type ResourceType, type Role, type Weapon } from "../data";
import { DangerCaption, EditActions, EditButton, SectionCard, TooltipList, digitsOnly } from "./SectionCard";

/*
 * Role Requirements — Figma 6875:125827 (view), `Edit - Role Requirements`: `Edit` (8054:34862)
 * and `Edit - Pax Error` (8060:73122).
 *
 * One small table (`Table - Header Cell Sm` / `Body Cell Sm`: 12px text, 16px side padding,
 * 36px rows, header 48 with bottom-aligned labels): a fixed 136px "Weapons" column, then one
 * 120px column per role, scrolling horizontally. Weapon rows show the count or "—" (`text/body`)
 * when the role doesn't use that weapon. Under a grey "Resources Needed" bar, one row per resource:
 * Pax is entered per role; every other resource = the role's counts summed over the weapons ticked
 * for it in Resource Types.
 * Edit: every weapon cell and the Pax row become 88×36 Inputs (placeholder "0"); the computed rows
 * stay read-only and follow the typed counts. A Pax above a station's Pax limit shows
 * "Over Pax limit at X of 5 base stations" with an info tooltip listing those stations.
 */

interface DraftRole {
  id: string;
  pax: string;
  weapons: Partial<Record<Weapon, string>>;
}
interface Values {
  roles: DraftRole[];
}

type Row =
  | { kind: "weapon"; weapon: Weapon }
  | { kind: "group" }
  | { kind: "resource"; resource: ResourceType };

const toRole = (base: Role, d: DraftRole): Role => ({
  ...base,
  pax: Number(d.pax || 0),
  weapons: Object.fromEntries(
    Object.entries(d.weapons)
      .map(([w, v]) => [w, Number(v || 0)] as const)
      .filter(([, n]) => n > 0),
  ),
});

const stationsBelow = (limits: Limits, pax: number) =>
  STATIONS.filter((st) => (limits.pax?.[st] ?? 0) < pax);

function WeaponInput({ idx, weapon }: { idx: number; weapon: Weapon }) {
  const { values, setFieldValue } = useFormikContext<Values>();
  return (
    <Input
      size="sm"
      value={values.roles[idx].weapons[weapon] ?? ""}
      placeholder="0"
      inputMode="numeric"
      aria-label={weapon}
      onChange={(e) => setFieldValue(`roles.${idx}.weapons.${weapon}`, digitsOnly(e.target.value))}
      wrapperClassName="w-[88px]"
    />
  );
}

function PaxInput({ idx, limits }: { idx: number; limits: Limits }) {
  const { values, errors, setFieldValue } = useFormikContext<Values>();
  const value = values.roles[idx].pax;
  const err = (errors.roles as Array<{ pax?: string } | undefined> | undefined)?.[idx]?.pax;
  const below = stationsBelow(limits, Number(value || 0));
  return (
    <div className="w-[88px]">
      <Input
        size="sm"
        value={value}
        placeholder="0"
        inputMode="numeric"
        aria-label="Pax"
        onChange={(e) => setFieldValue(`roles.${idx}.pax`, digitsOnly(e.target.value))}
        status={err ? "danger" : "default"}
        wrapperClassName="w-[88px]"
      />
      {err && (
        <DangerCaption
          text={err}
          tooltip={
            <TooltipList
              lead={`This role needs ${Number(value)} Pax, but these stations allow fewer:`}
              items={below.map((st) => `${st}: ${limits.pax?.[st] ?? 0} Pax`)}
            />
          }
        />
      )}
    </div>
  );
}

function RolesTable({
  resources,
  roles,
  limits,
  editing = false,
}: {
  resources: ResourceType[];
  roles: Role[];
  limits: Limits;
  editing?: boolean;
}) {
  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
      {
        id: "weapons",
        header: () => "Weapons",
        width: "136px",
        cell: (info: any) => {
          const row = info.row.original as Row;
          const label =
            row.kind === "weapon" ? row.weapon : row.kind === "group" ? "Resources Needed" : row.resource.name;
          return (
            <span
              className={cn(
                "block text-xs text-default",
                row.kind === "group" && "font-medium",
                editing && row.kind !== "group" && "py-2.5",
              )}
            >
              {label}
            </span>
          );
        },
      },
      ...roles.map<ColumnDef<Row, any>>((role, idx) => ({
        id: role.id,
        header: () => <span className="block w-[88px] whitespace-normal">{role.name}</span>,
        width: "120px",
        cell: (info: any) => {
          const row = info.row.original as Row;
          if (row.kind === "group") return null;
          if (row.kind === "weapon") {
            if (editing) return <WeaponInput idx={idx} weapon={row.weapon} />;
            const n = role.weapons[row.weapon] ?? 0;
            return n ? (
              <span className="text-xs text-default">{n}</span>
            ) : (
              <span className="text-xs text-body">—</span>
            );
          }
          if (editing && row.resource.kind === "pax") return <PaxInput idx={idx} limits={limits} />;
          if (editing) return <DraftNeed idx={idx} role={role} resource={row.resource} />;
          return <span className="block text-xs text-default">{roleNeed(role, row.resource)}</span>;
        },
      })),
    ],
    // Stable while typing — flexRender treats each `cell` function as a component type, so a new
    // function per keystroke would remount (and blur) the focused Input.
    [roles, editing, limits],
  );

  const data = useMemo<Row[]>(
    () => [
      ...WEAPONS.map((weapon) => ({ kind: "weapon" as const, weapon })),
      { kind: "group" as const },
      ...resources.map((resource) => ({ kind: "resource" as const, resource })),
    ],
    [resources],
  );

  return (
    <TableCustom
      columns={columns}
      data={data}
      autoScrollTable
      frozenColumns={1}
      className="rounded-b-xl"
      classTheadTh="h-12 px-4 py-2 align-bottom text-xs whitespace-normal first:border-r"
      classTBodyTd={cn("h-9 px-4 text-xs first:border-r", editing ? "py-1 align-top" : "py-2")}
      getRowClass={(row: Row) =>
        cn(
          "[&:last-child>td]:border-b-0",
          row.kind === "group" && "[&>td]:h-8 [&>td]:bg-default-default [&>td]:border-r-0",
          editing && row.kind === "resource" && row.resource.kind !== "pax" && "[&>td]:py-0",
        )
      }
    />
  );
}

/** A computed "Resources Needed" cell that follows the typed weapon counts. */
function DraftNeed({ idx, role, resource }: { idx: number; role: Role; resource: ResourceType }) {
  const { values } = useFormikContext<Values>();
  return (
    <span className="block py-2.5 text-xs text-default">{roleNeed(toRole(role, values.roles[idx]), resource)}</span>
  );
}

export function RoleRequirementsCard({
  resources,
  roles,
  limits,
  editing,
  onEdit,
  onCancel,
  onSave,
  formRef,
}: {
  resources: ResourceType[];
  roles: Role[];
  limits: Limits;
  editing: boolean;
  onEdit: () => void;
  onCancel: (dirty: boolean) => void;
  onSave: (roles: Role[]) => void;
  formRef: React.MutableRefObject<FormikProps<any> | null>;
}) {
  const header = { title: "Role Requirements", count: roles.length, subtitle: "Set weapons and pax per role." };
  if (!editing) {
    return (
      <SectionCard {...header} actions={<EditButton onClick={onEdit} />}>
        <RolesTable resources={resources} roles={roles} limits={limits} />
      </SectionCard>
    );
  }
  const initial: Values = {
    roles: roles.map((r) => ({
      id: r.id,
      pax: String(r.pax),
      weapons: Object.fromEntries(Object.entries(r.weapons).map(([w, n]) => [w, n ? String(n) : ""])),
    })),
  };
  const schema = Yup.object({
    roles: Yup.array().of(
      Yup.object({
        pax: Yup.string().test("over-pax", function (v) {
          const n = stationsBelow(limits, Number(v || 0)).length;
          return (
            n === 0 ||
            this.createError({ message: `Over Pax limit at ${n} of ${STATIONS.length} base stations` })
          );
        }),
      }),
    ),
  });
  return (
    <Formik<Values>
      innerRef={formRef}
      initialValues={initial}
      validate={(v) => {
        try {
          schema.validateSync(v, { abortEarly: false });
          return {};
        } catch (e) {
          return yupToFormErrors(e);
        }
      }}
      onSubmit={(v) => onSave(roles.map((r, i) => toRole(r, v.roles[i])))}
    >
      {(formik) => (
        <Form noValidate>
          <SectionCard {...header} actions={<EditActions onCancel={() => onCancel(formik.dirty)} />}>
            <RolesTable resources={resources} roles={roles} limits={limits} editing />
          </SectionCard>
        </Form>
      )}
    </Formik>
  );
}

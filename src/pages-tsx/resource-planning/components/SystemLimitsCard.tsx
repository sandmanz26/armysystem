import { useMemo } from "react";
import { Formik, Form, yupToFormErrors, useFormikContext, type FormikProps } from "formik";
import * as Yup from "yup";
import { type ColumnDef } from "@tanstack/react-table";
import { TableCustom } from "@/components/table";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";
import { STATIONS, roleNeed, type Limits, type ResourceType, type Role, type Station } from "../data";
import { DangerCaption, EditActions, EditButton, SectionCard, TooltipList, digitsOnly } from "./SectionCard";

/*
 * System Limits — Figma `Table - Resource Planning - SystemLimits` in 6875:125827, plus the
 * `Edit - System Limits` section: `Edit` (8054:29705), `Edit - Empty Error` (8060:55916),
 * `Edit - Filled Error` (8060:57595).
 *
 * Columns: "Resource Types" 296 · WPT-01…05 136 each · "Total" 120 (a fixed column with a hairline
 * on its left; values 14 Semi Bold). Rows are 56 tall in view. In edit every station cell holds a
 * 96×40 Input (row 64); Total stays read-only and follows the typed values.
 * Errors (caption under the input, `text/danger`):
 *   "Enter a limit"            — empty, or Pax at 0 (8060:55916 shows Pax "0" with this caption)
 *   "Too low for N roles" (i)  — Pax only: the limit is below the Pax of N roles; the info
 *                                 icon's tooltip lists "<role> needs <n>" (8060:57595).
 */

type Draft = Record<string, Record<Station, string>>;
interface Values {
  limits: Draft;
}

const rolesOver = (roles: Role[], resource: ResourceType, limit: number) =>
  roles.filter((r) => roleNeed(r, resource) > limit);

const schemaFor = (resources: ResourceType[], roles: Role[]) =>
  Yup.object({
    limits: Yup.object(
      Object.fromEntries(
        resources.map((res) => [
          res.id,
          Yup.object(
            Object.fromEntries(
              STATIONS.map((st) => [
                st,
                Yup.string()
                  .required("Enter a limit")
                  .test("pax-zero", "Enter a limit", (v) => res.kind !== "pax" || Number(v) > 0)
                  .test("too-low", function (v) {
                    // Pax only: Figma's Edit frame (8054:29705) shows IGs WPT-02 = 1 and Monitors
                    // WPT-02 = 0 with no error although GPMG Team needs 3 / 2 of them.
                    if (res.kind !== "pax") return true;
                    const n = rolesOver(roles, res, Number(v)).length;
                    return n === 0 || this.createError({ message: `Too low for ${n} role${n === 1 ? "" : "s"}` });
                  }),
              ]),
            ),
          ),
        ]),
      ),
    ),
  });

type Row = { resource: ResourceType };

function LimitCell({ resource, station, roles }: { resource: ResourceType; station: Station; roles: Role[] }) {
  const { values, errors, setFieldValue } = useFormikContext<Values>();
  const value = values.limits[resource.id]?.[station] ?? "";
  const err = (errors.limits as Record<string, Record<string, string>> | undefined)?.[resource.id]?.[station];
  const over = err?.startsWith("Too low") ? rolesOver(roles, resource, Number(value)) : [];
  return (
    <div className="w-24">
      <Input
        value={value}
        inputMode="numeric"
        aria-label={`${resource.name} ${station}`}
        onChange={(e) => setFieldValue(`limits.${resource.id}.${station}`, digitsOnly(e.target.value))}
        status={err ? "danger" : "default"}
        wrapperClassName="w-24"
      />
      {err && (
        <DangerCaption
          text={err}
          tooltip={
            over.length > 0 ? (
              <TooltipList items={over.map((r) => `${r.name} needs ${roleNeed(r, resource)}`)} />
            ) : undefined
          }
        />
      )}
    </div>
  );
}

function LimitsTable({
  resources,
  roles,
  limits,
  editing,
}: {
  resources: ResourceType[];
  roles: Role[];
  limits: Limits;
  editing: boolean;
}) {
  const columns = useMemo<ColumnDef<Row, any>[]>(
    () => [
      {
        id: "resource",
        header: () => "Resource Types",
        width: "296px",
        cell: (info: any) => (
          <span className={cn("block text-sm text-default", editing && "py-2.5")}>
            {info.row.original.resource.name}
          </span>
        ),
      },
      ...STATIONS.map<ColumnDef<Row, any>>((st) => ({
        id: st,
        header: () => st,
        width: "136px",
        cell: (info: any) => {
          const res = info.row.original.resource as ResourceType;
          return editing ? (
            <LimitCell resource={res} station={st} roles={roles} />
          ) : (
            <span className="text-sm text-default">{limits[res.id]?.[st] ?? 0}</span>
          );
        },
      })),
      {
        id: "total",
        header: () => "Total",
        width: "120px",
        cell: (info: any) => {
          const res = info.row.original.resource as ResourceType;
          return editing ? (
            <DraftTotal id={res.id} />
          ) : (
            <span className="block text-sm font-semibold text-default">
              {STATIONS.reduce((s, st) => s + (limits[res.id]?.[st] ?? 0), 0)}
            </span>
          );
        },
      },
    ],
    // Columns must stay referentially stable while typing: TableCustom's flexRender treats each
    // `cell` function as a component type, so a new function would remount the focused Input.
    [editing, roles, limits],
  );
  const data = useMemo(() => resources.map((resource) => ({ resource })), [resources]);

  return (
    <TableCustom
      columns={columns}
      data={data}
      autoScrollTable
      className="rounded-b-xl"
      classTheadTh="h-12 last:border-l last:shadow-sm"
      classTBodyTd={cn("last:border-l last:shadow-sm", editing && "align-top")}
      getRowClass={() => "[&:last-child>td]:border-b-0"}
    />
  );
}

/** Total follows the typed values while editing. */
function DraftTotal({ id }: { id: string }) {
  const { values } = useFormikContext<Values>();
  return (
    <span className="block py-2.5 text-sm font-semibold text-default">
      {STATIONS.reduce((s, st) => s + Number(values.limits[id]?.[st] || 0), 0)}
    </span>
  );
}

export function SystemLimitsCard({
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
  onSave: (limits: Limits) => void;
  formRef: React.MutableRefObject<FormikProps<any> | null>;
}) {
  if (!editing) {
    return (
      <SectionCard title="System Limits" subtitle="Maximum per base station" actions={<EditButton onClick={onEdit} />}>
        <LimitsTable resources={resources} roles={roles} limits={limits} editing={false} />
      </SectionCard>
    );
  }
  const initial: Values = {
    limits: Object.fromEntries(
      resources.map((r) => [
        r.id,
        Object.fromEntries(STATIONS.map((st) => [st, String(limits[r.id]?.[st] ?? 0)])) as Record<Station, string>,
      ]),
    ),
  };
  return (
    <Formik<Values>
      innerRef={formRef}
      initialValues={initial}
      validateOnMount
      validate={(v) => {
        try {
          schemaFor(resources, roles).validateSync(v, { abortEarly: false });
          return {};
        } catch (e) {
          return yupToFormErrors(e);
        }
      }}
      onSubmit={(v) =>
        onSave(
          Object.fromEntries(
            Object.entries(v.limits).map(([id, row]) => [
              id,
              Object.fromEntries(STATIONS.map((st) => [st, Number(row[st] || 0)])) as Record<Station, number>,
            ]),
          ),
        )
      }
    >
      {(formik) => (
        <Form noValidate>
          <SectionCard
            title="System Limits"
            subtitle="Maximum per base station"
            actions={<EditActions onCancel={() => onCancel(formik.dirty)} />}
          >
            <LimitsTable resources={resources} roles={roles} limits={limits} editing />
          </SectionCard>
        </Form>
      )}
    </Formik>
  );
}

import { Fragment } from "react";
import { Formik, Form, yupToFormErrors, type FormikProps } from "formik";
import * as Yup from "yup";
import { Icon } from "@/components/icon";
import { Input } from "@/components/input";
import { Chip } from "@/components/chip";
import { ChipAdvanced, ChipAdvancedGroup } from "@/components/chip-advanced";
import { WEAPONS, newResourceId, type ResourceType, type Weapon } from "../data";
import { EditActions, EditButton, SectionCard } from "./SectionCard";

/*
 * Resource Types — Figma `Resource Planning - View` (6875:125827) and the
 * `Edit - Resource Types` section: `Edit` (6900:44444), `Edit - Add New Empty Error`
 * (8060:43191), `Edit - Add New Filled Error` (8060:44186), `Discard` (6900:43691).
 *
 * View: one `Resource Type-Item` per resource — name 14 Semi Bold (+ 13px `Icon / lock` for the
 * built-in ones), then a 12 Regular `text/caption` line ("Entered per role" for Pax,
 * "= sum of these weapons" + filled chips, or "= no weapons yet") — separated by dividers, gap 20.
 * Edit: the name becomes a 320px Input with a 22px lock (built-in) or a 40px danger trash button
 * (custom); every weapon is a `Chip Advanced Item` (36px, check when ticked); the last row adds a
 * resource ("Enter Resource Name (e.g. Laser emitters)" + "Add Resource").
 */

interface Values {
  resources: ResourceType[];
  newName: string;
}

/** Rebuilt per validation so the uniqueness test can see every other row. */
const schemaFor = (values: Values) =>
  Yup.object({
    resources: Yup.array().of(
      Yup.object({
        name: Yup.string()
          .trim()
          .required("Enter a name")
          .test(
            "unique",
            "This name is already used",
            (v) =>
              values.resources.filter(
                (r) => r.name.trim().toLowerCase() === (v ?? "").trim().toLowerCase(),
              ).length <= 1,
          ),
      }),
    ),
  });

const validate = (values: Values) => {
  try {
    schemaFor(values).validateSync(values, { abortEarly: false });
    return {};
  } catch (e) {
    return yupToFormErrors(e);
  }
};

/** The add-row field is validated only when "Add Resource" is clicked, not on Save. */
const addSchema = (existing: ResourceType[]) =>
  Yup.string()
    .trim()
    .required("Enter a name")
    .test(
      "unique",
      "This name is already used",
      (v) => !existing.some((r) => r.name.trim().toLowerCase() === (v ?? "").trim().toLowerCase()),
    );

function ResourceView({ resources }: { resources: ResourceType[] }) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-5">
      {resources.map((r, i) => (
        <Fragment key={r.id}>
          {i > 0 && <div className="h-px bg-divider" />}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-default">{r.name}</span>
              {r.locked && <Icon name="lock" size={13} className="text-body" />}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-caption">
                {r.kind === "pax"
                  ? "Entered per role"
                  : r.weapons.length
                    ? "= sum of these weapons"
                    : "= no weapons yet"}
              </p>
              {r.kind === "weapons" && r.weapons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {WEAPONS.filter((w) => r.weapons.includes(w)).map((w) => (
                    <Chip key={w} kind="filled">
                      {w}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function ResourceEdit({ formik }: { formik: FormikProps<Values> }) {
  const { values, errors, touched, setFieldValue, setFieldTouched, status, setStatus } = formik;

  const toggle = (idx: number, w: Weapon) => {
    const cur = values.resources[idx].weapons;
    setFieldValue(
      `resources.${idx}.weapons`,
      cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w],
    );
  };

  const add = () => {
    try {
      addSchema(values.resources).validateSync(values.newName);
    } catch (e) {
      setStatus({ newName: (e as Yup.ValidationError).message });
      return;
    }
    const name = values.newName.trim();
    const id = newResourceId(name, values.resources.map((r) => r.id));
    setFieldValue("resources", [...values.resources, { id, name, locked: false, kind: "weapons", weapons: [] }]);
    setFieldValue("newName", "");
    setStatus(undefined);
  };

  const rowErrors = (errors.resources ?? []) as Array<{ name?: string } | undefined>;
  const rowTouched = (touched.resources ?? []) as Array<{ name?: boolean } | undefined>;

  return (
    <div className="flex flex-col gap-5 px-5 pb-5">
      {values.resources.map((r, i) => {
        const err = rowTouched[i]?.name || formik.submitCount > 0 ? rowErrors[i]?.name : undefined;
        return (
          <Fragment key={r.id}>
            {i > 0 && <div className="h-px bg-divider" />}
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <Input
                  value={r.name}
                  onChange={(e) => setFieldValue(`resources.${i}.name`, e.target.value)}
                  onBlur={() => setFieldTouched(`resources.${i}.name`, true)}
                  status={err ? "danger" : "default"}
                  caption={err}
                  wrapperClassName="w-80"
                  aria-label="Resource name"
                />
                {r.locked ? (
                  <span className="flex h-10 items-center">
                    <Icon name="lock" size={22} className="text-body" />
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Delete ${r.name}`}
                    onClick={() =>
                      setFieldValue(
                        "resources",
                        values.resources.filter((x) => x.id !== r.id),
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-danger bg-surface text-danger transition-colors hover:bg-danger-invert-soft"
                  >
                    <Icon name="trash-2" size={18} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-caption">
                  {r.kind === "pax" ? "Entered per role" : "= sum of these weapons"}
                </p>
                {r.kind === "weapons" && (
                  <ChipAdvancedGroup multi className="gap-2">
                    {WEAPONS.map((w) => (
                      <ChipAdvanced
                        key={w}
                        multi
                        size="sm"
                        checkIcon
                        label={w}
                        selected={r.weapons.includes(w)}
                        onSelect={() => toggle(i, w)}
                      />
                    ))}
                  </ChipAdvancedGroup>
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
      <div className="h-px bg-divider" />
      <div className="flex items-start gap-2">
        <Input
          value={values.newName}
          onChange={(e) => {
            setFieldValue("newName", e.target.value);
            if (status?.newName) setStatus(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Enter Resource Name (e.g. Laser emitters)"
          status={status?.newName ? "danger" : "default"}
          caption={status?.newName}
          wrapperClassName="flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default transition-colors hover:bg-default-hovered"
        >
          <Icon name="plus" size={16} />
          Add Resource
        </button>
      </div>
    </div>
  );
}

export function ResourceTypesCard({
  resources,
  editing,
  onEdit,
  onCancel,
  onSave,
  formRef,
}: {
  resources: ResourceType[];
  editing: boolean;
  onEdit: () => void;
  onCancel: (dirty: boolean) => void;
  onSave: (resources: ResourceType[]) => void;
  formRef: React.MutableRefObject<FormikProps<any> | null>;
}) {
  if (!editing) {
    return (
      <SectionCard
        title="Resource Types"
        subtitle="Tick the weapons that count toward each resource"
        actions={<EditButton onClick={onEdit} />}
      >
        <ResourceView resources={resources} />
      </SectionCard>
    );
  }
  return (
    <Formik<Values>
      innerRef={formRef}
      initialValues={{ resources, newName: "" }}
      validate={validate}
      onSubmit={(v) =>
        onSave(v.resources.map((r) => ({ ...r, name: r.name.trim() })))
      }
    >
      {(formik) => (
        <Form noValidate>
          <SectionCard
            title="Resource Types"
            subtitle="Tick the weapons that count toward each resource"
            actions={<EditActions onCancel={() => onCancel(formik.dirty)} />}
          >
            <ResourceEdit formik={formik} />
          </SectionCard>
        </Form>
      )}
    </Formik>
  );
}

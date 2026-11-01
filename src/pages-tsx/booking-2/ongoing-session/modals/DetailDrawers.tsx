import { Formik } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Checkbox } from "@/components/checkbox";
import { Select } from "@/components/select";
import { HIDDEN_FEATURES } from "@/config/hiddenFeatures";

// Figma's stage list, verbatim — `Create New Detail - Empty` (5753:140639),
// `Edit Stage` (5765:216870). Nothing in the booking model backs "stages"
// yet; see docs/OPEN-DECISIONS.md.
export const STAGES = ["Stage A", "Stage B", "Stage C", "Stage D", "Stage E"];

function DrawerFooter({ onCancel, onConfirm, confirmLabel }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string }) {
  return (
    <>
      <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-soft transition-colors">
        Cancel
      </button>
      <button type="button" onClick={onConfirm} className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors">
        {confirmLabel}
      </button>
    </>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-0.5 text-sm font-medium text-default">
      {children} <span className="text-danger">*</span>
    </span>
  );
}

function StageChecklist({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const all = value.length === STAGES.length;
  return (
    <div className="flex flex-col">
      <Checkbox
        label="Select All"
        checked={all}
        indeterminate={value.length > 0 && !all}
        onChange={() => onChange(all ? [] : [...STAGES])}
      />
      <div className="flex flex-col pl-4">
        {STAGES.map((s) => (
          <Checkbox
            key={s}
            label={s}
            checked={value.includes(s)}
            onChange={() => onChange(value.includes(s) ? value.filter((x) => x !== s) : STAGES.filter((x) => x === s || value.includes(x)))}
          />
        ))}
      </div>
    </div>
  );
}

const createSchema = Yup.object({
  // Booking Type is hidden (flag `createDetailBookingType`, Figma has Base Station only) → not required then.
  stages: HIDDEN_FEATURES.createDetailBookingType ? Yup.array().of(Yup.string()).min(1, "Booking Type is required") : Yup.array().of(Yup.string()),
  station: Yup.string().required("Base Station is required"),
});

/** Figma `Create New Detail - Empty/Filled` — opened from the Detail List's
 *  "Create New Detail" button. */
export function CreateDetailDrawer({
  open,
  stations,
  onClose,
  onCreate,
}: {
  open: boolean;
  stations: string[];
  onClose: () => void;
  onCreate: (v: { stages: string[]; station: string }) => void;
}) {
  if (!open) return null;
  return (
    <Formik initialValues={{ stages: [] as string[], station: "" }} validationSchema={createSchema} onSubmit={onCreate}>
      {({ values, errors, submitCount, setFieldValue, submitForm }) => (
        <Drawer open onClose={onClose} title="Create New Detail" footer={<DrawerFooter onCancel={onClose} onConfirm={submitForm} confirmLabel="Create Detail" />}>
          <Select
            label="Base Station"
            required
            placeholder="Select Base Station"
            options={stations}
            value={values.station}
            onChange={(v) => setFieldValue("station", v)}
            status={submitCount > 0 && errors.station ? "danger" : "default"}
            caption={submitCount > 0 ? errors.station : undefined}
          />
          {/* Dev feedback #16: Figma's drawer is Base Station only — Booking Type (Select All + Stage A-E) is hidden. */}
          {HIDDEN_FEATURES.createDetailBookingType && (
            <div className="flex flex-col gap-1">
              <FieldLabel>Booking Type</FieldLabel>
              <StageChecklist value={values.stages} onChange={(v) => setFieldValue("stages", v)} />
              {submitCount > 0 && errors.stages && <p className="text-xs text-danger">{String(errors.stages)}</p>}
            </div>
          )}
        </Drawer>
      )}
    </Formik>
  );
}

/** Figma `Create New Detail List` (5753:83359) — reached from Live Results'
 *  bulk bar. Practice and Base Station are fixed by the trainees selected. */
export function CreateReshootDrawer({
  open,
  courseware,
  station,
  onClose,
  onCreate,
}: {
  open: boolean;
  courseware: string;
  station: string;
  onClose: () => void;
  onCreate: () => void;
}) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Create New Detail" footer={<DrawerFooter onCancel={onClose} onConfirm={onCreate} confirmLabel="Create Detail" />}>
      <div className="flex flex-col gap-1">
        <FieldLabel>Practice</FieldLabel>
        <Checkbox label={courseware} checked disabled />
      </div>
      <Select label="Base Station" required options={[station]} value={station} onChange={() => {}} disabled />
    </Drawer>
  );
}

const stageSchema = Yup.object({ stages: Yup.array().of(Yup.string()).min(1, "Booking Type is required") });

/** Figma `Edit Stage` (5765:216870). */
export function EditStageDrawer({
  open,
  stages,
  onClose,
  onConfirm,
}: {
  open: boolean;
  stages: string[];
  onClose: () => void;
  onConfirm: (stages: string[]) => void;
}) {
  if (!open) return null;
  return (
    <Formik initialValues={{ stages }} validationSchema={stageSchema} onSubmit={(v) => onConfirm(v.stages)}>
      {({ values, errors, submitCount, setFieldValue, submitForm }) => (
        <Drawer open onClose={onClose} title="Edit Stage" footer={<DrawerFooter onCancel={onClose} onConfirm={submitForm} confirmLabel="Confirm" />}>
          <div className="flex flex-col gap-1">
            <FieldLabel>Booking Type</FieldLabel>
            <StageChecklist value={values.stages} onChange={(v) => setFieldValue("stages", v)} />
            {submitCount > 0 && errors.stages && <p className="text-xs text-danger">{String(errors.stages)}</p>}
          </div>
        </Drawer>
      )}
    </Formik>
  );
}

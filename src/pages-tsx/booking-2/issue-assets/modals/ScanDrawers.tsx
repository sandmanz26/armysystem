// F-009 Top Up / Scan & Return drawers.
//   Assign  — Figma `Action - Table Bulk Edit › Assign` (5869:43324 / dropdown 5869:43326):
//             "Target Base Station *" select, Cancel / Confirm.
//   Filter  — Figma `Filter › Drawer - Filter` (5869:43334 / 5869:43336): Asset Type and
//             Target Base Station checkboxes, Clear Filter / Apply Filter.
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Select } from "@/components/select";
import { Checkbox } from "@/components/checkbox";

const SECONDARY = "h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors";
const PRIMARY = "h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors";

const assignSchema = Yup.object({ station: Yup.string().required("Target Base Station is required") });

export function AssignStationDrawer({
  open, options, onClose, onConfirm,
}: {
  open: boolean;
  options: string[];
  onClose: () => void;
  onConfirm: (station: string) => void;
}) {
  if (!open) return null;
  return (
    <Formik initialValues={{ station: options[0] ?? "" }} validationSchema={assignSchema} onSubmit={(v) => onConfirm(v.station)}>
      {({ values, errors, touched, setFieldValue, submitForm }) => (
        <Drawer
          open
          onClose={onClose}
          title="Assign"
          footer={
            <>
              <button type="button" onClick={onClose} className={SECONDARY}>Cancel</button>
              <button type="button" onClick={submitForm} className={PRIMARY}>Confirm</button>
            </>
          }
        >
          <Form>
            <Select
              label="Target Base Station"
              required
              options={options}
              value={values.station}
              onChange={(v) => setFieldValue("station", v)}
              status={touched.station && errors.station ? "danger" : "default"}
              caption={touched.station ? errors.station : undefined}
            />
          </Form>
        </Drawer>
      )}
    </Formik>
  );
}

export interface ScanFilters {
  types: string[];
  stations: string[];
}

export const EMPTY_SCAN_FILTERS: ScanFilters = { types: [], stations: [] };

export function ScanFilterDrawer({
  open, typeOptions, stationOptions, stationLabel, value, onClose, onApply,
}: {
  open: boolean;
  typeOptions: string[];
  /** Empty = no station section (Administration & Maintenance). */
  stationOptions: string[];
  stationLabel: string;
  value: ScanFilters;
  onClose: () => void;
  onApply: (f: ScanFilters) => void;
}) {
  if (!open) return null;
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <Formik<ScanFilters> initialValues={value} onSubmit={(v) => { onApply(v); onClose(); }}>
      {({ values, setFieldValue, submitForm, resetForm }) => {
        const count = values.types.length + values.stations.length;
        return (
          <Drawer
            open
            onClose={onClose}
            title={
              <span className="flex items-center gap-2">
                Filter
                {count > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-default px-1.5 text-xs font-semibold text-invert-default">
                    {count}
                  </span>
                )}
              </span>
            }
            footer={
              <>
                <button type="button" onClick={() => resetForm({ values: EMPTY_SCAN_FILTERS })} className={SECONDARY}>Clear Filter</button>
                <button type="button" onClick={submitForm} className={PRIMARY}>Apply Filter</button>
              </>
            }
          >
            <Form className="flex flex-col gap-6">
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-sm font-semibold text-default">Asset Type</legend>
                {typeOptions.map((t) => (
                  <Checkbox key={t} label={t} checked={values.types.includes(t)} onChange={() => setFieldValue("types", toggle(values.types, t))} />
                ))}
              </fieldset>
              {stationOptions.length > 0 && (
                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-3 text-sm font-semibold text-default">{stationLabel}</legend>
                  {stationOptions.map((s) => (
                    <Checkbox key={s} label={s} checked={values.stations.includes(s)} onChange={() => setFieldValue("stations", toggle(values.stations, s))} />
                  ))}
                </fieldset>
              )}
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

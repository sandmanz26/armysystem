import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import type { AntennaEntry } from "../types";
import {
  STATUS_OPTIONS,
  RFID_LOCATION_OPTIONS,
  BASE_STATION_OPTIONS,
  GROUP_KEY_OPTIONS,
  GROUP_GPO_OPTIONS,
} from "../constants";

/*
 * Add / Edit Antenna — Figma `Action - Add Antenna` (5171:25784, with its
 * `Empty Error` 5171:25807 and `Filled Error` 5171:25829 states) and
 * `Action - Edit Antenna` (5171:25861). One drawer for both: identical fields,
 * only the title and the primary button label differ.
 *
 * Field order and required flags read off the Figma instances:
 *   Antenna Port Number *  (Input)
 *   Antenna *              (Input)
 *   RFID Reader Location * (Single Select)
 *   Base Station           (Single Select)
 *   Group Key              (Single Select)
 *   Group GPO              (Single Select)
 *   Status *               (Single Select)
 *
 * Two validation messages per text field, both in Figma:
 *   empty      → "<Field> is required"
 *   duplicate  → "<Field> already existed"
 */

interface FormValues {
  antennaPortNumber: string;
  antenna: string;
  rfidReader: string;
  station: string;
  antennaKey: string;
  gpo: string;
  status: string;
}

interface AntennaDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: AntennaEntry | null;
  /** Every other row, used for the "already existed" rules. */
  existing: AntennaEntry[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function AntennaDrawer({
  open,
  initial,
  existing,
  onClose,
  onSubmit,
}: AntennaDrawerProps) {
  const isEdit = !!initial;

  const others = existing.filter((a) => a.id !== initial?.id);
  const takenPorts = others.map((a) => a.antennaPortNumber.toLowerCase());
  const takenNames = others.map((a) => a.antenna.toLowerCase());

  const schema = Yup.object().shape({
    antennaPortNumber: Yup.string()
      .required("Antenna Port Number is required")
      .test(
        "unique",
        "Antenna Port Number already existed",
        (v) => !v || !takenPorts.includes(v.toLowerCase()),
      ),
    antenna: Yup.string()
      .required("Antenna is required")
      .test("unique", "Antenna already existed", (v) => !v || !takenNames.includes(v.toLowerCase())),
    rfidReader: Yup.string().required("RFID Reader Location is required"),
    station: Yup.string(),
    antennaKey: Yup.string(),
    gpo: Yup.string(),
    status: Yup.string().required("Status is required"),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{
        antennaPortNumber: initial?.antennaPortNumber ?? "",
        antenna: initial?.antenna ?? "",
        rfidReader: initial?.rfidReader ?? "",
        station: initial?.station ?? "",
        antennaKey: initial?.antennaKey ?? "",
        gpo: initial?.gpo ?? "",
        status: initial?.status ?? "",
      }}
      validationSchema={schema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ values, errors, touched, setFieldValue, submitForm, handleChange, handleBlur }) => {
        const err = (k: keyof FormValues) => (touched[k] && errors[k] ? errors[k] : undefined);
        return (
          <Drawer
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Antenna" : "Add New Antenna"}
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  {isEdit ? "Confirm" : "Create Antenna"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="antennaPortNumber"
                label="Antenna Port Number"
                required
                value={values.antennaPortNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Antenna Port Number (e.g., JX3621390195)"
                status={err("antennaPortNumber") ? "danger" : "default"}
                caption={err("antennaPortNumber")}
              />

              <Input
                name="antenna"
                label="Antenna"
                required
                value={values.antenna}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Antenna (e.g., Antenna 1)"
                status={err("antenna") ? "danger" : "default"}
                caption={err("antenna")}
              />

              <Select
                label="RFID Reader Location"
                required
                options={RFID_LOCATION_OPTIONS}
                value={values.rfidReader}
                onChange={(v) => setFieldValue("rfidReader", v)}
                placeholder="Select RFID Reader Location"
                status={err("rfidReader") ? "danger" : "default"}
                caption={err("rfidReader")}
              />

              <Select
                label="Base Station"
                options={BASE_STATION_OPTIONS}
                value={values.station}
                onChange={(v) => setFieldValue("station", v)}
                placeholder="Select Base Station"
              />

              <Select
                label="Group Key"
                options={GROUP_KEY_OPTIONS}
                value={values.antennaKey}
                onChange={(v) => setFieldValue("antennaKey", v)}
                placeholder="Select Group Key"
              />

              <Select
                label="Group GPO"
                options={GROUP_GPO_OPTIONS}
                value={values.gpo}
                onChange={(v) => setFieldValue("gpo", v)}
                placeholder="Select Group GPO"
              />

              <Select
                label="Status"
                required
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={(v) => setFieldValue("status", v)}
                placeholder="Select Status"
                status={err("status") ? "danger" : "default"}
                caption={err("status")}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input, Textarea } from "@/components/input";
import { Select } from "@/components/select";
import type { BriefingRoomEntry } from "../types";

/*
 * Add / Edit Briefing Room — Figma `Add Briefing Room` (5029:6548, with
 * `Empty Error` 5029:6567 and `Add - Filled Error` 5029:6561) and
 * `Action - Edit Briefing Room` (5337:521245). One drawer for both.
 *
 * FIVE fields, Figma's order — this used to mirror Location's simpler
 * three-field shape (Name/Status/Description), but Briefing Room's own list
 * table carries Level and Capacity that Location's never did, and the Add
 * drawer collects them too:
 *   Name *             Input      "Enter Name (e.g. Briefing Room 1)"
 *   Additional Info *  Text Area  "Optional notes about this room"
 *   Level *            Select     Level 1 / Level 2 / Level 3 / Level 4
 *   Capacity (Pax) *   Input      "e.g. 30"
 *   Status *           Select     Active / Inactive
 *
 * Validation copy, verbatim: "Name is required" · "Name already existed".
 */

const LEVEL_OPTIONS = [
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
  { value: "4", label: "Level 4" },
];

interface FormValues {
  name: string;
  additionalInfo: string;
  level: string;
  capacity: string;
  status: string;
}

interface BriefingRoomDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: BriefingRoomEntry | null;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function BriefingRoomDrawer({
  open,
  initial,
  existingNames,
  onClose,
  onSubmit,
}: BriefingRoomDrawerProps) {
  const isEdit = !!initial;

  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.name ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .test("unique", "Name already existed", (v) => !v || !taken.includes(v.toLowerCase())),
    additionalInfo: Yup.string().required("Additional Info is required"),
    level: Yup.string().required("Level is required"),
    capacity: Yup.number()
      .typeError("Capacity must be a number")
      .positive("Capacity must be greater than 0")
      .required("Capacity is required"),
    status: Yup.string().required("Status is required"),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{
        name: initial?.name ?? "",
        additionalInfo: initial?.additionalInfo ?? "",
        level: initial ? String(initial.level) : "",
        capacity: initial ? String(initial.capacity) : "",
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
            title={isEdit ? "Edit Briefing Room" : "Add Briefing Room"}
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
                  {isEdit ? "Confirm" : "Create Briefing Room"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="name"
                label="Name"
                required
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Name (e.g. Briefing Room 1)"
                status={err("name") ? "danger" : "default"}
                caption={err("name")}
              />

              <Textarea
                name="additionalInfo"
                label="Additional Info"
                required
                value={values.additionalInfo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Optional notes about this room"
                status={err("additionalInfo") ? "danger" : "default"}
                caption={err("additionalInfo")}
              />

              <Select
                label="Level"
                required
                options={LEVEL_OPTIONS}
                value={values.level}
                onChange={(v) => setFieldValue("level", v)}
                placeholder="Select Level"
                status={err("level") ? "danger" : "default"}
                caption={err("level")}
              />

              <Input
                name="capacity"
                label="Capacity (Pax)"
                required
                type="number"
                min={1}
                value={values.capacity}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 30"
                status={err("capacity") ? "danger" : "default"}
                caption={err("capacity")}
              />

              <Select
                label="Status"
                required
                options={["Active", "Inactive"]}
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

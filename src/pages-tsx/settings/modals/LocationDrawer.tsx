import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input, Textarea } from "@/components/input";
import { Select } from "@/components/select";
import type { RoomEntry } from "../types";

/*
 * Add / Edit Location — Figma `Add Location` (5029:6593, with `Empty Error`
 * 5029:6612 and `Add - Filled Error` 5159:137923) and `Action - Edit Location`
 * (5339:530819). One drawer for both; only the title and primary label differ.
 *
 * Three fields in Figma's order:
 *   Name *       Input      "Enter Location Name (e.g. Location 1)"
 *   Status *     Select     Active / Inactive
 *   Description  Text Area  "Enter Description"   (not required)
 *
 * Validation copy, verbatim from the two error frames:
 *   "Name is required"   ·   "Name already exists"
 */

interface FormValues {
  name: string;
  status: string;
  description: string;
}

interface LocationDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: RoomEntry | null;
  /** Existing names, used for the "already existed" rule. */
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function LocationDrawer({
  open,
  initial,
  existingNames,
  onClose,
  onSubmit,
}: LocationDrawerProps) {
  const isEdit = !!initial;

  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.name ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .test("unique", "Name already exists", (v) => !v || !taken.includes(v.toLowerCase())),
    status: Yup.string().required("Status is required"),
    description: Yup.string(),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{
        name: initial?.name ?? "",
        status: initial?.status ?? "",
        description: initial?.description ?? "",
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
            title={isEdit ? "Edit Location" : "Add Location"}
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
                  {isEdit ? "Confirm" : "Create Location"}
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
                placeholder="Enter Location Name (e.g. Location 1)"
                status={err("name") ? "danger" : "default"}
                caption={err("name")}
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

              <Textarea
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Description"
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import type { BaseStation } from "../types";

/*
 * Add / Edit Base Station — Figma `Action - Add Base Station` (5112:202006,
 * errors 202032 / 202042) and `Action - Edit Base Station` (5112:202074).
 * One field, one drawer; title and primary label differ.
 *
 * Validation copy, verbatim:
 *   "Base Station Name is required"  ·  "Base Station already exist"
 * (Note the Location page says "already existed" — different wording per page,
 * kept as designed.)
 */

interface FormValues {
  name: string;
}

interface BaseStationDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: BaseStation | null;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function BaseStationDrawer({
  open,
  initial,
  existingNames,
  onClose,
  onSubmit,
}: BaseStationDrawerProps) {
  const isEdit = !!initial;

  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.name ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Base Station Name is required")
      .test("unique", "Base Station already exist", (v) => !v || !taken.includes(v.toLowerCase())),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ name: initial?.name ?? "" }}
      validationSchema={schema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ values, errors, touched, submitForm, handleChange, handleBlur }) => {
        const err = touched.name && errors.name ? errors.name : undefined;
        return (
          <Drawer
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Base Station" : "Add New Base Station"}
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
                  {isEdit ? "Confirm" : "Create Base Station"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="name"
                label="Base Station Name"
                required
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Base Station Name"
                status={err ? "danger" : "default"}
                caption={err}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

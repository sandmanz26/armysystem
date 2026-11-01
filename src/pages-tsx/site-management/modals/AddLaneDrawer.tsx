import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";

/*
 * Add Lane — Figma `Action - Add Lane` (5115:209861, errors 209887 / 209897).
 * One field. Figma has no Edit Lane drawer on this page.
 *
 * Validation copy, verbatim:
 *   "Lane Name is required"  ·  "Lane already exist"
 */

interface FormValues {
  name: string;
}

interface AddLaneDrawerProps {
  open: boolean;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function AddLaneDrawer({ open, existingNames, onClose, onSubmit }: AddLaneDrawerProps) {
  const taken = existingNames.map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Lane Name is required")
      .test("unique", "Lane already exist", (v) => !v || !taken.includes(v.toLowerCase())),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ name: "" }}
      validationSchema={schema}
      onSubmit={(values, helpers) => {
        onSubmit(values);
        helpers.resetForm();
      }}
    >
      {({ values, errors, touched, submitForm, handleChange, handleBlur }) => {
        const err = touched.name && errors.name ? errors.name : undefined;
        return (
          <Drawer
            open={open}
            onClose={onClose}
            title="Add New Lane"
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
                  Create Lane
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="name"
                label="Lane Name"
                required
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Lane Name"
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

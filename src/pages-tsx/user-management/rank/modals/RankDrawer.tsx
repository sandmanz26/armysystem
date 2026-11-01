import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input, NumberStepper } from "@/components/input";
import type { Rank } from "@/data/userManagement";

/*
 * Add / Edit Rank — Figma `Action - Add Rank` (5029:3758) and
 * `Action - Edit Rank` (5029:3801). Two fields: Rank (Input) and
 * Sequence (`Input - Stepper Right`). Validation messages taken from the
 * error frames: "Rank is required", "Sequence is required", and
 * "Rank already exist" on `Add - Filled Error`.
 */

interface FormValues {
  rank: string;
  sequence: number | "";
}

interface RankDrawerProps {
  open: boolean;
  initial?: Rank | null;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: { rank: string; sequence: number }) => void;
}

export function RankDrawer({ open, initial, existingNames, onClose, onSubmit }: RankDrawerProps) {
  const isEdit = !!initial;
  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.rank ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    rank: Yup.string()
      .required("Rank is required")
      .test("unique", "Rank already exist", (v) => !v || !taken.includes(v.toLowerCase())),
    sequence: Yup.number().typeError("Sequence is required").required("Sequence is required").min(1),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ rank: initial?.rank ?? "", sequence: initial?.sequence ?? "" }}
      validationSchema={schema}
      onSubmit={(v) => onSubmit({ rank: v.rank, sequence: Number(v.sequence) })}
    >
      {({ values, errors, touched, setFieldValue, submitForm, handleChange, handleBlur }) => {
        const err = (k: keyof FormValues) => (touched[k] && errors[k] ? (errors[k] as string) : undefined);
        return (
          <Drawer
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Rank" : "Add New Rank"}
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
                  {isEdit ? "Confirm" : "Create Rank"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="rank"
                label="Rank"
                required
                value={values.rank}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Rank Name"
                status={err("rank") ? "danger" : "default"}
                caption={err("rank")}
              />
              <NumberStepper
                label="Sequence"
                required
                min={1}
                value={values.sequence}
                onChange={(v) => setFieldValue("sequence", v)}
                placeholder="0"
                status={err("sequence") ? "danger" : "default"}
                caption={err("sequence")}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

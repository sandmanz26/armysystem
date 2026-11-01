import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import type { AssetCategory } from "@/data/systemHardware";
import { STATUS_OPTIONS, ALERT_MODE_OPTIONS } from "../types";

/*
 * Add / Edit Asset Category — Figma `Action - Add Asset Category` (5159:114547)
 * and `Action - Edit Asset Category` (5159:114618). One drawer for both: same
 * three fields, only the title and primary label differ.
 *
 * Fields in Figma's order: Asset Category (Input) · Status (Select) ·
 * Alert Mode (Select). All required.
 *
 * Two distinct validation messages appear in the frames:
 *   `Add - Empty Error` → "Asset Category is required"
 *   `Edit`             → "Asset Category already existed"  (duplicate name)
 */

interface FormValues {
  assetCategory: string;
  status: string;
  alert: string;
}

interface AssetCategoryDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: AssetCategory | null;
  /** Existing names, used for the "already existed" rule. */
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function AssetCategoryDrawer({
  open,
  initial,
  existingNames,
  onClose,
  onSubmit,
}: AssetCategoryDrawerProps) {
  const isEdit = !!initial;

  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.assetCategory ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    assetCategory: Yup.string()
      .required("Asset Category is required")
      .test("unique", "Asset Category already existed", (v) => !v || !taken.includes(v.toLowerCase())),
    status: Yup.string().required("Status is required"),
    alert: Yup.string().required("Alert Mode is required"),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{
        assetCategory: initial?.assetCategory ?? "",
        status: initial?.status ?? "",
        alert: initial?.alert && initial.alert !== "—" ? initial.alert : "",
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
            title={isEdit ? "Edit Asset Category" : "Add New Asset Category"}
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
                  {isEdit ? "Confirm" : "Create Asset Category"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="assetCategory"
                label="Asset Category"
                required
                value={values.assetCategory}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Asset Category (e.g., Weapon)"
                status={err("assetCategory") ? "danger" : "default"}
                caption={err("assetCategory")}
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

              <Select
                label="Alert Mode"
                required
                options={ALERT_MODE_OPTIONS}
                value={values.alert}
                onChange={(v) => setFieldValue("alert", v)}
                placeholder="Select Alert Mode"
                status={err("alert") ? "danger" : "default"}
                caption={err("alert")}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

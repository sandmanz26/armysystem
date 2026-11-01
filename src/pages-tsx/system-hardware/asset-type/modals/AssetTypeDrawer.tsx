import { Formik, Form } from "formik";
import * as Yup from "yup";
import { assetCategories } from "@/data/systemHardware";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { STATUS_OPTIONS } from "../constants";
import type { AssetTypeData } from "../types";

/*
 * Add / Edit Asset Type — Figma `Action - Add Asset Type` (5157:85668) and
 * `Action - Edit Asset Type` (5157:85822). Both are the SAME right drawer with
 * the same four fields; only the title and the primary button label differ, so
 * they share one component rather than two near-copies.
 *
 * Fields, in Figma's order: Asset Type (Input) · Asset Category (Select) ·
 * Asset Type Code (Input) · Status (Select). All required — the error state
 * (`Add - Empty Error`) shows Status=danger plus "<label> is required".
 */

const schema = Yup.object().shape({
  assetType: Yup.string().required("Asset Type is required"),
  assetCategory: Yup.string().required("Asset Category is required"),
  code: Yup.string().required("Asset Type Code is required"),
  status: Yup.string().required("Status is required"),
});

interface FormValues {
  assetType: string;
  assetCategory: string;
  code: string;
  status: string;
}

interface AssetTypeDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: AssetTypeData | null;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function AssetTypeDrawer({ open, initial, onClose, onSubmit }: AssetTypeDrawerProps) {
  const isEdit = !!initial;
  const categoryOptions = assetCategories.map((c) => c.assetCategory);

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{
        assetType: initial?.assetType ?? "",
        assetCategory: initial?.assetCategory ?? "",
        code: initial?.code ?? "",
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
            title={isEdit ? "Edit Asset Type" : "Add New Asset Type"}
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
                  {isEdit ? "Confirm" : "Create Asset Type"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="assetType"
                label="Asset Type"
                required
                value={values.assetType}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Asset Type (e.g., SAR21, LMG)"
                status={err("assetType") ? "danger" : "default"}
                caption={err("assetType")}
              />

              <Select
                label="Asset Category"
                required
                options={categoryOptions}
                value={values.assetCategory}
                onChange={(v) => setFieldValue("assetCategory", v)}
                placeholder="Select Asset Category"
                status={err("assetCategory") ? "danger" : "default"}
                caption={err("assetCategory")}
              />

              <Input
                name="code"
                label="Asset Type Code"
                required
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Asset Type Code (e.g., WPN)"
                status={err("code") ? "danger" : "default"}
                caption={err("code")}
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

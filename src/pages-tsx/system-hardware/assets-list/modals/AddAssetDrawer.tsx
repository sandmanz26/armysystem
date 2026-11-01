import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input, Textarea } from "@/components/input";
import { Select } from "@/components/select";
import { ASSET_CATEGORIES, ASSET_TYPES, INITIAL_FORM_VALUES } from "../assetForm.constants";
import type { AssetCreationFormValues } from "../assetForm.types";

/*
 * Add New Asset — Figma `Action - Add Asset` → `Add - Empty` (`5133:51392`)
 * on page `Asset List | RFS` (`5133:42393`). A **Drawer, 384 wide**.
 *
 * This used to be a full page at `/system-hardware/asset-creation`, reached by
 * navigating away from the list — the developer's note "add asset now become
 * drawer". The page also carried its own `Header`, its own success screen and
 * 41 raw Tailwind colour classes, none of which the drawer needs.
 *
 * One block of fields, no section headers — Figma `Add - Empty` (5133:51392),
 * `Add - Filled` (5133:51446), 16px apart:
 *
 *   Asset Name *          "Enter Asset Name (e.g. SAR21, LMG)"
 *   Asset Category *      "Select Asset Category"
 *   Asset Type *          "Select Asset Type"
 *   Asset Serial Number * "Enter Asset Serial Number"
 *   Remarks               "Any additional notes about this asset..."  (152px box)
 *
 * Footer: Cancel · Create Asset.
 *
 * The old second section "Hardware Info" (Asset Tag ID, Initial Status, Site /
 * Location, Number of Layers) is not in Figma and was removed (F-005 / SH-6).
 * New assets default to `Available` with no RFID tag.
 *
 * Errors: `Add - Empty Error` (5133:51433) — "Asset is required", "Asset
 * Category is required", "Asset Type is required", "Asset Serial Number is
 * required"; `Add - Filled Error` (5133:51459) — "Asset Name already existed".
 */

export interface AddAssetDrawerProps {
  open: boolean;
  /** Existing asset names, for Figma's "Asset Name already existed" error. */
  existingNames?: string[];
  onClose: () => void;
  onCreate: (values: AssetCreationFormValues) => void;
}

export function AddAssetDrawer({
  open,
  existingNames = [],
  onClose,
  onCreate,
}: AddAssetDrawerProps) {
  const schema = Yup.object().shape({
    assetName: Yup.string()
      .trim()
      .required("Asset is required")
      .test("unique", "Asset Name already existed", (value) =>
        !value || !existingNames.some((n) => n.toLowerCase() === value.trim().toLowerCase()),
      ),
    assetCategory: Yup.string().required("Asset Category is required"),
    assetType: Yup.string().required("Asset Type is required"),
    serialNumber: Yup.string().trim().required("Asset Serial Number is required"),
  });

  return (
    <Formik<AssetCreationFormValues>
      enableReinitialize
      initialValues={INITIAL_FORM_VALUES}
      validationSchema={schema}
      onSubmit={(values, helpers) => {
        onCreate(values);
        helpers.resetForm();
      }}
    >
      {({ values, errors, touched, setFieldValue, submitForm, handleChange, handleBlur }) => {
        const err = (k: keyof AssetCreationFormValues) =>
          touched[k] && errors[k] ? (errors[k] as string) : undefined;

        return (
          <Drawer
            open={open}
            onClose={onClose}
            title="Add New Asset"
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-default-hovered transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  Create Asset
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="assetName"
                label="Asset Name"
                required
                value={values.assetName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Asset Name (e.g. SAR21, LMG)"
                status={err("assetName") ? "danger" : "default"}
                caption={err("assetName")}
              />

              <Select
                label="Asset Category"
                required
                options={ASSET_CATEGORIES}
                value={values.assetCategory}
                onChange={(v) => setFieldValue("assetCategory", v)}
                placeholder="Select Asset Category"
                status={err("assetCategory") ? "danger" : "default"}
                caption={err("assetCategory")}
              />

              <Select
                label="Asset Type"
                required
                options={ASSET_TYPES}
                value={values.assetType}
                onChange={(v) => setFieldValue("assetType", v)}
                placeholder="Select Asset Type"
                status={err("assetType") ? "danger" : "default"}
                caption={err("assetType")}
              />

              <Input
                name="serialNumber"
                label="Asset Serial Number"
                required
                value={values.serialNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Asset Serial Number"
                status={err("serialNumber") ? "danger" : "default"}
                caption={err("serialNumber")}
              />

              <Textarea
                name="remarks"
                label="Remarks"
                value={values.remarks}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Any additional notes about this asset..."
                className="min-h-[152px]"
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

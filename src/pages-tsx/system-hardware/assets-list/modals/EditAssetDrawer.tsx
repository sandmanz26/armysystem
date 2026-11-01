import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { ASSET_CATEGORIES, ASSET_TYPES } from "../assetForm.constants";
import type { Asset } from "@/data/systemHardware";

/*
 * Edit Asset — Figma `Action - Edit Asset` → `Edit` (`5133:51521`), a
 * **Drawer, 384 wide** — same shell as `AddAssetDrawer`.
 *
 * This used to be its own hand-rolled drawer: 480 wide (not 384), a header
 * with a green check-circle icon and a "Please fill all the information."
 * subtitle that Figma's `Drawer Header` never has (title + close button
 * only, same as every other drawer), raw `<Field>` inputs instead of the
 * shared `Input`, and two custom click-outside comboboxes instead of
 * `Select` — all of it independently reimplementing what `Drawer` already
 * gives Add Asset for free.
 *
 * A `Sub-Section Header` "Asset Details" (14 Semi Bold) then 4 fields, all
 * 16px apart, in Figma's order: Asset · Asset Category · Asset Serial Number ·
 * Asset Type (re-read 19 Oct 2026, F-005 — the old comment had no header and
 * Serial Number second). Footer: Cancel · Confirm. Options come from the same
 * list as Add Asset so an asset created there can be edited here.
 */

export interface EditAssetDrawerProps {
  asset: Asset;
  onClose: () => void;
  onSave?: (values: EditAssetFormValues) => void;
}

export interface EditAssetFormValues {
  name: string;
  serialNumber: string;
  assetCategory: string;
  assetType: string;
}

export function EditAssetDrawer({ asset, onClose, onSave }: EditAssetDrawerProps) {
  const schema = Yup.object().shape({
    name: Yup.string().trim().required("Asset is required"),
    serialNumber: Yup.string().trim().required("Asset Serial Number is required"),
    assetCategory: Yup.string().required("Asset Category is required"),
    assetType: Yup.string().required("Asset Type is required"),
  });

  const initialValues: EditAssetFormValues = {
    name: asset.name,
    serialNumber: asset.serialNumber,
    assetCategory: asset.assetCategory,
    assetType: asset.assetType,
  };

  return (
    <Formik<EditAssetFormValues>
      enableReinitialize
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={(values) => {
        onSave?.(values);
        onClose();
      }}
    >
      {({ values, errors, touched, setFieldValue, submitForm, handleChange, handleBlur }) => {
        const err = (k: keyof EditAssetFormValues) =>
          touched[k] && errors[k] ? (errors[k] as string) : undefined;

        return (
          <Drawer
            open
            onClose={onClose}
            title="Edit Asset"
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
                  Confirm
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-default">Asset Details</p>

              <Input
                name="name"
                label="Asset"
                required
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                status={err("name") ? "danger" : "default"}
                caption={err("name")}
              />

              <Select
                label="Asset Category"
                required
                options={ASSET_CATEGORIES}
                value={values.assetCategory}
                onChange={(v) => setFieldValue("assetCategory", v)}
                status={err("assetCategory") ? "danger" : "default"}
                caption={err("assetCategory")}
              />

              <Input
                name="serialNumber"
                label="Asset Serial Number"
                required
                value={values.serialNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                status={err("serialNumber") ? "danger" : "default"}
                caption={err("serialNumber")}
              />

              <Select
                label="Asset Type"
                required
                options={ASSET_TYPES}
                value={values.assetType}
                onChange={(v) => setFieldValue("assetType", v)}
                status={err("assetType") ? "danger" : "default"}
                caption={err("assetType")}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Check } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
import { ASSET_CATEGORIES, ASSET_TYPES } from "../constants";
const EditAssetSchema = Yup.object().shape({
    name: Yup.string().required("Asset name is required"),
    serialNumber: Yup.string().required("Serial number is required"),
    assetCategory: Yup.string().required("Asset category is required"),
    assetType: Yup.string().required("Asset type is required"),
});
export function EditAssetModal({ asset, onClose }) {
    const initialValues = {
        name: asset.name,
        serialNumber: asset.serialNumber,
        assetCategory: asset.assetCategory,
        assetType: asset.assetType,
    };
    const handleSubmit = (_values) => {
        // TODO: wire up API call when backend is ready
        onClose();
    };
    return (<Modal open={true} onClose={onClose} width={480} isUseX={false}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check size={20} className="text-green-600"/>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Edit Asset Detail</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Please fill all the information.
          </p>
        </div>
      </div>

      <Formik initialValues={initialValues} validationSchema={EditAssetSchema} onSubmit={handleSubmit}>
        {({ errors, touched }) => (<Form>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset{" "}
                  <span className="text-brand-primary">*</span>
                </label>
                <Field name="name" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"/>
                {touched.name && errors.name && (<div className="text-red-500 text-xs pt-1 pl-1">
                    {errors.name}
                  </div>)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Serial No{" "}
                  <span className="text-brand-primary">*</span>
                </label>
                <Field name="serialNumber" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"/>
                {touched.serialNumber && errors.serialNumber && (<div className="text-red-500 text-xs pt-1 pl-1">
                    {errors.serialNumber}
                  </div>)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Category{" "}
                  <span className="text-brand-primary">*</span>
                </label>
                <Field as="select" name="assetCategory" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  {ASSET_CATEGORIES.map((cat) => (<option key={cat} value={cat}>
                      {cat}
                    </option>))}
                </Field>
                {touched.assetCategory && errors.assetCategory && (<div className="text-red-500 text-xs pt-1 pl-1">
                    {errors.assetCategory}
                  </div>)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Type{" "}
                  <span className="text-brand-primary">*</span>
                </label>
                <Field as="select" name="assetType" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  {ASSET_TYPES.map((type) => (<option key={type} value={type}>
                      {type}
                    </option>))}
                </Field>
                {touched.assetType && errors.assetType && (<div className="text-red-500 text-xs pt-1 pl-1">
                    {errors.assetType}
                  </div>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onClose} type="button" className="py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 bg-white">
                Cancel
              </Button>
              <Button type="submit" className="py-3 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover">
                Confirm
              </Button>
            </div>
          </Form>)}
      </Formik>
    </Modal>);
}

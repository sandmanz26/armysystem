import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { MapPin } from "lucide-react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
const validationSchema = Yup.object().shape({
    name: Yup.string().required("Lane name is required"),
});
export function AddLaneModal({ onClose, onAdd }) {
    return (<Modal open={true} onClose={onClose} width={448} isUseX={false}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <MapPin size={20} className="text-brand-primary"/>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Add Lane</h2>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>
      <Formik initialValues={{ name: "" }} validationSchema={validationSchema} onSubmit={(values) => { onAdd(values.name.trim()); onClose(); }}>
        {() => (<Form>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lane <span className="text-brand-primary">*</span>
              </label>
              <Field name="name" type="text" placeholder="Enter lane (e.g, Lane A,etc)" autoFocus className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              <ErrorMessage name="name" component="p" className="mt-1 text-xs text-red-500"/>
            </div>
            <div className="flex gap-3">
              <Button type="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 justify-center">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center">
                Confirm
              </Button>
            </div>
          </Form>)}
      </Formik>
    </Modal>);
}

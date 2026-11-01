import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/modal-1";
import { Button } from "@/components/button";
const schema = Yup.object().shape({
    version: Yup.string().required("Version is required"),
    notes: Yup.string(),
});
export function AddVersionModal({ onClose, onAdd }) {
    const handleSubmit = (values) => {
        const now = new Date();
        const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
            "\n" +
            now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const patchNotes = values.notes
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean);
        onAdd({ version: values.version.trim(), date, patchNotes: patchNotes.length ? patchNotes : ["Release"] });
        onClose();
    };
    return (<Modal open={true} onClose={onClose} width={448} isUseX={false}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={20} className="text-green-500"/>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Add System Version</h2>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>

      <Formik initialValues={{ version: "", notes: "" }} validationSchema={schema} onSubmit={handleSubmit}>
        {({ errors, touched, values }) => (<Form>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <Field name="version" type="text" autoFocus placeholder="Enter version name (e.g, 0.1.1)" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
                {errors.version && touched.version && (<p className="mt-1 text-xs text-red-500">{errors.version}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patch Notes (Comma Separated)
                </label>
                <Field as="textarea" name="notes" rows={4} placeholder="Example: Fixed login bug, Added new API endpoint, Improved performance" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary resize-none"/>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onClose} type="outline" className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" disabled={!values.version.trim()} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-40">
                Confirm
              </Button>
            </div>
          </Form>)}
      </Formik>
    </Modal>);
}

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal-1";
import { TIME_OPTIONS, DAYS } from "../constants";
const validationSchema = Yup.object().shape({
    startDate: Yup.string().required("Start date is required"),
});
export function AddBlackoutModal({ onClose, onConfirm }) {
    const initialValues = {
        startDate: "", endDate: "", startTime: "", endTime: "",
        recurring: false, selectedDays: [],
    };
    const handleSubmit = (values) => {
        const { startDate, endDate, recurring, selectedDays } = values;
        let label = startDate;
        if (endDate && endDate !== startDate)
            label += ` - ${endDate}`;
        if (recurring && selectedDays.length > 0) {
            const abbr = selectedDays.map(d => d.slice(0, 3));
            label = `${abbr.join(", ")} (${startDate}${endDate && endDate !== startDate ? ` - ${endDate}` : ""})`;
        }
        onConfirm(label);
        onClose();
    };
    return (<Modal open={true} onClose={onClose} width={672}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Calendar size={20} className="text-brand-primary"/>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Add Blackout Date</h3>
          <p className="text-sm text-gray-500 mt-0.5">Please fill all the information.</p>
        </div>
      </div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (<Form className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Start &amp; End Date <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Field name="startDate" type="date" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"/>
                  <Field name="endDate" type="date" min={values.startDate} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"/>
                </div>
                <ErrorMessage name="startDate" component="p" className="mt-1 text-xs text-red-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Start &amp; End Time <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Start</span>
                  <Field name="startTime" as="select" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary">
                    <option value="">Select time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </Field>
                  <span className="text-xs text-gray-500 font-medium">End</span>
                  <Field name="endTime" as="select" className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary">
                    <option value="">Select time</option>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFieldValue("recurring", !values.recurring)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0", values.recurring ? "bg-brand-primary" : "bg-gray-200")}>
                <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", values.recurring ? "translate-x-6" : "translate-x-1")}/>
              </button>
              <span className="text-sm font-semibold text-gray-700">Use recurring date</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Days Recurring</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                const selected = values.selectedDays.includes(day);
                return (<button key={day} type="button" onClick={() => setFieldValue("selectedDays", selected ? values.selectedDays.filter(d => d !== day) : [...values.selectedDays, day])} className={cn("px-4 py-2 text-sm font-semibold rounded-lg border transition-colors", selected ? "bg-brand-primary text-white border-brand-primary" : "text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary")}>
                      {day}
                    </button>);
            })}
              </div>
            </div>

            <div className="flex gap-3 -mx-6 -mb-6 px-6 pb-6 pt-2 border-t border-gray-100">
              <Button type="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border-gray-200 justify-center">
                Cancel
              </Button>
              <Button type="submit" disabled={!values.startDate.trim()} className="flex-1 py-2.5 text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover justify-center disabled:opacity-40">
                Confirm
              </Button>
            </div>
          </Form>)}
      </Formik>
    </Modal>);
}

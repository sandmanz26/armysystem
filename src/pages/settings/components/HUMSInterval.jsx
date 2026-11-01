import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/button";
const schema = Yup.object().shape({
    value: Yup.number().required("Required").min(1, "Must be at least 1"),
});
export function HUMSInterval() {
    return (<div>
      <h2 className="text-base font-semibold text-gray-800 mb-6">HUMS Interval</h2>
      <Formik initialValues={{ value: "30" }} validationSchema={schema} onSubmit={(_values) => {
            // TODO: wire to API
        }}>
        {({ errors, touched }) => (<Form className="max-w-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HUMS Interval (seconds)</label>
              <Field name="value" type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"/>
              {errors.value && touched.value && (<p className="mt-1 text-xs text-red-500">{errors.value}</p>)}
            </div>
            <Button type="submit" className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition-colors">
              Confirm
            </Button>
          </Form>)}
      </Formik>
    </div>);
}

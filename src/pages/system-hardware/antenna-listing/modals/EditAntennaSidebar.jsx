import { Formik, Form } from "formik";
import * as Yup from "yup";
import { X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { AntennaFormBody } from "./AddAntennaModal";

const validationSchema = Yup.object().shape({
  portNumber: Yup.string().trim().required("Antenna Port Number is required"),
  antenna: Yup.string().trim().required("Antenna is required"),
  rfidLocation: Yup.string(),
  baseStation: Yup.string(),
  groupKey: Yup.string(),
  groupGpo: Yup.string(),
  status: Yup.string(),
});

export function EditAntennaSidebar({ open, antenna, onClose, onSave }) {
  const initialValues = {
    portNumber: antenna?.portNumber ?? "",
    antenna: antenna?.antenna ?? "",
    rfidLocation: antenna?.rfidLocation ?? "",
    baseStation: antenna?.baseStation ?? "",
    groupKey: antenna?.groupKey ?? "",
    groupGpo: antenna?.gpo ?? "",
    status: antenna?.status ?? "",
  };

  return (
    <>
      <div className={cn("fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <div className={cn("fixed inset-y-0 right-0 z-[1110] w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Antenna</h2>
            <p className="text-xs text-gray-500 mt-0.5">{antenna?.antenna}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, { setSubmitting }) => {
            onSave?.({ ...antenna, ...values, gpo: values.groupGpo });
            setSubmitting(false);
            onClose();
          }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AntennaFormBody values={values} errors={errors} touched={touched} setFieldValue={setFieldValue} />
              </div>
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <Button type="submit" className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent">Save Changes</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

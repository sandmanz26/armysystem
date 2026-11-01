import { useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const AddTraineeSchema = Yup.object().shape({
    rank: Yup.string().required("Rank is required"),
    name: Yup.string().required("Name is required"),
    svcId: Yup.string().required("Service ID is required"),
    platoon: Yup.string().required("Platoon is required"),
    weaponType: Yup.string().required("Weapon Type is required"),
});
const RANK_OPTIONS = [
    { value: "PTE", label: "PTE" },
    { value: "LCP", label: "LCP" },
    { value: "CPL", label: "CPL" },
    { value: "CFC", label: "CFC" },
    { value: "3SG", label: "3SG" },
    { value: "2SG", label: "2SG" },
    { value: "1SG", label: "1SG" },
    { value: "SSG", label: "SSG" },
    { value: "MSG", label: "MSG" },
    { value: "3WO", label: "3WO" },
    { value: "2WO", label: "2WO" },
    { value: "1WO", label: "1WO" },
    { value: "MWO", label: "MWO" },
    { value: "SWO", label: "SWO" },
    { value: "CWO", label: "CWO" },
];
const WEAPON_OPTIONS = [
    { value: "SAR21", label: "SAR21" },
    { value: "SPIKE SR", label: "SPIKE SR" },
    { value: "GPMG", label: "GPMG" },
    { value: "MATADOR", label: "MATADOR" },
    { value: "SPIKE LR", label: "SPIKE LR" },
    { value: "M16", label: "M16" },
    { value: "M203", label: "M203" },
];
export function AddTraineeModal({ isOpen, onClose, onSubmit, unitName = "" }) {
    useEffect(() => {
        if (!isOpen)
            return;
        const onKeyDown = (event) => {
            if (event.key === "Escape")
                onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    return (<>
      <div className={cn("fixed inset-0 bg-black/30 z-[1200] transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose}/>

      <div className={cn("fixed top-0 right-0 h-full w-[480px] max-w-full bg-white z-[1201] flex flex-col shadow-2xl transition-transform duration-300", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Trainee</h2>
            <p className="text-xs text-gray-500 mt-0.5">Please fill all the information.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18}/>
          </button>
        </div>

        <Formik initialValues={{
            rank: "",
            name: "",
            svcId: "",
            platoon: "",
            weaponType: "",
        }} validationSchema={AddTraineeSchema} onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
            onClose();
        }}>
          {({ setFieldValue, values, errors, touched, isValid, dirty }) => (<Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <Field name="rank" as={SelectOption} options={RANK_OPTIONS} label="Rank" required placeholder="Select Rank" value={RANK_OPTIONS.find((o) => o.value === values.rank)} onChange={(opt) => setFieldValue("rank", opt?.value)} error={touched.rank ? errors.rank : undefined}/>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                  <Field as={InputCustom} name="name" placeholder="Enter name" required className="w-full"/>
                  {touched.name && errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service ID <span className="text-red-500">*</span></label>
                  <Field as={InputCustom} name="svcId" placeholder="Enter Service ID (e.g. A1234567)" required className="w-full"/>
                  {touched.svcId && errors.svcId && <div className="text-red-500 text-xs mt-1">{errors.svcId}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Platoon Number <span className="text-red-500">*</span></label>
                  <Field as={InputCustom} name="platoon" placeholder="Enter platoon" required className="w-full"/>
                  {touched.platoon && errors.platoon && <div className="text-red-500 text-xs mt-1">{errors.platoon}</div>}
                </div>

                <Field name="weaponType" as={SelectOption} options={WEAPON_OPTIONS} label="Weapon Type" required placeholder="Select Weapon Type" value={WEAPON_OPTIONS.find((o) => o.value === values.weaponType)} onChange={(opt) => setFieldValue("weaponType", opt?.value)} error={touched.weaponType ? errors.weaponType : undefined}/>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Name <span className="text-red-500">*</span></label>
                  <InputCustom name="unitName" value={unitName} disabled className="w-full bg-gray-50 text-gray-500"/>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <Button type="submit" disabled={!isValid || !dirty} className={cn("w-full justify-center border-transparent", isValid && dirty ? "bg-brand-primary hover:bg-brand-primary-hover text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
                  Confirm
                </Button>
              </div>
            </Form>)}
        </Formik>
      </div>
    </>);
}

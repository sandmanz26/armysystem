import { useState } from "react";
import { X, User, Shield, Check, Eye as EyeIcon, EyeOff } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { InputCustom } from "@/components/input";
import { SelectField } from "../components/SelectField";
import { RANKS, ROLES } from "../constants";
// ── Password strength helpers ─────────────────────────────────────────────────
function getStrength(pw) {
    const checks = [
        pw.length >= 8,
        /[A-Z]/.test(pw),
        /[a-z]/.test(pw),
        /\d/.test(pw),
        /[^A-Za-z0-9]/.test(pw),
    ];
    return checks.filter(Boolean).length;
}
const pwCheckLabels = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "One number", test: (pw) => /\d/.test(pw) },
    { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];
// ── Validation schema ─────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
    name: Yup.string().required("Full Name is required"),
    rank: Yup.string().required("Rank is required"),
    svcId: Yup.string().required("Service ID is required"),
    unitName: Yup.string().required("Unit Name is required"),
    role: Yup.string().required("User Role is required"),
    password: Yup.string()
        .min(8, "At least 8 characters")
        .matches(/[A-Z]/, "One uppercase letter")
        .matches(/[a-z]/, "One lowercase letter")
        .matches(/\d/, "One number")
        .matches(/[^A-Za-z0-9]/, "One special character")
        .required("Password is required"),
});
const initialValues = {
    name: "",
    rank: "",
    svcId: "",
    unitName: "",
    role: "",
    password: "",
};
// ── Component ─────────────────────────────────────────────────────────────────
export function AddUserDrawer({ open, onClose }) {
    const [showPw, setShowPw] = useState(false);
    const handleClose = () => {
        onClose();
    };
    return (<>
      {/* Backdrop */}
      <div className={cn("fixed inset-0 bg-black/30 z-[1200] transition-opacity duration-200", open ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={handleClose}/>

      {/* Drawer */}
      <div className={cn("fixed top-0 right-0 h-full w-[480px] bg-white z-[1201] flex flex-col shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add New User</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the user information below</p>
          </div>
          <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18}/>
          </button>
        </div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(_values, { resetForm }) => {
            resetForm();
            onClose();
        }}>
          {({ values, setFieldValue, isValid, dirty }) => {
            const strength = getStrength(values.password);
            const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
            const strengthColor = [
                "",
                "bg-red-400",
                "bg-red-400",
                "bg-yellow-400",
                "bg-blue-400",
                "bg-green-500",
            ][strength];
            const canSubmit = isValid && dirty;
            return (<Form className="flex flex-col flex-1 overflow-hidden">
                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Section: Personal Information */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded bg-brand-primary/10 flex items-center justify-center">
                        <User size={11} className="text-brand-primary"/>
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Personal Information
                      </span>
                    </div>
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Field as={InputCustom} name="name" type="text" placeholder="Enter full name" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"/>
                      </div>

                      {/* Rank + Service ID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SelectField label="Rank" value={values.rank} onChange={(v) => setFieldValue("rank", v)} options={RANKS} placeholder="Select rank" required/>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Service ID <span className="text-red-500">*</span>
                          </label>
                          <Field as={InputCustom} name="svcId" type="text" placeholder="e.g. A1234567" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"/>
                        </div>
                      </div>

                      {/* Unit Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Unit Name <span className="text-red-500">*</span>
                        </label>
                        <Field as={InputCustom} name="unitName" type="text" placeholder="e.g. SAR1, SAR8" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"/>
                      </div>
                    </div>
                  </div>

                  {/* Section: Account Settings */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded bg-brand-primary/10 flex items-center justify-center">
                        <Shield size={11} className="text-brand-primary"/>
                      </div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                        Account Settings
                      </span>
                    </div>
                    <div className="space-y-4">
                      <SelectField label="User Role" value={values.role} onChange={(v) => setFieldValue("role", v)} options={ROLES} placeholder="Select role" required/>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Field as={InputCustom} name="password" type={showPw ? "text" : "password"} placeholder="Create a password" className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary placeholder-gray-400"/>
                          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPw ? <EyeOff size={15}/> : <EyeIcon size={15}/>}
                          </button>
                        </div>

                        {values.password.length > 0 && (<div className="mt-2.5">
                            {/* Strength bar */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-1 flex-1">
                                {[1, 2, 3, 4, 5].map((i) => (<div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= strength ? strengthColor : "bg-gray-200")}/>))}
                              </div>
                              <span className={cn("text-xs font-semibold", strength <= 2
                        ? "text-red-500"
                        : strength === 3
                            ? "text-yellow-500"
                            : strength === 4
                                ? "text-blue-500"
                                : "text-green-600")}>
                                {strengthLabel}
                              </span>
                            </div>
                            {/* Checks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {pwCheckLabels.map((c) => {
                        const ok = c.test(values.password);
                        return (<div key={c.label} className={cn("flex items-center gap-1.5 text-xs", ok ? "text-green-600" : "text-gray-400")}>
                                    <Check size={11} className={ok ? "text-green-500" : "text-gray-300"}/>
                                    {c.label}
                                  </div>);
                    })}
                            </div>
                          </div>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
                  <Button type="outline" onClick={handleClose} className="flex-1 px-4 py-2.5 text-sm font-medium">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit} className={cn("flex-1 px-4 py-2.5 text-sm font-medium text-white transition-colors", canSubmit
                    ? "bg-brand-primary hover:bg-brand-primary-hover"
                    : "bg-gray-200 cursor-not-allowed text-gray-400")}>
                    Create User
                  </Button>
                </div>
              </Form>);
        }}
        </Formik>
      </div>
    </>);
}

import { X } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";
import { SelectField } from "../components/SelectField";
import { RANKS, ROLES } from "../constants";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Full Name is required"),
  rank: Yup.string().required("Rank is required"),
  svcId: Yup.string().required("Service ID is required"),
  unitName: Yup.string().required("Unit Name is required"),
  role: Yup.string().required("User Role is required"),
});

export function EditUserSidebar({ open, user, onClose, onSave }) {
  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1100] bg-black/30 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[1110] w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit User</h2>
            <p className="text-xs text-gray-500 mt-0.5">{user.name} · {user.userId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <Formik
          enableReinitialize
          initialValues={{
            name: user.name ?? "",
            rank: user.rank ?? "",
            svcId: user.svcId ?? "",
            unitName: user.unitName ?? "",
            role: user.userRole ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            onSave({ ...user, name: values.name, rank: values.rank, svcId: values.svcId, unitName: values.unitName, userRole: values.role });
            setSubmitting(false);
            onClose();
          }}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    className={cn(
                      "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all",
                      touched.name && errors.name ? "border-red-400" : "border-gray-200"
                    )}
                  />
                  {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Rank + Service ID */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rank <span className="text-red-500">*</span>
                    </label>
                    <Field name="rank">
                      {({ field, form }) => (
                        <SelectField
                          label=""
                          options={RANKS}
                          value={field.value}
                          onChange={(v) => form.setFieldValue("rank", v)}
                          error={form.touched.rank && form.errors.rank}
                        />
                      )}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Service ID <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="svcId"
                      type="text"
                      placeholder="e.g. A1234567"
                      className={cn(
                        "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all",
                        touched.svcId && errors.svcId ? "border-red-400" : "border-gray-200"
                      )}
                    />
                    {touched.svcId && errors.svcId && <p className="mt-1 text-xs text-red-500">{errors.svcId}</p>}
                  </div>
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Unit Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="unitName"
                    type="text"
                    placeholder="e.g. SAR1, SAR8"
                    className={cn(
                      "w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all",
                      touched.unitName && errors.unitName ? "border-red-400" : "border-gray-200"
                    )}
                  />
                  {touched.unitName && errors.unitName && <p className="mt-1 text-xs text-red-500">{errors.unitName}</p>}
                </div>

                {/* User Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <Field name="role">
                    {({ field, form }) => (
                      <SelectField
                        label=""
                        options={ROLES}
                        value={field.value}
                        onChange={(v) => form.setFieldValue("role", v)}
                        error={form.touched.role && form.errors.role}
                      />
                    )}
                  </Field>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="flex-1 justify-center bg-brand-primary hover:bg-brand-primary-hover text-white border-transparent"
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

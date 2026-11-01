import { useEffect } from "react";
import { X } from "lucide-react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/button";
import { SelectOption } from "@/components/selectOption";
import { cn } from "@/lib/utils";

const MassAssignSchema = Yup.object().shape({
  baseStation: Yup.string().required("Base station is required"),
  weaponType: Yup.string().required("Weapon type is required"),
});

export function MassAssignModal({
  open,
  onClose,
  baseStationOptions,
  weaponOptions,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-[1200] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[480px] max-w-full bg-white z-[1201] flex flex-col shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Mass Assign</h2>
            <p className="text-xs text-gray-500 mt-0.5">in one action.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <Formik
          initialValues={{ baseStation: "", weaponType: "" }}
          validationSchema={MassAssignSchema}
          onSubmit={(values) => {
            onConfirm(values);
          }}
        >
          {(formik) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Base Station <span className="text-brand-primary">*</span>
                  </label>
                  <SelectOption
                    name="baseStation"
                    placeholder="Select base station"
                    options={baseStationOptions.map((station) => ({ value: station, label: station }))}
                    value={baseStationOptions
                      .map((station) => ({ value: station, label: station }))
                      .find((option) => option.value === formik.values.baseStation)}
                    formik={formik}
                    isSearchable={false}
                    placeholderClassName="text-sm"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Weapon Type <span className="text-brand-primary">*</span>
                  </label>
                  <SelectOption
                    name="weaponType"
                    placeholder="Select weapon type"
                    options={weaponOptions.map((weapon) => ({ value: weapon, label: weapon }))}
                    value={weaponOptions
                      .map((weapon) => ({ value: weapon, label: weapon }))
                      .find((option) => option.value === formik.values.weaponType)}
                    formik={formik}
                    isSearchable={false}
                    placeholderClassName="text-sm"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formik.isValid || !formik.dirty}
                  className="bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  Confirm
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

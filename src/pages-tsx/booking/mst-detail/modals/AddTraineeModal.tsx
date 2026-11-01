import { Modal } from "@/components/modal-1";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";

export interface AddTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  unitName?: string;
}

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

export function AddTraineeModal({ isOpen, onClose, onSubmit, unitName = "" }: AddTraineeModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add Trainee"
    >
      <p className="text-sm text-gray-500 mb-6">Please fill all the information.</p>
      <Formik
        initialValues={{
          rank: "",
          name: "",
          svcId: "",
          platoon: "",
          weaponType: "",
        }}
        validationSchema={AddTraineeSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
          onClose();
        }}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form className="space-y-4">
            <Field
              name="rank"
              as={SelectOption}
              options={RANK_OPTIONS}
              label="Rank"
              required
              placeholder="Select Rank"
              value={RANK_OPTIONS.find((o) => o.value === values.rank)}
              onChange={(opt: any) => setFieldValue("rank", opt?.value)}
              error={touched.rank ? errors.rank : undefined}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
              <Field as={InputCustom} name="name" placeholder="Enter name" required className="w-full" />
              {touched.name && errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service ID <span className="text-red-500">*</span></label>
              <Field as={InputCustom} name="svcId" placeholder="Enter Service ID (e.g. A1234567)" required className="w-full" />
              {touched.svcId && errors.svcId && <div className="text-red-500 text-xs mt-1">{errors.svcId}</div>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platoon Number <span className="text-red-500">*</span></label>
              <Field as={InputCustom} name="platoon" placeholder="Enter platoon" required className="w-full" />
              {touched.platoon && errors.platoon && <div className="text-red-500 text-xs mt-1">{errors.platoon}</div>}
            </div>
            
            <Field
              name="weaponType"
              as={SelectOption}
              options={WEAPON_OPTIONS}
              label="Weapon Type"
              required
              placeholder="Select Weapon Type"
              value={WEAPON_OPTIONS.find((o) => o.value === values.weaponType)}
              onChange={(opt: any) => setFieldValue("weaponType", opt?.value)}
              error={touched.weaponType ? errors.weaponType : undefined}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Name <span className="text-red-500">*</span></label>
              <InputCustom name="unitName" value={unitName} disabled className="w-full bg-gray-50 text-gray-500" />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent"
            >
              Confirm
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

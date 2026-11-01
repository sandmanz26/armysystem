import { Modal } from "@/components/modal-1";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { SelectOption } from "@/components/selectOption";
import { InputCustom } from "@/components/input";
import { Button } from "@/components/button";

/** One TCT nominal-roll row — the columns the TCT roll shows. */
export interface TCTTraineeValues {
  rank:    string;
  name:    string;
  svcId:    string;
  platoon: string;
  roles:   string;
}

const RANKS = ["REC", "PTE", "LCP", "CPL", "CFC", "3SG", "2SG", "1SG", "SGT", "SSG", "MSG", "3WO", "2WO", "1WO", "WO", "MWO", "SWO", "CWO", "MAJ"];
const ROLES = [
  "Vehicle Operator (VO)", "Vehicle Commander (VC)", "Troop Commander (TC)",
  "Section Commander (SC)", "Sensor Operator (SO)",
];
const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));
const RANK_OPTIONS = toOptions(RANKS);
const ROLE_OPTIONS = toOptions(ROLES);

const schema = Yup.object().shape({
  rank:    Yup.string().required("Rank is required"),
  name:    Yup.string().trim().required("Name is required"),
  svcId:    Yup.string().trim().required("Service ID is required"),
  platoon: Yup.string().trim().required("Platoon Number is required"),
  roles:   Yup.string().required("Roles is required"),
});

export function TCTAddTraineeModal({ isOpen, onClose, onSubmit, remaining }: {
  isOpen:    boolean;
  onClose:   () => void;
  onSubmit:  (values: TCTTraineeValues) => void;
  /** Seats left before the booking's trainee limit. */
  remaining: number;
}) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Add Trainee">
      <p className="text-sm text-gray-500 mb-6">
        Please fill all the information. {remaining} seat{remaining === 1 ? "" : "s"} left in this booking.
      </p>
      <Formik
        initialValues={{ rank: "", name: "", svcId: "", platoon: "", roles: "" } as TCTTraineeValues}
        validationSchema={schema}
        onSubmit={(values, { resetForm }) => { onSubmit(values); resetForm(); onClose(); }}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form className="space-y-4">
            <Field
              name="rank" as={SelectOption} options={RANK_OPTIONS} label="Rank" required placeholder="Select Rank"
              value={RANK_OPTIONS.find((o) => o.value === values.rank)}
              onChange={(opt: any) => setFieldValue("rank", opt?.value ?? "")}
              error={touched.rank ? errors.rank : undefined}
            />
            {([["name", "Name", "Enter name"], ["svcId", "Service ID", "Enter Service ID (e.g. A1234567)"], ["platoon", "Platoon Number", "e.g. Platoon 1"]] as const).map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
                <Field as={InputCustom} name={key} placeholder={ph} className="w-full" />
                {touched[key] && errors[key] && <div className="text-red-500 text-xs mt-1">{errors[key]}</div>}
              </div>
            ))}
            <Field
              name="roles" as={SelectOption} options={ROLE_OPTIONS} label="Roles" required placeholder="Select Role"
              value={ROLE_OPTIONS.find((o) => o.value === values.roles)}
              onChange={(opt: any) => setFieldValue("roles", opt?.value ?? "")}
              error={touched.roles ? errors.roles : undefined}
            />
            <Button type="submit" className="w-full mt-2 justify-center bg-brand-primary hover:bg-brand-primary-hover border-transparent">
              Confirm
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

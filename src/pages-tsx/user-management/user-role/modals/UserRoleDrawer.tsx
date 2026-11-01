import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import type { UserRole } from "@/data/userManagement";

/*
 * Add / Edit User Role — Figma `Action - Add User Role` (5029:101) and
 * `Action - Edit User Role` (6027:905765). One drawer for both: two fields,
 * only the title and primary label differ.
 *
 * Three validation messages appear across the frames:
 *   `Add - Empty Error`  → "User Role Name is required" / "Status is required"
 *   `Add - Filled Error` → "Role already exist"   (duplicate name)
 */

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

interface FormValues {
  name: string;
  status: string;
}

interface UserRoleDrawerProps {
  open: boolean;
  /** Present → Edit; absent → Add. */
  initial?: UserRole | null;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function UserRoleDrawer({ open, initial, existingNames, onClose, onSubmit }: UserRoleDrawerProps) {
  const isEdit = !!initial;
  const taken = existingNames
    .filter((n) => n.toLowerCase() !== (initial?.name ?? "").toLowerCase())
    .map((n) => n.toLowerCase());

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("User Role Name is required")
      .test("unique", "Role already exist", (v) => !v || !taken.includes(v.toLowerCase())),
    status: Yup.string().required("Status is required"),
  });

  return (
    <Formik<FormValues>
      enableReinitialize
      initialValues={{ name: initial?.name ?? "", status: initial?.status ?? "" }}
      validationSchema={schema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ values, errors, touched, setFieldValue, submitForm, handleChange, handleBlur }) => {
        const err = (k: keyof FormValues) => (touched[k] && errors[k] ? errors[k] : undefined);
        return (
          <Drawer
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit User Role" : "Add New User Role"}
            footer={
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-lg border border-invert-default bg-surface px-4 text-sm font-semibold text-default hover:bg-main-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-lg bg-primary-default px-4 text-sm font-semibold text-invert-default hover:bg-primary-hovered transition-colors"
                >
                  {isEdit ? "Confirm" : "Create User Role"}
                </button>
              </>
            }
          >
            <Form className="flex flex-col gap-4">
              <Input
                name="name"
                label="User Role"
                required
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter User Role Name (e.g., Maintainer)"
                status={err("name") ? "danger" : "default"}
                caption={err("name")}
              />
              <Select
                label="Status"
                required
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={(v) => setFieldValue("status", v)}
                placeholder="Select Status"
                status={err("status") ? "danger" : "default"}
                caption={err("status")}
              />
            </Form>
          </Drawer>
        );
      }}
    </Formik>
  );
}

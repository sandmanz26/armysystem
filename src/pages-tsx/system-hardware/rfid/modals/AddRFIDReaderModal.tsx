import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Drawer } from "@/components/drawer";
import { Button } from "@/components/button";
import { ReaderFormFields } from "../components/ReaderFormFields";
import type { RFIDReader, ReaderFormValues } from "../types";

// Figma's "Add - Filled Error" (5162:191264) shows an "already existed"
// error, but its own copy is buggy (repeats "Asset Category already
// existed" on the Display Name and Firmware Version fields, a copy-paste
// artifact from a different form — see docs/FIGMA-MAP.md). Only the fields
// where a real uniqueness check makes sense get one: Mac Address, IP
// Address, Display Name, MQTT Topic and Serial Number are all meant to
// identify a single physical reader; Firmware Version and Status aren't.
export function dedupeSchema(existing: RFIDReader[], excludeId?: string) {
  const others = existing.filter((r) => r.id !== excludeId);
  const unique = (field: keyof RFIDReader, label: string) =>
    Yup.string()
      .required(`${label} is required`)
      .test("unique", `${label} already existed`, (value) => !value || !others.some((r) => r[field] === value));

  return Yup.object().shape({
    macAddress: unique("macAddress", "RFID Reader Mac Address"),
    ipAddress: unique("ipAddress", "RFID Reader IP Address"),
    displayName: unique("displayName", "RFID Reader Display Name"),
    mqttTopic: unique("mqttTopic", "MQTT Topic"),
    serialNumber: unique("serialNumber", "RFID Reader Serial Number"),
    firmwareVersion: Yup.string().required("RFID Reader Firmware Version is required"),
    status: Yup.string().required("Status is required"),
  });
}

const initialValues: ReaderFormValues = {
  macAddress: "",
  ipAddress: "",
  displayName: "",
  mqttTopic: "",
  serialNumber: "",
  firmwareVersion: "",
  status: "",
};

interface AddRFIDReaderModalProps {
  existingReaders: RFIDReader[];
  onClose: () => void;
  onAdd: (reader: RFIDReader) => void;
}

// Figma `Add - Filled` (5162:191257): a plain 384px drawer — bold title +
// close, no icon circle and no subtitle under it (both invented in an
// earlier pass). Primary button reads "Create RFID Reader", not "Confirm".
export function AddRFIDReaderModal({ existingReaders, onClose, onAdd }: AddRFIDReaderModalProps) {
  const handleSubmit = (values: ReaderFormValues) => {
    onAdd({
      id: `r${Date.now()}`,
      no: 0,
      displayName: values.displayName,
      macAddress: values.macAddress,
      ipAddress: values.ipAddress,
      serialNumber: values.serialNumber,
      firmwareVersion: values.firmwareVersion,
      mqttTopic: values.mqttTopic,
      status: values.status as "Active" | "Inactive",
      armStatus: "Disarm",
    });
    onClose();
  };

  return (
    <Formik initialValues={initialValues} validationSchema={dedupeSchema(existingReaders)} onSubmit={handleSubmit}>
      {(formik) => (
        <Drawer
          open
          onClose={onClose}
          title="Add New RFID Reader"
          footer={
            <>
              <Button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-invert-default text-default hover:bg-default-soft transition-colors bg-surface w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={formik.submitForm}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary-default text-invert-default hover:bg-primary-hovered transition-colors w-auto"
              >
                Create RFID Reader
              </Button>
            </>
          }
        >
          <Form>
            <ReaderFormFields formik={formik} />
          </Form>
        </Drawer>
      )}
    </Formik>
  );
}

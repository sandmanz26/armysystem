import { Formik, Form } from "formik";
import { Drawer } from "@/components/drawer";
import { Button } from "@/components/button";
import { ReaderFormFields } from "../components/ReaderFormFields";
import { dedupeSchema } from "./AddRFIDReaderModal";
import type { RFIDReader, ReaderFormValues } from "../types";

interface EditRFIDReaderModalProps {
  reader: RFIDReader;
  existingReaders: RFIDReader[];
  onClose: () => void;
  onSave: (updated: RFIDReader) => void;
}

// Figma `Edit` (5162:191292): same plain 384px drawer as Add — bold title +
// close, no icon circle and no subtitle under it (both invented in an
// earlier pass). Primary button reads "Confirm", not "Save Changes".
export function EditRFIDReaderModal({ reader, existingReaders, onClose, onSave }: EditRFIDReaderModalProps) {
  const initialValues: ReaderFormValues = {
    macAddress: reader.macAddress,
    ipAddress: reader.ipAddress,
    displayName: reader.displayName,
    mqttTopic: reader.mqttTopic ?? "",
    serialNumber: reader.serialNumber,
    firmwareVersion: reader.firmwareVersion ?? "",
    status: reader.status,
  };

  const handleSubmit = (values: ReaderFormValues) => {
    onSave({
      ...reader,
      displayName: values.displayName,
      macAddress: values.macAddress,
      ipAddress: values.ipAddress,
      serialNumber: values.serialNumber,
      firmwareVersion: values.firmwareVersion,
      mqttTopic: values.mqttTopic,
      status: values.status as "Active" | "Inactive",
    });
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={dedupeSchema(existingReaders, reader.id)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formik) => (
        <Drawer
          open
          onClose={onClose}
          title="Edit RFID Reader"
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
                Confirm
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

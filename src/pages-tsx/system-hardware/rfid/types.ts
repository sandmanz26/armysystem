import type { RFIDReader } from "@/data/rfidConfig";

export type { RFIDReader };

export interface ReaderFormValues {
  macAddress: string;
  ipAddress: string;
  displayName: string;
  mqttTopic: string;
  serialNumber: string;
  firmwareVersion: string;
  status: string;
}

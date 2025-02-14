import { Auth, Property, Reservation, System } from "@/types/heartbeatResponse";
import { Timestamp } from "firebase/firestore";

export type Signals = "heartbeat" | "ping";

// Generic Signal class that can work with any data type extending BaseSignalData
export class Signal<T> {
  id: string;
  type: Signals;
  data: T;
  deviceFingerprint: string;
  propertyId: string;
  timestamp: Date;
  didReceive: boolean;
  currentPath: string;
  constructor(
    id: string,
    type: Signals,
    data: T,
    deviceFingerprint: string,
    propertyId: string,
    currentPath: string,
    timestamp: Date
  ) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.deviceFingerprint = deviceFingerprint;
    this.propertyId = propertyId;
    this.timestamp = timestamp;
    this.didReceive = false;
    this.currentPath = currentPath;
  }
}

// Specific data interfaces
export interface HeartbeatSendData {
  auth: Auth;
  property: {
    properties: Property[];
    selectedProperty: Property;
  };
  reservation: Reservation;
  system: System;
}

// Function to convert JSON string into TypeScript objects
function parseData<T>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error("Invalid JSON string", error);
    return null;
  }
}

// Specific Signal implementations
export class HeartbeatSendSignal extends Signal<HeartbeatSendData> {
  constructor(heartbeatData: {
    id: string;
    data: string;
    currentPath: string;
    timestamp: Timestamp;
  }) {
    const parsedData = parseData<HeartbeatSendData>(heartbeatData.data);
    if (!parsedData) {
      throw new Error("Invalid heartbeat data");
    }
    super(
      heartbeatData.id,
      "heartbeat",
      parsedData,
      parsedData.auth.deviceFingerprint,
      parsedData.property.selectedProperty?.id || "",
      heartbeatData.currentPath,
      heartbeatData.timestamp.toDate()
    );
  }
}

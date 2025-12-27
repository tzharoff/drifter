// src/lib/eroad/types.ts
export type EroadHosEvent = {
  driverId: string;
  driverExternalId?: string;
  status: "DRIVING" | "ON_DUTY" | "OFF_DUTY" | "SLEEPER";
  startTime: string;
  endTime: string | null;
};

export type MileageEvent = {
  vehicleId: string;
  timestamp: string;           // ISO
  distanceReading: number;     // cumulative miles
  driverExternalId: string | null;
};
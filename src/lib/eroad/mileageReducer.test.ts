import { describe, it, expect } from "vitest";
import { reduceMileageToMilesByDriver } from "./mileageReducer";
import { MileageEvent } from "./types";

describe("reduceMileageToMilesByDriver", () => {
  it("reduces cumulative mileage into miles per driver per day", () => {
    const events: MileageEvent[] = [
      // Driver ER123, Vehicle V1
      {
        vehicleId: "V1",
        timestamp: "2025-12-23T08:00:00Z",
        distanceReading: 1000,
        driverExternalId: "ER123",
      },
      {
        vehicleId: "V1",
        timestamp: "2025-12-23T12:00:00Z",
        distanceReading: 1030,
        driverExternalId: "ER123",
      },

      // Same driver, second vehicle
      {
        vehicleId: "V2",
        timestamp: "2025-12-23T09:00:00Z",
        distanceReading: 500,
        driverExternalId: "ER123",
      },
      {
        vehicleId: "V2",
        timestamp: "2025-12-23T11:00:00Z",
        distanceReading: 520,
        driverExternalId: "ER123",
      },

      // Driver ER456, single reading → ignored
      {
        vehicleId: "V3",
        timestamp: "2025-12-23T10:00:00Z",
        distanceReading: 200,
        driverExternalId: "ER456",
      },

      // Null driver → ignored
      {
        vehicleId: "V4",
        timestamp: "2025-12-23T08:00:00Z",
        distanceReading: 300,
        driverExternalId: null,
      },

      // Wrong date → ignored
      {
        vehicleId: "V1",
        timestamp: "2025-12-22T23:59:00Z",
        distanceReading: 990,
        driverExternalId: "ER123",
      },
    ];

    const result = reduceMileageToMilesByDriver(events, "2025-12-23");

    // ER123: (1030 - 1000) + (520 - 500) = 30 + 20 = 50
    expect(result.get("ER123")).toBeCloseTo(50, 2);

    // ER456 should not appear (single reading)
    expect(result.has("ER456")).toBe(false);
  });
});

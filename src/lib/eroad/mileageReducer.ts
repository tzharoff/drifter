// src/lib/eroad/mileageReducer.ts
import { MileageEvent } from "./types";

/**
 * Reduce mileage telemetry into total miles driven per driver for a given day.
 *
 * Strategy:
 * - Group events by (driverExternalId, vehicleId)
 * - For each group, take max(distanceReading) - min(distanceReading)
 * - Sum across vehicles per driver
 */
export function reduceMileageToMilesByDriver(
  events: MileageEvent[],
  metricDate: string
): Map<string, number> {
  const byDriverVehicle = new Map<string, MileageEvent[]>();

  for (const e of events) {
    if (!e.driverExternalId) continue;

    // Ensure event belongs to metricDate (UTC-safe)
    if (!e.timestamp.startsWith(metricDate)) continue;

    const key = `${e.driverExternalId}::${e.vehicleId}`;

    const arr = byDriverVehicle.get(key) ?? [];
    arr.push(e);
    byDriverVehicle.set(key, arr);
  }

  const milesByDriver = new Map<string, number>();

  for (const [key, group] of byDriverVehicle.entries()) {
    if (group.length < 2) continue;

    let min = Infinity;
    let max = -Infinity;

    for (const e of group) {
      min = Math.min(min, e.distanceReading);
      max = Math.max(max, e.distanceReading);
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) continue;

    const delta = Math.max(0, max - min);

    const driverExternalId = key.split("::")[0];
    const current = milesByDriver.get(driverExternalId) ?? 0;

    milesByDriver.set(driverExternalId, current + delta);
  }

  return milesByDriver;
}

export function reduceMileageToDailyDeltas(
  events: MileageEvent[]
): Map<string, number> {
  const byVehicle = new Map<string, MileageEvent[]>();

  // 1️⃣ Group by vehicle
  for (const e of events) {
    if (!e.vehicleId || typeof e.distanceReading !== "number") continue;

    const list = byVehicle.get(e.vehicleId) ?? [];
    list.push(e);
    byVehicle.set(e.vehicleId, list);
  }

  const mileageByVehicle = new Map<string, number>();

  // 2️⃣ Sort + diff
  for (const [vehicleId, vehicleEvents] of byVehicle) {
    if (vehicleEvents.length < 2) {
      mileageByVehicle.set(vehicleId, 0);
      continue;
    }

    vehicleEvents.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

    const first = vehicleEvents[0].distanceReading;
    const last = vehicleEvents[vehicleEvents.length - 1].distanceReading;

    const delta = last - first;

    mileageByVehicle.set(vehicleId, Math.max(0, delta));
  }

  return mileageByVehicle;
}
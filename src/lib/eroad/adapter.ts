// src/lib/eroad/adapter.ts
import { fetchHosForDate } from "./fetchHos";
import { fetchMileageForDate } from "./fetchMileage";
import { reduceHosToDriveHours } from "./hosReducer";
import { reduceMileageToMilesByDriver } from "./mileageReducer";
import { NormalizedDailyMetric } from "@/domain/metrics/NormalizedDailyMetric";

export async function buildDailyEroadMetrics(
  metricDate: string
): Promise<NormalizedDailyMetric[]> {
  // 1️⃣ Fetch HOS + Reduce
  const hosEvents = await fetchHosForDate(metricDate);
  const driveHoursByDriver = reduceHosToDriveHours(
    hosEvents.map((e) => ({
      driverExternalId: e.driverExternalId!,
      status: e.status,
      startTime: e.startTime,
      endTime: e.endTime,
    })),
    metricDate
  );

  // 2️⃣ Fetch mileage + reduce
  const mileageEvents = await fetchMileageForDate(metricDate);
  const milesByDriver = reduceMileageToMilesByDriver(
    mileageEvents,
    metricDate
  );

  // 3️⃣ Union of drivers
  const driverIds = new Set<string>([
    ...driveHoursByDriver.keys(),
    ...milesByDriver.keys(),
  ]);

  // 4️⃣ Adapt → NormalizedDailyMetric
  const metrics: NormalizedDailyMetric[] = [];

  for (const driverExternalId of driverIds) {
    metrics.push({
      driverExternalId,
      routeCode: "UNKNOWN", // resolved later
      metricDate,
      miles: milesByDriver.get(driverExternalId) ?? 0,
      driveHours: driveHoursByDriver.get(driverExternalId) ?? 0,
      source: "eroad",
    });
  }

  return metrics;
}

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MileageEvent } from "./types";
import { dot } from "node:test/reporters";
const baseUrl = process.env.EROAD_API_BASE!;
const apiKey = process.env.EROAD_API_KEY!;


/**
 * Fetch raw vehicle mileage telemetry from EROAD.
 * Inspect-only: no aggregation, no filtering, no DB writes.
 */
export async function fetchMileageForDate(
  date: string // YYYY-MM-DD
): Promise<MileageEvent[]> {
  // NOTE: vehicleCurrentState is "current", not historical.
  // For now we are inspecting shape, not correctness.
  const url = `${baseUrl}/vehicleCurrentState`;

  const res = await fetch(url, {
    headers: {
      ApiKey: apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("EROAD mileage fetch failed", {
      status: res.status,
      body: text,
    });
    throw new Error(`EROAD mileage fetch failed (${res.status})`);
  }

  const json = await res.json();
  console.log("Raw mileage payload:", JSON.stringify(json, null, 2));
  /**
   * Swagger typically returns:
   * {
   *   vehicles: [...]
   * }
   */
  const vehicles = Array.isArray(json.results) ? json.results : [];

  const events: MileageEvent[] = vehicles.map((v: any) => ({
    vehicleId: v.vehicleId ?? v.id,
    timestamp: v.timestamp ?? v.lastUpdated ?? new Date().toISOString(),
    distanceReading:
      v.distanceReading ??
      v.odometer ??
      v.totalDistance ??
      0,
    driverExternalId:
      v.driver?.externalId ??
      v.currentDriver?.externalId ??
      null,
  }));

  return events;
}

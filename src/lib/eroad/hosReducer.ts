// src/lib/eroad/hosReducer.ts

export type HosEvent = {
  driverExternalId: string;
  status: "DRIVING" | "ON_DUTY" | "OFF_DUTY" | "SLEEPER";
  startTime: string; // ISO timestamp
  endTime: string | null; // ISO or null
};

export function reduceHosToDriveHours(
  events: HosEvent[],
  metricDate: string // YYYY-MM-DD (UTC)
): Map<string, number> {
  const dayStart = new Date(`${metricDate}T00:00:00Z`).getTime();
  const dayEnd = new Date(`${metricDate}T24:00:00Z`).getTime();

  const totals = new Map<string, number>();

  for (const e of events) {
    if (e.status !== "DRIVING") continue;

    const start = new Date(e.startTime).getTime();
    const end = e.endTime ? new Date(e.endTime).getTime() : Date.now();

    const effectiveStart = Math.max(start, dayStart);
    const effectiveEnd = Math.min(end, dayEnd);

    if (effectiveStart >= effectiveEnd) continue;

    const hours = (effectiveEnd - effectiveStart) / (1000 * 60 * 60);

    totals.set(
      e.driverExternalId,
      (totals.get(e.driverExternalId) ?? 0) + hours
    );
  }

  return totals;
}

// src/lib/eroad/adapter.ts
import { NormalizedDailyMetric } from "@/domain/metrics/NormalizedDailyMetric";


const sample: EroadDailyRecord[] = [
  {
    driver: { externalId: "ER123", name: "Jane Driver" },
    route: { code: "WA-542" },
    date: "2025-12-23T00:00:00Z",
    totals: {
      miles: 142.6,
      driveHours: 5.4,
    },
  },
];

console.log(normalizeEroadRecords(sample));


/**
 * Minimal shape of what we care about from EROAD.
 * Everything else is ignored on purpose.
 */
export type EroadDailyRecord = {
  driver: {
    externalId: string;
    name?: string;
  };
  route: {
    code: string;
  };
  date: string; // ISO or YYYY-MM-DD
  totals: {
    miles: number;
    driveHours: number;
  };
};

export function normalizeEroadRecords(
  records: EroadDailyRecord[]
): NormalizedDailyMetric[] {
  const mapped = records.map((r) => {
    if (
      !r.driver?.externalId ||
      !r.route?.code ||
      !r.date ||
      typeof r.totals?.miles !== "number" ||
      typeof r.totals?.driveHours !== "number"
    ) {
      return null;
    }

    const metric: NormalizedDailyMetric = {
      driverExternalId: r.driver.externalId,
      routeCode: r.route.code,
      metricDate: r.date.slice(0, 10),
      miles: r.totals.miles,
      driveHours: r.totals.driveHours,
      source: "eroad",
    };

    return metric;
  });

  return mapped.filter(
    (r): r is NormalizedDailyMetric => r !== null
  );
}


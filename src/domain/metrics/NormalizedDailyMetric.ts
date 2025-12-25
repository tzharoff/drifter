export type NormalizedDailyMetric = {
  /** External system’s stable driver identifier (EROAD, etc.) */
  driverExternalId: string;

  /** Route identifier as used operationally */
  routeCode: string;

  /** ISO date string: YYYY-MM-DD */
  metricDate: string;

  /** Total miles driven that day */
  miles: number;

  /** Total driving hours that day */
  driveHours: number;

  /** Where this record came from */
  source: "eroad" | "manual" | "seed";
};
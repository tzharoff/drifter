import { describe, it, expect } from "vitest";
import { normalizeEroadRecords, EroadDailyRecord } from "./adapter";

describe("normalizeEroadRecords", () => {
  it("normalizes valid EROAD records", () => {
    const input: EroadDailyRecord[] = [
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

    const result = normalizeEroadRecords(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      driverExternalId: "ER123",
      routeCode: "WA-542",
      metricDate: "2025-12-23",
      miles: 142.6,
      driveHours: 5.4,
      source: "eroad",
    });
  });

  it("drops invalid records", () => {
    const input: EroadDailyRecord[] = [
      {
        driver: { externalId: "ER123" },
        route: { code: "WA-542" },
        date: "2025-12-23",
        totals: {
          miles: 100,
          driveHours: 4,
        },
      },
      {
        // ❌ missing driver.externalId
        driver: { externalId: "" },
        route: { code: "WA-999" },
        date: "2025-12-23",
        totals: {
          miles: 90,
          driveHours: 3,
        },
      },
    ];

    const result = normalizeEroadRecords(input);

    expect(result).toHaveLength(1);
    expect(result[0].routeCode).toBe("WA-542");
  });

  it("returns an empty array if all records are invalid", () => {
    const input: EroadDailyRecord[] = [
      {
        // completely broken
        driver: { externalId: "" },
        route: { code: "" },
        date: "",
        totals: {
          miles: NaN,
          driveHours: NaN,
        },
      },
    ];

    const result = normalizeEroadRecords(input);

    expect(result).toEqual([]);
  });
});

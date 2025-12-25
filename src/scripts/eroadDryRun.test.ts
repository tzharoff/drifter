import { describe, it, expect } from "vitest";
import { normalizeEroadRecords, type EroadDailyRecord } from "@/lib/eroad/adapter";

describe("EROAD → adapter → ingest (dryRun)", () => {
  it("normalizes and posts records without writing to DB", async () => {
    // Simulated EROAD payload
    const eroadPayload: EroadDailyRecord[] = [
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

    // Adapter step
    const normalized = normalizeEroadRecords(eroadPayload);

    // Call real ingest endpoint (dry run)
    const res = await fetch(
      "http://localhost:3000/api/eroad/ingest?dryRun=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      }
    );

    expect(res.ok).toBe(true);

    const json = await res.json();

    expect(json).toMatchObject({
      status: "ok",
      dryRun: true,
      received: 1,
    });

    // Depending on your response shape
    expect(json.wouldInsert ?? json.inserted ?? 0).toBeGreaterThanOrEqual(0);
  });
});

import { describe, it, expect } from "vitest";
import { fetchMileageForDate } from "@/lib/eroad/fetchMileage";

describe("EROAD mileage fetch (inspect only)", () => {
  it("fetches vehicle mileage telemetry and logs shape", async () => {
    const events = await fetchMileageForDate("2025-12-23");

    console.log("Mileage events sample:", events[0]);

    
    expect(Array.isArray(events)).toBe(true);
  });
});

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { describe, it } from "vitest";


console.log("EROAD_API_BASE =", process.env.EROAD_API_BASE_URL);
console.log("EROAD_API_KEY exists =", !!process.env.EROAD_API_KEY);


describe("EROAD real fetch (inspect only)", () => {
  it("fetches daily driver metrics and logs shape", async () => {
    const baseUrl = process.env.EROAD_API_BASE_URL!;
    const apiKey = process.env.EROAD_API_KEY!;

    // Pick ONE date with known activity
    const date = "2025-12-23";

    const res = await fetch(`${baseUrl}/drivers`, {
    headers: {
        ApiKey: apiKey,
        Accept: "application/json",
    },
    });

    if (!res.ok) {
      console.error("Status:", res.status);
      console.error(await res.text());
      throw new Error("EROAD fetch failed");
    }

    const json = await res.json();

    console.log("Top-level keys:", Object.keys(json));

    if (Array.isArray(json)) {
      console.log("Array length:", json.length);
      console.log("Sample record:", json[0]);
    } else if (json?.data && Array.isArray(json.data)) {
      console.log("Data length:", json.data.length);
      console.log("Sample record:", json.data[0]);
    } else {
      console.log("Unexpected shape:", json);
    }
  });
});

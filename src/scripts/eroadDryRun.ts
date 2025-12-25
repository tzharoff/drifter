// src/scripts/eroadDryRun.ts

import { normalizeEroadRecords } from "../lib/eroad/adapter";

async function run() {
  // Simulated EROAD payload (replace later with real fetch)
  const eroadPayload = [
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

  const normalized = normalizeEroadRecords(eroadPayload);

  const res = await fetch(
    "http://localhost:3000/api/eroad/ingest?dryRun=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalized),
    }
  );

  const json = await res.json();
  console.log(json);
}

run();

import { buildDailyEroadMetrics } from "../lib/eroad/adapter.ts";

async function run() {
  const metricDate = "2025-12-23";

  const metrics = await buildDailyEroadMetrics(metricDate);

  console.log("🔍 Full normalized metrics:");
  console.table(metrics);

  const res = await fetch(
    "http://localhost:3001/api/eroad/ingest?dryRun=true",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics),
    }
  );

  const json = await res.json();
  console.log("🧪 Ingest response:", json);
}

run();

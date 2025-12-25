import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { NormalizedDailyMetric } from "@/domain/metrics/NormalizedDailyMetric";

function isValidMetric(m: NormalizedDailyMetric): boolean {
  return (
    typeof m.driverExternalId === "string" &&
    typeof m.routeCode === "string" &&
    typeof m.metricDate === "string" &&
    typeof m.miles === "number" &&
    typeof m.driveHours === "number" &&
    m.miles >= 0 &&
    m.driveHours >= 0
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as
      | NormalizedDailyMetric
      | NormalizedDailyMetric[];

    const records = Array.isArray(body) ? body : [body];
    const validRecords = records.filter(isValidMetric);

    if (validRecords.length === 0) {
      return NextResponse.json(
        { error: "No valid metrics provided" },
        { status: 400 }
      );
    }

    let insertedCount = 0;

    const url = new URL(req.url);
    const dryRun = url.searchParams.get("dryRun") === "true";


    for (const record of validRecords) {
      if (dryRun) {
        continue;
      }

      const {
        driverExternalId,
        routeCode,
        metricDate,
        miles,
        driveHours,
        source,
      } = record;

      // 1️⃣ Upsert driver (name may be null for now)
      const driverResult = await pool.query(
        `
        insert into drivers (external_id)
        values ($1)
        on conflict (external_id)
        do update set external_id = excluded.external_id
        returning id
        `,
        [driverExternalId]
      );

      const driverId = driverResult.rows[0].id;

      // 2️⃣ Upsert route
      const routeResult = await pool.query(
        `
        insert into routes (code)
        values ($1)
        on conflict (code)
        do update set code = excluded.code
        returning id
        `,
        [routeCode]
      );

      const routeId = routeResult.rows[0].id;

      // 3️⃣ Insert daily metric (idempotent)
      const metricResult = await pool.query(
        `
        insert into daily_driver_metrics (
          metric_date,
          driver_id,
          route_id,
          miles,
          drive_hours,
          source
        )
        values ($1, $2, $3, $4, $5, $6)
        on conflict (metric_date, driver_id, route_id)
        do nothing
        `,
        [metricDate, driverId, routeId, miles, driveHours, source]
      );



      if (metricResult.rowCount === 1) {
        insertedCount++;
      }
    }

    return NextResponse.json({
      status: "ok",
      dryRun,
      received: records.length,
      inserted: insertedCount,
      skipped: records.length - insertedCount,
    });
  } catch (err) {
    console.error("❌ Ingest error", err);
    return NextResponse.json(
      { error: "Internal ingest error" },
      { status: 500 }
    );
  }
}

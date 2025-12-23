import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type IngestPayload = {
  driverExternalId: string;
  driverName: string;
  routeCode: string;
  date: string;
  miles: number;
  driveHours: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IngestPayload;

    const {
      driverExternalId,
      driverName,
      routeCode,
      date,
      miles,
      driveHours,
    } = body;

    // 🛑 Minimal validation
    if (
      !driverExternalId ||
      !driverName ||
      !routeCode ||
      !date ||
      miles == null ||
      driveHours == null
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Upsert driver
    const driverResult = await pool.query(
      `
      insert into drivers (external_id, name)
      values ($1, $2)
      on conflict (external_id)
      do update set name = excluded.name
      returning id
      `,
      [driverExternalId, driverName]
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

    // 3️⃣ Insert daily metric (idempotent via unique constraint)
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
      values ($1, $2, $3, $4, $5, 'payload')
      on conflict (metric_date, driver_id, route_id)
      do nothing
      returning *
      `,
      [date, driverId, routeId, miles, driveHours]
    );

    return NextResponse.json({
      status: "ok",
      inserted: metricResult.rows[0] ?? null,
      message: metricResult.rows.length
        ? "Metric inserted"
        : "Metric already exists (skipped)",
    });
  } catch (err) {
    console.error("❌ Ingest error", err);
    return NextResponse.json(
      { error: "Internal ingest error" },
      { status: 500 }
    );
  }
}

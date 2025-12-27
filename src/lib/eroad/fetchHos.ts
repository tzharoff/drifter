// src/lib/eroad/fetchHos.ts
import { EroadHosEvent } from "./types";
import "dotenv/config";

const baseUrl = process.env.EROAD_API_BASE!;
const apiKey = process.env.EROAD_API_KEY!;

export async function fetchHosForDate(
  date: string // YYYY-MM-DD
): Promise<EroadHosEvent[]> {
  const url = `${baseUrl}/hos/drivers/hoursOfService?date=${date}`;

  const res = await fetch(url, {
    headers: {
      ApiKey: apiKey,
      Accept: "application/json",
    },
  });

    if (!res.ok) {
    const text = await res.text();
    console.error("EROAD HOS fetch failed", {
        status: res.status,
        body: text,
    });

    throw new Error(`EROAD HOS fetch failed (${res.status})`);
    }

    const json = await res.json();

    if (Array.isArray(json.results)) {
    return json.results;
    }

    console.warn("Unexpected EROAD payload shape", json);
    return [];
}

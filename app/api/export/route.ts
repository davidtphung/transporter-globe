import { NextRequest } from "next/server";
import { payloads } from "@/data/transporter";
import { getEnrichedPayloads } from "@/lib/cache/orbital-cache";

function csvEscape(value: string | number | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const missionId = request.nextUrl.searchParams.get("mission");
  const enrichedPayloads = await getEnrichedPayloads(payloads);
  const exportPayloads = missionId
    ? enrichedPayloads.filter((payload) => payload.missionId === missionId)
    : enrichedPayloads;

  if (format === "csv") {
    const rows = [
      ["mission_id", "payload", "operator", "type", "status", "norad_id", "perigee_km", "apogee_km", "confidence"],
      ...exportPayloads.map((payload) => [
        payload.missionId,
        payload.name,
        payload.operator,
        payload.payloadType,
        payload.status,
        payload.noradId,
        payload.perigeeKm,
        payload.apogeeKm,
        payload.sourceRefs[0]?.confidence
      ])
    ];

    return new Response(rows.map((row) => row.map(csvEscape).join(",")).join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=transporter-globe-payloads.csv"
      }
    });
  }

  return Response.json({ payloads: exportPayloads, generatedAtUtc: new Date().toISOString() });
}

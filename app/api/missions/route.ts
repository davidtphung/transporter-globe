import { NextResponse } from "next/server";
import { events, missions, payloads } from "@/data/transporter";
import { getCacheMetadata, getEnrichedPayloads } from "@/lib/cache/orbital-cache";

export async function GET() {
  const enrichedPayloads = await getEnrichedPayloads(payloads);

  return NextResponse.json({
    missions,
    payloads: enrichedPayloads,
    events,
    generatedAtUtc: new Date().toISOString(),
    cache: getCacheMetadata()
  });
}
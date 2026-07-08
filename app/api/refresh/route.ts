import { NextResponse } from "next/server";
import { events, payloads } from "@/data/transporter";
import { cacheEvents, getCacheMetadata, getEnrichedPayloads, invalidateOrbitalCache } from "@/lib/cache/orbital-cache";

export async function POST() {
  invalidateOrbitalCache();
  const enrichedPayloads = await getEnrichedPayloads(payloads);
  cacheEvents(events);

  return NextResponse.json({
    refreshedAtUtc: new Date().toISOString(),
    payloadCount: enrichedPayloads.length,
    cache: getCacheMetadata()
  });
}

export async function GET() {
  const enrichedPayloads = await getEnrichedPayloads(payloads);
  return NextResponse.json({
    generatedAtUtc: new Date().toISOString(),
    payloadCount: enrichedPayloads.length,
    cache: getCacheMetadata()
  });
}
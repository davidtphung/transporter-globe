import type { MissionEvent, Payload } from "@/types";
import { fetchCelestrakGp } from "@/lib/adapters/celestrak";
import { mergeCatalogRecords } from "@/lib/adapters/normalize";
import { fetchSpaceTrackCatalog } from "@/lib/adapters/spacetrack-mock";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const TTL_MS = 1000 * 60 * 30;

let payloadCache: CacheEntry<Payload[]> | null = null;
let eventsCache: CacheEntry<MissionEvent[]> | null = null;

function isFresh<T>(entry: CacheEntry<T> | null) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export async function getEnrichedPayloads(seedPayloads: Payload[]): Promise<Payload[]> {
  if (isFresh(payloadCache)) {
    return payloadCache!.value;
  }

  const [spaceTrack, celestrak] = await Promise.all([
    fetchSpaceTrackCatalog(seedPayloads),
    fetchCelestrakGp(seedPayloads)
  ]);

  const enriched = seedPayloads.map((payload, index) => {
    const noradId = payload.noradId;
    const spaceTrackRecord = spaceTrack.find((record) => record.noradCatId === noradId) ?? spaceTrack[index];
    const celestrakRecord = celestrak.find((record) => record.noradId === noradId);
    return mergeCatalogRecords(payload, spaceTrackRecord, celestrakRecord);
  });

  payloadCache = {
    value: enriched,
    expiresAt: Date.now() + TTL_MS
  };

  return enriched;
}

export function cacheEvents(events: MissionEvent[]) {
  eventsCache = {
    value: events,
    expiresAt: Date.now() + TTL_MS
  };
}

export function getCachedEvents() {
  return isFresh(eventsCache) ? eventsCache!.value : null;
}

export function invalidateOrbitalCache() {
  payloadCache = null;
  eventsCache = null;
}

export function getCacheMetadata() {
  return {
    payloadCacheFresh: isFresh(payloadCache),
    eventsCacheFresh: isFresh(eventsCache),
    payloadCacheExpiresAtUtc: payloadCache ? new Date(payloadCache.expiresAt).toISOString() : null
  };
}
import { Workspace } from "@/components/Workspace";
import { events, missions, payloads } from "@/data/transporter";
import { getCacheMetadata, getEnrichedPayloads } from "@/lib/cache/orbital-cache";

export default async function Home() {
  const enrichedPayloads = await getEnrichedPayloads(payloads);
  const cache = getCacheMetadata();

  return (
    <Workspace
      initialMissions={missions}
      initialPayloads={enrichedPayloads}
      initialEvents={events}
      cacheExpiresAtUtc={cache.payloadCacheExpiresAtUtc}
    />
  );
}
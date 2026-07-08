import { events, payloads } from "../data/transporter";
import { cacheEvents, getEnrichedPayloads, invalidateOrbitalCache } from "../lib/cache/orbital-cache";

async function main() {
  invalidateOrbitalCache();
  const enriched = await getEnrichedPayloads(payloads);
  cacheEvents(events);
  console.log(`Refreshed ${enriched.length} payload records at ${new Date().toISOString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
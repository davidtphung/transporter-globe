import { describe, expect, it } from "vitest";
import { payloads } from "@/data/transporter";
import { fetchCelestrakGp } from "@/lib/adapters/celestrak";
import { mergeCatalogRecords } from "@/lib/adapters/normalize";
import { fetchSpaceTrackCatalog } from "@/lib/adapters/spacetrack-mock";

describe("orbital adapters", () => {
  it("returns mocked Space-Track records for cataloged payloads", async () => {
    const records = await fetchSpaceTrackCatalog(payloads.slice(0, 3));
    expect(records).toHaveLength(3);
    expect(records[0].noradCatId).toBeTruthy();
  });

  it("returns CelesTrak GP records when TLE lines exist", async () => {
    const records = await fetchCelestrakGp(payloads);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0].tle1.startsWith("1 ")).toBe(true);
  });

  it("merges catalog provenance into payload fields", async () => {
    const payload = payloads[0];
    const [spaceTrack] = await fetchSpaceTrackCatalog([payload]);
    const merged = mergeCatalogRecords(payload, spaceTrack);
    expect(merged.sourceRefs.some((ref) => ref.sourceName.includes("Space-Track"))).toBe(true);
  });
});
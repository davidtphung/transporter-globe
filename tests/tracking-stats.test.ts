import { describe, expect, it } from "vitest";
import { missions, payloads } from "@/data/transporter";
import { getTrackingStats } from "@/lib/tracking-stats";

describe("tracking stats", () => {
  it("tracks the full transporter manifest", () => {
    const stats = getTrackingStats(payloads);
    const expectedTotal = missions.reduce((sum, mission) => sum + mission.manifestCount, 0);

    expect(stats.total).toBe(expectedTotal);
    expect(stats.total).toBeGreaterThan(1500);
    expect(stats.onOrbit).toBeGreaterThan(1400);
  });
});
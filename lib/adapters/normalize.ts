import type { Mission, MissionEvent, Payload, SourceRef } from "@/types";
import type { CelestrakGpRecord } from "./celestrak";
import type { SpaceTrackRecord } from "./spacetrack-mock";

export function mergeCatalogRecords(
  payload: Payload,
  spaceTrack?: SpaceTrackRecord,
  celestrak?: CelestrakGpRecord
): Payload {
  const sourceRefs: SourceRef[] = [...payload.sourceRefs];

  if (spaceTrack) {
    sourceRefs.push({
      sourceName: "Space-Track (mock adapter)",
      url: "https://www.space-track.org/",
      retrievedAtUtc: new Date().toISOString(),
      confidence: 0.74,
      notes: `Catalog record ${spaceTrack.noradCatId} merged into payload orbit fields.`
    });
  }

  if (celestrak) {
    sourceRefs.push({
      sourceName: "CelesTrak GP",
      url: "https://celestrak.org/NORAD/elements/gp.php",
      retrievedAtUtc: new Date().toISOString(),
      confidence: 0.7,
      notes: `GP element set epoch ${celestrak.epoch}.`
    });
  }

  return {
    ...payload,
    noradId: spaceTrack?.noradCatId ?? celestrak?.noradId ?? payload.noradId,
    intlDesignator: spaceTrack?.intlDes ?? payload.intlDesignator,
    tleEpoch: celestrak?.epoch ?? spaceTrack?.epoch ?? payload.tleEpoch,
    tle1: celestrak?.tle1 ?? spaceTrack?.tleLine1 ?? payload.tle1,
    tle2: celestrak?.tle2 ?? spaceTrack?.tleLine2 ?? payload.tle2,
    apogeeKm: spaceTrack?.apogee ?? payload.apogeeKm,
    perigeeKm: spaceTrack?.perigee ?? payload.perigeeKm,
    inclinationDeg: spaceTrack?.inclination ?? payload.inclinationDeg,
    sourceRefs
  };
}

export function buildMissionSummary(mission: Mission, missionPayloads: Payload[], missionEvents: MissionEvent[]) {
  return {
    mission,
    manifestCount: missionPayloads.length,
    operatorCount: new Set(missionPayloads.map((payload) => payload.operator)).size,
    activeCount: missionPayloads.filter((payload) => payload.status === "active").length,
    deploymentEvents: missionEvents.filter((event) => event.type === "deployment").length,
    averageConfidence:
      missionPayloads.reduce((sum, payload) => sum + (payload.sourceRefs[0]?.confidence ?? 0.5), 0) /
      Math.max(missionPayloads.length, 1)
  };
}
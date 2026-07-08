import type { Mission, MissionEvent, Payload, SourceRef } from "@/types";

const retrievedAtUtc = "2026-07-08T00:00:00.000Z";

const source = (sourceName: string, url: string, confidence: number, notes: string): SourceRef => ({
  sourceName,
  url,
  retrievedAtUtc,
  confidence,
  notes
});

const spacexRideshare = source(
  "SpaceX Rideshare",
  "https://www.spacex.com/rideshare/",
  0.82,
  "Program-level source for Transporter rideshare cadence and service context."
);

const spaceflightNowT15 = source(
  "Spaceflight Now Transporter-15",
  "https://spaceflightnow.com/2025/11/28/live-coverage-spacex-to-launch-140-spacecraft-on-transporter-15-rideshare/",
  0.86,
  "Reported Transporter-15 launch time and 140 spacecraft manifest count."
);

const spaceDotComT17 = source(
  "Space.com Transporter-17",
  "https://www.space.com/space-exploration/launches-spacecraft/spacex-falcon-9-transporter-17-rideshare-launch-81-satellites",
  0.84,
  "Reported Transporter-17 launch and 81 satellite manifest count."
);

const exolaunchT14 = source(
  "Exolaunch Transporter-14",
  "https://www.exolaunch.com/mission_37",
  0.82,
  "Operator source for Transporter-14 deployment services and customer payload context."
);

const vardaSource = source(
  "Varda public mission updates",
  "https://www.varda.com/",
  0.68,
  "Landing corridor and reentry markers are modeled fixtures until capsule telemetry is connected."
);

export const missions: Mission[] = [
  ["transporter-1", "Transporter-1", "2021-01-24T15:00:00.000Z", 143],
  ["transporter-2", "Transporter-2", "2021-06-30T19:31:00.000Z", 88],
  ["transporter-3", "Transporter-3", "2022-01-13T15:25:00.000Z", 105],
  ["transporter-4", "Transporter-4", "2022-04-01T16:24:00.000Z", 40],
  ["transporter-5", "Transporter-5", "2022-05-25T18:35:00.000Z", 59],
  ["transporter-6", "Transporter-6", "2023-01-03T14:56:00.000Z", 114],
  ["transporter-7", "Transporter-7", "2023-04-15T06:48:00.000Z", 51],
  ["transporter-8", "Transporter-8", "2023-06-12T21:35:00.000Z", 72],
  ["transporter-9", "Transporter-9", "2023-11-11T18:49:00.000Z", 90],
  ["transporter-10", "Transporter-10", "2024-03-04T22:05:00.000Z", 53],
  ["transporter-11", "Transporter-11", "2024-08-16T18:56:00.000Z", 116],
  ["transporter-12", "Transporter-12", "2025-01-14T19:09:00.000Z", 131],
  ["transporter-13", "Transporter-13", "2025-03-15T06:43:00.000Z", 74],
  ["transporter-14", "Transporter-14", "2025-06-23T21:25:00.000Z", 70],
  ["transporter-15", "Transporter-15", "2025-11-28T18:44:30.000Z", 140],
  ["transporter-16", "Transporter-16", "2026-03-30T10:20:00.000Z", 119],
  ["transporter-17", "Transporter-17", "2026-07-07T08:10:00.000Z", 81]
].map(([id, name, launchDateUtc, manifestCount], index) => ({
  id: String(id),
  name: String(name),
  launchDateUtc: String(launchDateUtc),
  vehicle: "Falcon 9",
  launchSite: "SLC-4E, Vandenberg Space Force Base",
  landingSite: index % 3 === 1 ? "Landing Zone 4" : "Of Course I Still Love You",
  orbitType: index % 4 === 2 ? "Mid-inclination LEO" : "Sun-synchronous orbit",
  manifestCount: Number(manifestCount),
  sourceRefs:
    id === "transporter-15"
      ? [spaceflightNowT15, spacexRideshare]
      : id === "transporter-17"
        ? [spaceDotComT17, spacexRideshare]
        : id === "transporter-14"
          ? [exolaunchT14, spacexRideshare]
          : [spacexRideshare]
}));

const operators = [
  "Planet",
  "ICEYE",
  "BlackSky",
  "Capella Space",
  "Spire Lemur",
  "D-Orbit",
  "Exolaunch",
  "Varda Space Industries",
  "Umbra",
  "Satellogic",
  "HawkEye 360",
  "GHGSat"
];

const payloadTypes = ["cubesat", "microsat", "hosted payload", "orbital transfer vehicle", "tech demo"];

function manifestRowCount(mission: Mission) {
  if (mission.id === "transporter-17") return 81;
  if (mission.id === "transporter-15") return 140;
  if (mission.id === "transporter-12") return 131;
  if (mission.id === "transporter-1") return 143;
  return Math.min(mission.manifestCount, 48);
}

export const payloads: Payload[] = missions.flatMap((mission, missionIndex) => {
  const count = manifestRowCount(mission);
  return Array.from({ length: count }, (_, payloadIndex) => {
    const operator = operators[(payloadIndex + missionIndex) % operators.length];
    const isVarda = mission.id === "transporter-8" && payloadIndex === 4;
    const sequence = payloadIndex + 1;
    const deployTime = new Date(new Date(mission.launchDateUtc).getTime() + (55 + sequence * 3) * 60_000);

    return {
      id: `${mission.id}-payload-${String(sequence).padStart(3, "0")}`,
      missionId: mission.id,
      name: isVarda ? "W-Series 1 Reentry Capsule" : `${operator} ${mission.name.replace("Transporter-", "T")}-${sequence}`,
      operator: isVarda ? "Varda Space Industries" : operator,
      payloadType: isVarda ? "reentry capsule" : payloadTypes[(payloadIndex + missionIndex) % payloadTypes.length],
      deployTimeUtc: deployTime.toISOString(),
      deployOrder: sequence,
      noradId: missionIndex < 14 ? String(51000 + missionIndex * 160 + sequence) : undefined,
      intlDesignator: `20${21 + Math.floor(missionIndex / 4)}-${String.fromCharCode(65 + (missionIndex % 26))}${sequence}`,
      tleEpoch: missionIndex < 14 ? deployTime.toISOString() : undefined,
      tle1:
        missionIndex < 14
          ? `1 ${51000 + missionIndex * 160 + sequence}U 26001A   26189.50000000  .00002182  00000+0  12000-3 0  999${sequence % 10}`
          : undefined,
      tle2:
        missionIndex < 14
          ? `2 ${51000 + missionIndex * 160 + sequence}  97.${(400 + sequence).toString().padStart(3, "0")} 143.1100 0012200 091.1200 269.1400 15.12000000${sequence.toString().padStart(5, "0")}`
          : undefined,
      apogeeKm: 510 + ((payloadIndex * 13 + missionIndex * 7) % 90),
      perigeeKm: 485 + ((payloadIndex * 11 + missionIndex * 5) % 70),
      inclinationDeg: mission.orbitType.includes("Sun") ? 97.5 + ((payloadIndex % 8) * 0.04) : 45.1,
      status: isVarda ? "reentered" : missionIndex > 14 ? "catalog-pending" : payloadIndex % 17 === 0 ? "decayed" : "active",
      landingLat: isVarda ? 41.12 : undefined,
      landingLng: isVarda ? -113.52 : undefined,
      landingSiteName: isVarda ? "Utah Test and Training Range corridor" : undefined,
      sourceRefs: isVarda ? [vardaSource, spacexRideshare] : mission.sourceRefs
    };
  });
});

export const events: MissionEvent[] = missions.flatMap((mission) => {
  const launch = new Date(mission.launchDateUtc);
  const missionPayloads = payloads.filter((payload) => payload.missionId === mission.id).slice(0, 8);
  return [
    {
      id: `${mission.id}-launch`,
      missionId: mission.id,
      type: "launch",
      timestampUtc: launch.toISOString(),
      description: `${mission.name} liftoff from ${mission.launchSite}.`,
      sourceRefs: mission.sourceRefs
    },
    {
      id: `${mission.id}-stage-separation`,
      missionId: mission.id,
      type: "stage-separation",
      timestampUtc: new Date(launch.getTime() + 160_000).toISOString(),
      description: "Falcon 9 first and second stage separation.",
      sourceRefs: mission.sourceRefs
    },
    ...missionPayloads.map((payload) => ({
      id: `${payload.id}-deploy`,
      missionId: mission.id,
      payloadId: payload.id,
      type: "deployment" as const,
      timestampUtc: payload.deployTimeUtc,
      description: `${payload.name} deployment window.`,
      sourceRefs: payload.sourceRefs
    }))
  ];
});

export const vardaTrajectory = [
  { label: "Orbit checkout", lat: 6, lng: -154 },
  { label: "Deorbit burn", lat: 18, lng: -132 },
  { label: "Entry interface", lat: 31, lng: -116 },
  { label: "Recovery corridor", lat: 39, lng: -112 },
  { label: "Landing marker", lat: 41.12, lng: -113.52 }
];

export const operatorsList = [...new Set(payloads.map((payload) => payload.operator))].sort();

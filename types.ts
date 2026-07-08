export type SourceRef = {
  sourceName: string;
  url: string;
  retrievedAtUtc: string;
  confidence: number;
  notes: string;
};

export type Mission = {
  id: string;
  name: string;
  launchDateUtc: string;
  vehicle: string;
  launchSite: string;
  landingSite: string;
  orbitType: string;
  manifestCount: number;
  sourceRefs: SourceRef[];
};

export type Payload = {
  id: string;
  missionId: string;
  name: string;
  operator: string;
  payloadType: string;
  deployTimeUtc: string;
  deployOrder: number;
  noradId?: string;
  intlDesignator?: string;
  tleEpoch?: string;
  tle1?: string;
  tle2?: string;
  apogeeKm: number;
  perigeeKm: number;
  inclinationDeg: number;
  status: "active" | "decayed" | "reentered" | "catalog-pending";
  landingLat?: number;
  landingLng?: number;
  landingSiteName?: string;
  sourceRefs: SourceRef[];
};

export type MissionEvent = {
  id: string;
  missionId: string;
  payloadId?: string;
  type: "launch" | "stage-separation" | "deployment" | "reentry" | "landing";
  timestampUtc: string;
  description: string;
  sourceRefs: SourceRef[];
};

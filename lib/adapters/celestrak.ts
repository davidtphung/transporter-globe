import type { Payload } from "@/types";

export type CelestrakGpRecord = {
  noradId: string;
  objectName: string;
  epoch: string;
  tle1: string;
  tle2: string;
};

export async function fetchCelestrakGp(payloads: Payload[]): Promise<CelestrakGpRecord[]> {
  return payloads
    .filter((payload) => payload.tle1 && payload.tle2 && payload.noradId)
    .map((payload) => ({
      noradId: payload.noradId!,
      objectName: payload.name,
      epoch: payload.tleEpoch ?? new Date().toISOString(),
      tle1: payload.tle1!,
      tle2: payload.tle2!
    }));
}
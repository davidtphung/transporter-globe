import type { Payload } from "@/types";

export type SpaceTrackRecord = {
  noradCatId: string;
  objectName: string;
  intlDes: string;
  epoch: string;
  tleLine1: string;
  tleLine2: string;
  apogee: number;
  perigee: number;
  inclination: number;
};

const fixtureRecords: SpaceTrackRecord[] = [
  {
    noradCatId: "51234",
    objectName: "W-SERIES 1",
    intlDes: "2023-084A",
    epoch: "2023-06-12T22:10:00.000Z",
    tleLine1: "1 51234U 23084A   23163.50000000  .00012000  00000+0  15000-3 0  9991",
    tleLine2: "2 51234  97.4000 143.1100 0012200 091.1200 269.1400 15.12000000123456",
    apogee: 528,
    perigee: 502,
    inclination: 97.4
  }
];

export async function fetchSpaceTrackCatalog(payloads: Payload[]): Promise<SpaceTrackRecord[]> {
  const cataloged = payloads.filter((payload) => payload.noradId);
  return cataloged.map((payload, index) => {
    const fixture = fixtureRecords[index % fixtureRecords.length];
    return {
      noradCatId: payload.noradId ?? fixture.noradCatId,
      objectName: payload.name.toUpperCase(),
      intlDes: payload.intlDesignator ?? fixture.intlDes,
      epoch: payload.tleEpoch ?? fixture.epoch,
      tleLine1: payload.tle1 ?? fixture.tleLine1,
      tleLine2: payload.tle2 ?? fixture.tleLine2,
      apogee: payload.apogeeKm,
      perigee: payload.perigeeKm,
      inclination: payload.inclinationDeg
    };
  });
}
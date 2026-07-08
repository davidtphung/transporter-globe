import * as satellite from "satellite.js";
import type { Payload } from "@/types";

export type GeoPosition = {
  lat: number;
  lng: number;
};

export function propagatePayloadPosition(payload: Payload, at = new Date()): GeoPosition | null {
  if (payload.tle1 && payload.tle2) {
    const satrec = satellite.twoline2satrec(payload.tle1, payload.tle2);
    const positionAndVelocity = satellite.propagate(satrec, at);
    if (!positionAndVelocity || typeof positionAndVelocity === "boolean") return null;
    const positionEci = positionAndVelocity.position;
    if (!positionEci || typeof positionEci === "boolean") return null;
    const gmst = satellite.gstime(at);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);
    return {
      lat: satellite.degreesLat(geodetic.latitude),
      lng: satellite.degreesLong(geodetic.longitude)
    };
  }

  const offset = payload.deployOrder * 17;
  const phase = at.getTime() / 86_400_000 + offset;
  return {
    lat: Math.sin(phase * Math.PI * 2) * (payload.inclinationDeg / 3.8),
    lng: ((phase * 360) % 360) - 180
  };
}

export function propagateGroundTrack(payload: Payload, samples = 120, at = new Date()): GeoPosition[] {
  if (!payload.tle1 || !payload.tle2) {
    const offset = payload.deployOrder * 17;
    return Array.from({ length: samples }, (_, index) => {
      const lng = index * 3 - 180;
      const lat = Math.sin((index / samples) * Math.PI * 2 + offset) * (payload.inclinationDeg / 3.8);
      return { lat, lng };
    });
  }

  const satrec = satellite.twoline2satrec(payload.tle1, payload.tle2);
  const points: GeoPosition[] = [];

  for (let index = 0; index < samples; index += 1) {
    const time = new Date(at.getTime() + index * 60_000);
    const positionAndVelocity = satellite.propagate(satrec, time);
    if (!positionAndVelocity || typeof positionAndVelocity === "boolean") continue;
    const positionEci = positionAndVelocity.position;
    if (!positionEci || typeof positionEci === "boolean") continue;
    const gmst = satellite.gstime(time);
    const geodetic = satellite.eciToGeodetic(positionEci, gmst);
    points.push({
      lat: satellite.degreesLat(geodetic.latitude),
      lng: satellite.degreesLong(geodetic.longitude)
    });
  }

  return points.length > 0 ? points : [{ lat: 0, lng: 0 }];
}

export function isPayloadTracked(payload: Payload) {
  return payload.status === "active" || payload.status === "catalog-pending";
}

export function countTrackedPayloads(payloads: Payload[]) {
  return payloads.filter((payload) => isPayloadTracked(payload)).length;
}
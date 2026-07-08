import { countTrackedPayloads, isPayloadTracked } from "@/lib/orbital-propagate";
import type { Payload } from "@/types";

export function getTrackingStats(payloads: Payload[], missionId?: string) {
  const scoped = missionId ? payloads.filter((payload) => payload.missionId === missionId) : payloads;
  const tracked = countTrackedPayloads(scoped);
  const active = scoped.filter((payload) => payload.status === "active").length;
  const pending = scoped.filter((payload) => payload.status === "catalog-pending").length;
  const withTle = scoped.filter((payload) => payload.tle1 && payload.tle2).length;
  const operators = [...new Set(scoped.map((payload) => payload.operator))].sort();

  return {
    total: scoped.length,
    tracked,
    active,
    pending,
    withTle,
    operators,
    onOrbit: scoped.filter((payload) => isPayloadTracked(payload) && (payload.tle1 || payload.status === "catalog-pending")).length
  };
}

export function topOperators(payloads: Payload[], missionId: string, limit = 6) {
  const counts = new Map<string, number>();
  for (const payload of payloads) {
    if (payload.missionId !== missionId) continue;
    counts.set(payload.operator, (counts.get(payload.operator) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([operator, count]) => ({ operator, count }));
}
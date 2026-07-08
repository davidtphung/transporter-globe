import type { Mission, Payload } from "@/types";

export type SearchResult = {
  id: string;
  type: "mission" | "payload" | "operator" | "landing";
  label: string;
  subtitle: string;
  missionId?: string;
  payloadId?: string;
};

export function searchCatalog(
  missions: Mission[],
  payloads: Payload[],
  query: string,
  filters?: {
    operator?: string;
    status?: string;
    orbitType?: string;
  }
): SearchResult[] {
  const normalized = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  for (const mission of missions) {
    if (filters?.orbitType && filters.orbitType !== "all" && mission.orbitType !== filters.orbitType) {
      continue;
    }

    const missionHaystack = `${mission.name} ${mission.id} ${mission.launchSite} ${mission.orbitType}`.toLowerCase();
    if (!normalized || missionHaystack.includes(normalized)) {
      results.push({
        id: `mission-${mission.id}`,
        type: "mission",
        label: mission.name,
        subtitle: `${mission.manifestCount} payloads · ${mission.orbitType}`,
        missionId: mission.id
      });
    }
  }

  for (const payload of payloads) {
    if (filters?.operator && filters.operator !== "all" && payload.operator !== filters.operator) {
      continue;
    }
    if (filters?.status && filters.status !== "all" && payload.status !== filters.status) {
      continue;
    }

    const haystack =
      `${payload.name} ${payload.operator} ${payload.noradId ?? ""} ${payload.landingSiteName ?? ""} ${payload.intlDesignator ?? ""}`.toLowerCase();

    if (!normalized || haystack.includes(normalized)) {
      results.push({
        id: `payload-${payload.id}`,
        type: "payload",
        label: payload.name,
        subtitle: `${payload.operator} · ${payload.status}`,
        missionId: payload.missionId,
        payloadId: payload.id
      });
    }

    if (payload.landingSiteName && (!normalized || payload.landingSiteName.toLowerCase().includes(normalized))) {
      results.push({
        id: `landing-${payload.id}`,
        type: "landing",
        label: payload.landingSiteName,
        subtitle: `${payload.name} landing corridor`,
        missionId: payload.missionId,
        payloadId: payload.id
      });
    }
  }

  const operators = [...new Set(payloads.map((payload) => payload.operator))];
  for (const operator of operators) {
    if (!normalized || operator.toLowerCase().includes(normalized)) {
      results.push({
        id: `operator-${operator}`,
        type: "operator",
        label: operator,
        subtitle: "Payload operator"
      });
    }
  }

  const deduped = new Map<string, SearchResult>();
  for (const result of results) {
    deduped.set(result.id, result);
  }

  const typeRank: Record<SearchResult["type"], number> = {
    payload: 0,
    landing: 1,
    mission: 2,
    operator: 3
  };

  return [...deduped.values()]
    .sort((a, b) => {
      if (!normalized) return typeRank[a.type] - typeRank[b.type];
      const aLabel = a.label.toLowerCase().includes(normalized) ? 0 : 1;
      const bLabel = b.label.toLowerCase().includes(normalized) ? 0 : 1;
      if (aLabel !== bLabel) return aLabel - bLabel;
      return typeRank[a.type] - typeRank[b.type];
    })
    .slice(0, 50);
}
import type { Payload } from "@/types";
import type { DotTone } from "@/components/ui/StatusDot";

export function payloadDotTone(status: Payload["status"]): DotTone {
  switch (status) {
    case "active":
      return "nominal";
    case "catalog-pending":
      return "warning";
    case "decayed":
      return "muted";
    case "reentered":
      return "reentry";
    default:
      return "accent";
  }
}

export function payloadMarkerColor(status: Payload["status"], selected: boolean) {
  if (selected) return { core: "#ffffff", glow: "#a7d1f0", emissive: "#005288" };
  switch (status) {
    case "active":
      return { core: "#00c853", glow: "#00c853", emissive: "#00662a" };
    case "catalog-pending":
      return { core: "#ff9800", glow: "#ff9800", emissive: "#8a4f00" };
    case "decayed":
      return { core: "#9ca3af", glow: "#6b7280", emissive: "#374151" };
    case "reentered":
      return { core: "#f44336", glow: "#f44336", emissive: "#8b1a1a" };
    default:
      return { core: "#a7d1f0", glow: "#a7d1f0", emissive: "#003d66" };
  }
}
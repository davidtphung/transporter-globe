import { StatusDot } from "@/components/ui/StatusDot";

const items = [
  { tone: "accent" as const, label: "Orbit" },
  { tone: "selected" as const, label: "Selected" },
  { tone: "nominal" as const, label: "Active" },
  { tone: "reentry" as const, label: "Reentry" }
];

export function GlobeLegend() {
  return (
    <div className="globe-legend" aria-label="Globe legend">
      {items.map((item) => (
        <span key={item.label} className="legend-item">
          <StatusDot tone={item.tone} size="sm" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
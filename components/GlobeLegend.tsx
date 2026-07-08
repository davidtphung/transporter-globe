import { StatusDot } from "@/components/ui/StatusDot";

const items = [
  { tone: "accent" as const, label: "Orbit" },
  { tone: "selected" as const, label: "Selected" },
  { tone: "nominal" as const, label: "Active" },
  { tone: "reentry" as const, label: "Reentry" }
];

type Props = {
  compact?: boolean;
};

export function GlobeLegend({ compact = false }: Props) {
  return (
    <div className={compact ? "tray-legend" : "globe-legend"} aria-label="Globe legend">
      {items.map((item) => (
        <span key={item.label} className="legend-item">
          <StatusDot tone={item.tone} size="sm" />
          {item.label}
        </span>
      ))}
    </div>
  );
}
"use client";

import { clsx } from "clsx";
import { StatusDot, type DotTone } from "@/components/ui/StatusDot";

type Tone = "nominal" | "accent" | "warning" | "danger" | "muted";

const toneMap: Record<Tone, DotTone> = {
  nominal: "nominal",
  accent: "accent",
  warning: "warning",
  danger: "danger",
  muted: "muted"
};

type Props = {
  label: string;
  count?: number;
  tone?: Tone;
  selected?: boolean;
  onClick?: () => void;
};

export function Chip({ label, count, tone = "accent", selected, onClick }: Props) {
  return (
    <button type="button" className={clsx("chip", `chip-${tone}`, selected && "selected")} onClick={onClick} aria-pressed={selected}>
      <StatusDot tone={selected ? "selected" : toneMap[tone]} size="sm" pulse={selected} />
      <span className="chip-label">{label}</span>
      {count !== undefined ? <span className="chip-count">{count}</span> : null}
    </button>
  );
}
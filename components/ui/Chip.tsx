"use client";

import { clsx } from "clsx";

type Tone = "nominal" | "accent" | "warning" | "danger" | "muted";

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
      <span className="chip-dot" aria-hidden="true" />
      <span className="chip-label">{label}</span>
      {count !== undefined ? <span className="chip-count">{count}</span> : null}
    </button>
  );
}
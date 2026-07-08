"use client";

import { clsx } from "clsx";

export type DotTone = "accent" | "nominal" | "warning" | "danger" | "muted" | "selected" | "reentry";

type Props = {
  tone?: DotTone;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
};

export function StatusDot({ tone = "accent", size = "md", pulse = false, className }: Props) {
  return (
    <span
      className={clsx("status-dot", `status-dot-${tone}`, `status-dot-${size}`, pulse && "status-dot-pulse", className)}
      aria-hidden="true"
    />
  );
}
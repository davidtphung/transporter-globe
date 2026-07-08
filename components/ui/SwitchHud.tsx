"use client";

import type { CSSProperties } from "react";
import { clsx } from "clsx";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  color?: string;
};

export function SwitchHud({ checked, onChange, label, color = "var(--accent)" }: Props) {
  return (
    <label className="switch-hud">
      <span className="switch-hud-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={clsx("switch-hud-track", checked && "on")}
        style={{ "--switch-color": color } as CSSProperties}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-hud-thumb" />
      </button>
    </label>
  );
}
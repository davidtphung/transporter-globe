"use client";

import { clsx } from "clsx";

type Option = {
  value: string;
  label: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
};

export function SegmentedControl({ options, value, onChange, size = "md", className, ariaLabel }: Props) {
  return (
    <div
      className={clsx("seg-control", size === "sm" && "seg-control-sm", className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={clsx("seg-item", value === option.value && "active")}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
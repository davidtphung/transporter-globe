"use client";

import Link from "next/link";
import { Eye, Globe2 } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  activeRoute?: "globe" | "missions";
  manifestCount?: number;
};

export function GlobeHeader({ activeRoute = "globe", manifestCount }: Props) {
  return (
    <header className="globe-header glass" aria-label="Site header">
      <div className="globe-header-inner">
        <Link href="/" className="globe-brand">
          <Globe2 size={18} aria-hidden="true" />
          <span>Transporter Globe</span>
        </Link>

        <nav className="globe-pill-nav" aria-label="Primary">
          <Link href="/" className={clsx("pill-nav-item", activeRoute === "globe" && "active")} aria-current={activeRoute === "globe" ? "page" : undefined}>
            Globe
          </Link>
          <Link href="/missions" className={clsx("pill-nav-item", activeRoute === "missions" && "active")} aria-current={activeRoute === "missions" ? "page" : undefined}>
            Missions
          </Link>
        </nav>

        {manifestCount !== undefined ? (
          <div className="globe-header-meta">
            <Eye size={13} aria-hidden="true" />
            <span className="font-mono">{manifestCount.toLocaleString()}</span>
            <span className="meta-label">objects</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
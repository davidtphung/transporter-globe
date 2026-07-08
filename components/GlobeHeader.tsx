"use client";

import Link from "next/link";
import { Globe2, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  activeRoute?: "globe" | "missions";
};

export function GlobeHeader({ activeRoute = "globe" }: Props) {
  return (
    <header className="globe-header glass" aria-label="Site header">
      <div className="globe-header-inner">
        <Link href="/" className="globe-brand">
          <Globe2 size={22} aria-hidden="true" />
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

        <div className="globe-header-meta">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Sources refreshed Jul 8, 2026</span>
        </div>
      </div>
    </header>
  );
}
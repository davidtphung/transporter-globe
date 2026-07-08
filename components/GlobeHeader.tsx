"use client";

import Link from "next/link";
import { Globe2, Satellite } from "lucide-react";
import { clsx } from "clsx";
import { ViewCounter } from "@/components/ViewCounter";

type Props = {
  activeRoute?: "globe" | "missions";
  trackedCount?: number;
  manifestTotal?: number;
};

export function GlobeHeader({ activeRoute = "globe", trackedCount, manifestTotal }: Props) {
  return (
    <header className="globe-header glass" aria-label="Site header">
      <div className="globe-header-inner">
        <Link href="/" className="globe-brand">
          <Globe2 size={16} aria-hidden="true" />
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

        <div className="globe-header-actions">
          {typeof trackedCount === "number" ? (
            <div className="globe-header-meta" aria-label="Payloads tracked on orbit">
              <Satellite size={13} aria-hidden="true" />
              <span className="font-mono">{trackedCount.toLocaleString("en-US")}</span>
              <span className="meta-label">on orbit</span>
            </div>
          ) : null}
          {typeof manifestTotal === "number" ? (
            <div className="globe-header-meta globe-header-meta-muted" aria-label="Total manifest payloads">
              <span className="font-mono">{manifestTotal.toLocaleString("en-US")}</span>
              <span className="meta-label">manifest</span>
            </div>
          ) : null}
          <ViewCounter />
        </div>
      </div>
    </header>
  );
}
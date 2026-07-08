"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const SESSION_KEY = "transporter-globe-view-recorded";

export function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recordAndLoad() {
      try {
        const shouldIncrement = !sessionStorage.getItem(SESSION_KEY);
        const response = await fetch("/api/views", { method: shouldIncrement ? "POST" : "GET" });
        if (!response.ok) return;
        const data = (await response.json()) as { views?: number };
        if (!cancelled && typeof data.views === "number") {
          setViews(data.views);
        }
        if (shouldIncrement) {
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      } catch {
        if (!cancelled) setViews(null);
      }
    }

    recordAndLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="globe-header-meta" aria-label="Site view counter">
      <Eye size={13} aria-hidden="true" />
      <span className="font-mono">{views === null ? "—" : views.toLocaleString("en-US")}</span>
      <span className="meta-label">visits</span>
    </div>
  );
}
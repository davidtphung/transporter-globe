"use client";

import { Gauge } from "lucide-react";
import type { Payload } from "@/types";
import { vardaTrajectory } from "@/data/transporter";
import { confidenceLabel, formatDate } from "@/lib/format";

type Props = {
  payload: Payload;
  className?: string;
};

export function InspectorPanel({ payload, className }: Props) {
  return (
    <aside className={className ?? "inspector"} aria-label="Selected object inspector">
      <div className="object-title">
        <p>{payload.operator}</p>
        <h2>{payload.name}</h2>
        <span>{payload.payloadType}</span>
      </div>

      <dl className="metrics">
        <Metric label="Status" value={payload.status} />
        <Metric label="Deploy time" value={formatDate(payload.deployTimeUtc)} />
        <Metric label="NORAD" value={payload.noradId ?? "Catalog pending"} />
        <Metric label="Apogee" value={`${payload.apogeeKm} km`} />
        <Metric label="Perigee" value={`${payload.perigeeKm} km`} />
        <Metric label="Inclination" value={`${payload.inclinationDeg.toFixed(2)} deg`} />
      </dl>

      {payload.landingSiteName ? (
        <div className="trajectory">
          <div className="section-title">
            <h3>Capsule Trajectory</h3>
            <Gauge size={17} aria-hidden="true" />
          </div>
          {vardaTrajectory.map((point) => (
            <div key={point.label}>
              <span>{point.label}</span>
              <strong>
                {point.lat.toFixed(2)}, {point.lng.toFixed(2)}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      <div className="sources">
        <div className="section-title">
          <h3>Sources</h3>
          <span>{confidenceLabel(payload.sourceRefs[0]?.confidence ?? 0.5)}</span>
        </div>
        {payload.sourceRefs.map((ref) => (
          <a key={`${ref.url}-${ref.sourceName}`} href={ref.url} target="_blank" rel="noreferrer">
            <span>{ref.sourceName}</span>
            <small>{Math.round(ref.confidence * 100)}% confidence</small>
          </a>
        ))}
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
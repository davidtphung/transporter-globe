"use client";

import type { Payload } from "@/types";

type Props = {
  payload: Payload;
};

export function TrackingTray({ payload }: Props) {
  const confidence = payload.sourceRefs[0]?.confidence ?? 0.5;

  return (
    <div className="tracking-tray" aria-label="Selected object tracking">
      <div className="tracking-tray-head">
        <span className="section-label">Tracking</span>
        <span className={`status-badge status-${payload.status}`}>{payload.status}</span>
      </div>

      <div className="tracking-name font-mono">{payload.name}</div>
      <div className="tracking-meta">
        <span>NORAD {payload.noradId ?? "—"}</span>
        <span className="tracking-type">{payload.payloadType}</span>
      </div>

      <dl className="tracking-grid">
        <div>
          <dt>Apogee</dt>
          <dd className="font-mono">{payload.apogeeKm} km</dd>
        </div>
        <div>
          <dt>Inclination</dt>
          <dd className="font-mono">{payload.inclinationDeg.toFixed(1)}°</dd>
        </div>
        <div>
          <dt>Perigee</dt>
          <dd className="font-mono">{payload.perigeeKm} km</dd>
        </div>
        <div>
          <dt>Operator</dt>
          <dd>{payload.operator.split(" ")[0]}</dd>
        </div>
      </dl>

      <div className="confidence-bar">
        <div className="confidence-bar-head">
          <span>CONFIDENCE</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="confidence-bar-track">
          <div className="confidence-bar-fill" style={{ width: `${confidence * 100}%` }} />
        </div>
      </div>

      {payload.landingSiteName ? (
        <p className="tracking-landing font-mono">
          Landing · {payload.landingLat?.toFixed(2)}, {payload.landingLng?.toFixed(2)}
        </p>
      ) : null}
    </div>
  );
}
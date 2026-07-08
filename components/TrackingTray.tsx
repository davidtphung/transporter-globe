"use client";

import type { Payload } from "@/types";
import { vardaTrajectory } from "@/data/transporter";
import { confidenceLabel, formatDate } from "@/lib/format";

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

      <div className="tracking-name">{payload.name}</div>
      <div className="tracking-meta">
        <span>{payload.operator}</span>
        <span className="tracking-type">{payload.payloadType}</span>
      </div>

      <dl className="tracking-grid">
        <div>
          <dt>Deploy</dt>
          <dd>{formatDate(payload.deployTimeUtc)}</dd>
        </div>
        <div>
          <dt>NORAD</dt>
          <dd>{payload.noradId ?? "Pending"}</dd>
        </div>
        <div>
          <dt>Apogee</dt>
          <dd>{payload.apogeeKm} km</dd>
        </div>
        <div>
          <dt>Inclination</dt>
          <dd>{payload.inclinationDeg.toFixed(1)}°</dd>
        </div>
      </dl>

      <div className="confidence-bar">
        <div className="confidence-bar-head">
          <span>Source confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="confidence-bar-track">
          <div className="confidence-bar-fill" style={{ width: `${confidence * 100}%` }} />
        </div>
        <small>{confidenceLabel(confidence)}</small>
      </div>

      {payload.landingSiteName ? (
        <div className="tracking-reentry">
          <span className="section-label">Reentry corridor</span>
          <ul>
            {vardaTrajectory.map((point) => (
              <li key={point.label}>
                <span>{point.label}</span>
                <strong>
                  {point.lat.toFixed(1)}, {point.lng.toFixed(1)}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
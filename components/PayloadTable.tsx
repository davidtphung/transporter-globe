"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Payload } from "@/types";
import { confidenceLabel } from "@/lib/format";

type Props = {
  payloads: Payload[];
  selectedPayloadId: string;
  missionName: string;
  onSelect: (payloadId: string) => void;
};

export function PayloadTable({ payloads, selectedPayloadId, missionName, onSelect }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: payloads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 12
  });

  return (
    <div className="table-wrap virtual-table" ref={parentRef} role="region" aria-label={`${missionName} payload manifest`}>
      <table>
        <caption>{missionName} payload manifest with provenance-aware fields ({payloads.length} rows)</caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Payload</th>
            <th scope="col">Operator</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Orbit</th>
            <th scope="col">Confidence</th>
          </tr>
        </thead>
      </table>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const payload = payloads[virtualRow.index];
          const confidence = payload.sourceRefs[0]?.confidence ?? 0.5;
          return (
            <div
              key={payload.id}
              className={payload.id === selectedPayloadId ? "virtual-row selected-row" : "virtual-row"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <table>
                <tbody>
                  <tr>
                    <td>{payload.deployOrder}</td>
                    <td>
                      <button type="button" onClick={() => onSelect(payload.id)}>
                        {payload.name}
                      </button>
                    </td>
                    <td>{payload.operator}</td>
                    <td>{payload.payloadType}</td>
                    <td>
                      <span className={`status-pill status-${payload.status}`}>{payload.status}</span>
                    </td>
                    <td>
                      {payload.perigeeKm} x {payload.apogeeKm} km
                    </td>
                    <td title={confidenceLabel(confidence)}>{Math.round(confidence * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
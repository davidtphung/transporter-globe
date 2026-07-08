"use client";

import { useState } from "react";
import type { Payload } from "@/types";
import { PayloadTable } from "@/components/PayloadTable";

type Props = {
  missionName: string;
  missionId: string;
  payloads: Payload[];
};

export function MissionManifest({ missionName, missionId, payloads }: Props) {
  const [selectedPayloadId, setSelectedPayloadId] = useState(payloads[0]?.id ?? "");

  return (
    <section className="manifest-section tray" id="manifest" aria-label="Payload manifest">
      <div className="section-title">
        <div>
          <span className="section-label">Accessible manifest</span>
          <h2>{missionName} payloads</h2>
        </div>
        <div className="export-links">
          <a href={`/api/export?format=csv&mission=${missionId}`}>CSV</a>
          <a href={`/api/export?format=json&mission=${missionId}`}>JSON</a>
          <a href={`/?mission=${missionId}`}>Open on globe</a>
        </div>
      </div>
      <PayloadTable
        payloads={payloads}
        selectedPayloadId={selectedPayloadId}
        missionName={missionName}
        onSelect={setSelectedPayloadId}
      />
    </section>
  );
}
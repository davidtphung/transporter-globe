"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { events, missions, payloads } from "@/data/transporter";
import { GlobeHeader } from "@/components/GlobeHeader";
import { MobileDrawer } from "@/components/MobileDrawer";
import { TrackingTray } from "@/components/TrackingTray";
import { Chip } from "@/components/ui/Chip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SwitchHud } from "@/components/ui/SwitchHud";
import { useUrlState } from "@/lib/hooks/useUrlState";

const TransporterGlobe = dynamic(
  () => import("@/components/TransporterGlobe").then((mod) => mod.TransporterGlobe),
  { ssr: false, loading: () => <div className="globe-stage-loading">Loading orbital scene</div> }
);

const OPERATOR_CHIPS = ["Planet", "ICEYE", "Varda", "Exolaunch"];

function WorkspaceInner() {
  const [urlState, setUrlState] = useUrlState();
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showGroundTracks, setShowGroundTracks] = useState(true);
  const [showVarda, setShowVarda] = useState(true);
  const [playbackRate, setPlaybackRate] = useState("live");
  const [viewLens, setViewLens] = useState<"mission" | "operator" | "status">("operator");

  const selectedMission = missions.find((mission) => mission.id === urlState.missionId) ?? missions[0];

  const filteredPayloads = useMemo(() => {
    return payloads
      .filter((payload) => payload.missionId === selectedMission.id)
      .filter((payload) => urlState.operator === "all" || payload.operator === urlState.operator)
      .filter((payload) => urlState.status === "all" || payload.status === urlState.status)
      .filter((payload) => {
        const haystack = `${payload.name} ${payload.operator} ${payload.noradId ?? ""} ${payload.landingSiteName ?? ""}`.toLowerCase();
        return haystack.includes(urlState.query.toLowerCase());
      });
  }, [selectedMission.id, urlState.operator, urlState.query, urlState.status]);

  const statusCounts = useMemo(() => {
    const missionPayloads = payloads.filter((payload) => payload.missionId === selectedMission.id);
    return {
      active: missionPayloads.filter((payload) => payload.status === "active").length,
      decayed: missionPayloads.filter((payload) => payload.status === "decayed").length,
      reentered: missionPayloads.filter((payload) => payload.status === "reentered").length,
      pending: missionPayloads.filter((payload) => payload.status === "catalog-pending").length
    };
  }, [selectedMission.id]);

  const selectedPayload =
    payloads.find((payload) => payload.id === urlState.payloadId) ??
    filteredPayloads[0] ??
    payloads.find((payload) => payload.missionId === selectedMission.id) ??
    payloads[0];

  const visibleGlobePayloads =
    filteredPayloads.length > 0 ? filteredPayloads : payloads.filter((payload) => payload.missionId === selectedMission.id);

  const selectPayload = (payloadId: string) => {
    setUrlState({ payloadId });
    if (window.matchMedia("(max-width: 1180px)").matches) {
      setMobileInspectorOpen(true);
    }
  };

  const toggleStatus = (status: string) => {
    setUrlState({ status: urlState.status === status ? "all" : status });
  };

  return (
    <div className="globe-app">
      <a className="skip-link" href={`/missions/${selectedMission.id}#manifest`}>
        Skip to manifest
      </a>

      <GlobeHeader activeRoute="globe" manifestCount={selectedMission.manifestCount} />

      <section className="globe-stage" aria-label="3D orbital globe workspace">
        <div className="globe-canvas">
          <TransporterGlobe
            payloads={visibleGlobePayloads}
            selectedPayloadId={selectedPayload.id}
            onSelect={selectPayload}
            showGroundTracks={showGroundTracks}
            showOrbits={showOrbits}
            showVarda={showVarda}
          />
        </div>

        <div className="hud hud-tl" aria-label="Mission summary">
          <span className="section-label">Rideshare Mission</span>
          <h1 className="hud-title">
            {filteredPayloads.length.toLocaleString()}
            <span className="hud-title-sub"> visible</span>
          </h1>
          <p className="hud-caption">
            {selectedMission.name} · SGP4 · refreshed Jul 8, 2026
          </p>
        </div>

        <div className="hud hud-tr tray search-tray" aria-label="Search">
          <label className="search-pill">
            <Search size={14} aria-hidden="true" />
            <span className="sr-only">Search payload, operator, NORAD ID, or landing site</span>
            <input
              value={urlState.query}
              onChange={(event) => setUrlState({ query: event.target.value })}
              placeholder="Search or track a payload…"
            />
          </label>
        </div>

        <div className="tray hud-bl" aria-label="Filters and layers">
          <label className="mission-select-compact">
            <span className="section-label">Mission</span>
            <select
              value={selectedMission.id}
              onChange={(event) => setUrlState({ missionId: event.target.value, payloadId: undefined })}
              aria-label="Select Transporter mission"
            >
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.name} ({mission.manifestCount})
                </option>
              ))}
            </select>
          </label>

          <SegmentedControl
            ariaLabel="View lens"
            options={[
              { value: "operator", label: "Operator" },
              { value: "status", label: "Status" },
              { value: "mission", label: "Orbit" }
            ]}
            value={viewLens}
            onChange={(value) => setViewLens(value as typeof viewLens)}
          />

          {viewLens === "operator" ? (
            <div className="chip-grid" aria-label="Operator filters">
              {OPERATOR_CHIPS.map((operator) => {
                const fullName = operator === "Varda" ? "Varda Space Industries" : operator;
                return (
                  <Chip
                    key={operator}
                    label={operator}
                    count={payloads.filter((payload) => payload.missionId === selectedMission.id && payload.operator.includes(operator)).length}
                    selected={urlState.operator.includes(operator)}
                    onClick={() => setUrlState({ operator: urlState.operator.includes(operator) ? "all" : fullName })}
                  />
                );
              })}
            </div>
          ) : null}

          {viewLens === "status" ? (
            <div className="chip-grid" aria-label="Status filters">
              <Chip label="Active" count={statusCounts.active} tone="nominal" selected={urlState.status === "active"} onClick={() => toggleStatus("active")} />
              <Chip label="Decayed" count={statusCounts.decayed} tone="muted" selected={urlState.status === "decayed"} onClick={() => toggleStatus("decayed")} />
              <Chip label="Reentry" count={statusCounts.reentered} tone="danger" selected={urlState.status === "reentered"} onClick={() => toggleStatus("reentered")} />
              <Chip label="Pending" count={statusCounts.pending} tone="warning" selected={urlState.status === "catalog-pending"} onClick={() => toggleStatus("catalog-pending")} />
            </div>
          ) : null}

          {viewLens === "mission" ? (
            <p className="tray-note">{selectedMission.orbitType}</p>
          ) : null}

          <div className="tray-divider" />

          <div className="switch-stack" aria-label="Globe layers">
            <SwitchHud checked={showOrbits} onChange={setShowOrbits} label="Orbital paths" color="var(--accent)" />
            <SwitchHud checked={showGroundTracks} onChange={setShowGroundTracks} label="Ground tracks" color="var(--mint)" />
            <SwitchHud checked={showVarda} onChange={setShowVarda} label="Varda reentry arc" color="var(--rose)" />
          </div>

          <div className="tray-divider" />

          <div className="time-row">
            <span className="section-label">Time</span>
            <SegmentedControl
              size="sm"
              ariaLabel="Playback rate"
              options={[
                { value: "live", label: "Live" },
                { value: "60x", label: "60×" },
                { value: "600x", label: "600×" },
                { value: "1h", label: "1h/s" }
              ]}
              value={playbackRate}
              onChange={setPlaybackRate}
            />
          </div>
        </div>

        <div className="tray hud-br hud-br-desktop" aria-label="Object inspector">
          <TrackingTray payload={selectedPayload} />
        </div>
      </section>

      <MobileDrawer open={mobileInspectorOpen} title="Tracking" onClose={() => setMobileInspectorOpen(false)}>
        <TrackingTray payload={selectedPayload} />
      </MobileDrawer>
    </div>
  );
}

export function Workspace() {
  return (
    <Suspense fallback={<div className="globe-stage-loading">Loading workspace</div>}>
      <WorkspaceInner />
    </Suspense>
  );
}
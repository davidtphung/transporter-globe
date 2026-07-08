"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { missions, payloads } from "@/data/transporter";
import { GlobeHeader } from "@/components/GlobeHeader";
import { GlobeLegend } from "@/components/GlobeLegend";
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
  const [viewLens, setViewLens] = useState<"operator" | "status" | "orbit">("operator");

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

      <GlobeHeader activeRoute="globe" />

      <section className="globe-stage" aria-label="3D orbital globe workspace">
        <div className="globe-canvas" aria-hidden="true">
          <TransporterGlobe
            payloads={visibleGlobePayloads}
            selectedPayloadId={selectedPayload.id}
            onSelect={selectPayload}
            showGroundTracks={showGroundTracks}
            showOrbits={showOrbits}
            showVarda={showVarda}
          />
        </div>

        <div className="hud-grid">
          <div className="hud-tl" aria-label="Mission summary">
            <span className="section-label">Rideshare Mission</span>
            <h1 className="hud-title">
              {filteredPayloads.length.toLocaleString()}
              <span className="hud-title-sub"> visible</span>
            </h1>
            <label className="hud-mission-select">
              <span className="sr-only">Select mission</span>
              <select
                value={selectedMission.id}
                onChange={(event) => setUrlState({ missionId: event.target.value, payloadId: undefined })}
              >
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="hud-caption">SGP4 · refreshed every ~2h</p>
          </div>

          <div className="hud-tr tray search-tray" aria-label="Search">
            <label className="search-pill">
              <Search size={14} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Search payload, operator, NORAD ID, or landing site</span>
              <input
                value={urlState.query}
                onChange={(event) => setUrlState({ query: event.target.value })}
                placeholder="Search or track a payload…"
              />
            </label>
          </div>

          <div className="hud-bl tray hud-panel" aria-label="Filters and layers">
            <SegmentedControl
              ariaLabel="View lens"
              options={[
                { value: "operator", label: "Operator" },
                { value: "status", label: "Status" },
                { value: "orbit", label: "Orbit" }
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

            {viewLens === "orbit" ? <p className="tray-note">{selectedMission.orbitType}</p> : null}

            <div className="tray-divider" />

            <div className="switch-stack" aria-label="Globe layers">
              <SwitchHud checked={showOrbits} onChange={setShowOrbits} label="Orbital paths" color="var(--accent)" />
              <SwitchHud checked={showGroundTracks} onChange={setShowGroundTracks} label="Ground tracks" color="var(--mint)" />
              <SwitchHud checked={showVarda} onChange={setShowVarda} label="Reentry arc" color="var(--rose)" />
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
                  { value: "600x", label: "600×" }
                ]}
                value={playbackRate}
                onChange={setPlaybackRate}
              />
            </div>

            <GlobeLegend compact />
          </div>

          <div className="hud-br tray hud-panel hud-br-desktop" aria-label="Object inspector">
            <TrackingTray payload={selectedPayload} />
          </div>
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
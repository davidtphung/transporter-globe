"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { ArrowDownToLine, Pause, Play, Search, SkipBack, SkipForward } from "lucide-react";
import { clsx } from "clsx";
import { events, missions, payloads } from "@/data/transporter";
import { GlobeHeader } from "@/components/GlobeHeader";
import { MobileDrawer } from "@/components/MobileDrawer";
import { PayloadTable } from "@/components/PayloadTable";
import { TrackingTray } from "@/components/TrackingTray";
import { Chip } from "@/components/ui/Chip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SwitchHud } from "@/components/ui/SwitchHud";
import { useUrlState } from "@/lib/hooks/useUrlState";

const TransporterGlobe = dynamic(
  () => import("@/components/TransporterGlobe").then((mod) => mod.TransporterGlobe),
  { ssr: false, loading: () => <div className="globe-stage-loading">Loading orbital scene</div> }
);

const OPERATOR_CHIPS = ["Planet", "ICEYE", "Varda Space Industries", "Exolaunch", "D-Orbit", "Capella Space"];

function WorkspaceInner() {
  const [urlState, setUrlState] = useUrlState();
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showGroundTracks, setShowGroundTracks] = useState(true);
  const [showVarda, setShowVarda] = useState(true);
  const [playbackRate, setPlaybackRate] = useState("live");
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewLens, setViewLens] = useState<"mission" | "operator" | "status">("mission");

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
      <a className="skip-link" href="#payload-table">
        Skip to manifest table
      </a>

      <GlobeHeader activeRoute="globe" />

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
            {selectedMission.name}
            <span className="hud-title-sub">{filteredPayloads.length.toLocaleString()} visible</span>
          </h1>
          <p className="hud-caption">
            {selectedMission.orbitType} · SGP4 · {selectedMission.manifestCount} manifest objects
          </p>
          <Link className="hud-link" href={`/missions/${selectedMission.id}`}>
            Open mission profile
          </Link>
        </div>

        <div className="hud hud-tr tray search-tray" aria-label="Search">
          <label className="search-pill">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search payload, operator, NORAD ID, or landing site</span>
            <input
              value={urlState.query}
              onChange={(event) => setUrlState({ query: event.target.value })}
              placeholder="Search or track a payload…"
            />
          </label>
        </div>

        <div className="tray hud-bl" aria-label="Filters and layers">
          <SegmentedControl
            ariaLabel="View lens"
            options={[
              { value: "mission", label: "Mission" },
              { value: "operator", label: "Operator" },
              { value: "status", label: "Status" }
            ]}
            value={viewLens}
            onChange={(value) => setViewLens(value as typeof viewLens)}
          />

          {viewLens === "mission" ? (
            <div className="mission-picker" role="listbox" aria-label="Transporter missions">
              {missions.slice(-6).map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  className={clsx("mission-pill", mission.id === selectedMission.id && "active")}
                  onClick={() => setUrlState({ missionId: mission.id, payloadId: undefined })}
                  aria-selected={mission.id === selectedMission.id}
                >
                  {mission.name.replace("Transporter-", "T-")}
                </button>
              ))}
              <label className="mission-select-wrap">
                <span className="sr-only">All missions</span>
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
            </div>
          ) : null}

          {viewLens === "operator" ? (
            <div className="chip-grid" aria-label="Operator filters">
              <Chip
                label="All"
                selected={urlState.operator === "all"}
                onClick={() => setUrlState({ operator: "all" })}
              />
              {OPERATOR_CHIPS.map((operator) => (
                <Chip
                  key={operator}
                  label={operator.split(" ")[0]}
                  count={payloads.filter((payload) => payload.missionId === selectedMission.id && payload.operator === operator).length}
                  selected={urlState.operator === operator}
                  onClick={() => setUrlState({ operator: urlState.operator === operator ? "all" : operator })}
                />
              ))}
            </div>
          ) : null}

          {viewLens === "status" ? (
            <div className="chip-grid" aria-label="Status filters">
              <Chip label="Active" count={statusCounts.active} tone="nominal" selected={urlState.status === "active"} onClick={() => toggleStatus("active")} />
              <Chip label="Decayed" count={statusCounts.decayed} tone="muted" selected={urlState.status === "decayed"} onClick={() => toggleStatus("decayed")} />
              <Chip label="Reentered" count={statusCounts.reentered} tone="danger" selected={urlState.status === "reentered"} onClick={() => toggleStatus("reentered")} />
              <Chip label="Pending" count={statusCounts.pending} tone="warning" selected={urlState.status === "catalog-pending"} onClick={() => toggleStatus("catalog-pending")} />
            </div>
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
                { value: "600x", label: "600×" }
              ]}
              value={playbackRate}
              onChange={setPlaybackRate}
            />
          </div>
        </div>

        <div className="tray hud-bc playback-tray" aria-label="Playback controls">
          <button type="button" aria-label="Step back" className="icon-btn">
            <SkipBack size={16} />
          </button>
          <button type="button" aria-label={isPlaying ? "Pause timeline" : "Play timeline"} className="icon-btn play-btn" onClick={() => setIsPlaying((value) => !value)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button type="button" aria-label="Step forward" className="icon-btn">
            <SkipForward size={16} />
          </button>
          <div className="playback-scrub" aria-hidden="true">
            <div className="playback-scrub-fill" style={{ width: "38%" }} />
          </div>
          <span className="playback-label">{playbackRate === "live" ? "Live propagation" : `${playbackRate} playback`}</span>
        </div>

        <div className="tray hud-br hud-br-desktop" aria-label="Object inspector">
          <TrackingTray payload={selectedPayload} />
        </div>
      </section>

      <section className="below-fold" id="payload-table" aria-label="Payload manifest and timeline">
        <div className="below-fold-head tray">
          <div>
            <span className="section-label">Accessible manifest</span>
            <h2>{selectedMission.name} payloads</h2>
          </div>
          <div className="export-links">
            <a href={`/api/export?format=csv&mission=${selectedMission.id}`}>
              <ArrowDownToLine size={16} aria-hidden="true" /> CSV
            </a>
            <a href={`/api/export?format=json&mission=${selectedMission.id}`}>JSON</a>
          </div>
        </div>

        <PayloadTable
          payloads={filteredPayloads}
          selectedPayloadId={selectedPayload.id}
          missionName={selectedMission.name}
          onSelect={selectPayload}
        />

        <section className="tray timeline-tray" aria-label="Deployment timeline">
          <div className="section-title">
            <h3>Deploy Sequence</h3>
            <span>{events.filter((event) => event.missionId === selectedMission.id).length} events</span>
          </div>
          <ol className="timeline-compact">
            {events
              .filter((event) => event.missionId === selectedMission.id)
              .slice(0, 10)
              .map((event) => (
                <li key={event.id}>
                  <time dateTime={event.timestampUtc}>{new Date(event.timestampUtc).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</time>
                  <span>{event.description}</span>
                </li>
              ))}
          </ol>
        </section>
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
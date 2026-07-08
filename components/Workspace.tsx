"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  Clock3,
  Database,
  Filter,
  Globe2,
  Layers,
  Play,
  Search,
  ShieldCheck
} from "lucide-react";
import { clsx } from "clsx";
import { events, missions, operatorsList, payloads } from "@/data/transporter";
import { InspectorPanel } from "@/components/InspectorPanel";
import { MobileDrawer } from "@/components/MobileDrawer";
import { PayloadTable } from "@/components/PayloadTable";
import { formatDate } from "@/lib/format";
import { useUrlState } from "@/lib/hooks/useUrlState";

const TransporterGlobe = dynamic(
  () => import("@/components/TransporterGlobe").then((mod) => mod.TransporterGlobe),
  { ssr: false, loading: () => <div className="globe-loading">Loading orbital scene</div> }
);

const domain = "transporterglobe.davidtphung.com";

function WorkspaceInner() {
  const [urlState, setUrlState] = useUrlState();
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showGroundTracks, setShowGroundTracks] = useState(true);

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

  const selectedPayload =
    payloads.find((payload) => payload.id === urlState.payloadId) ??
    filteredPayloads[0] ??
    payloads.find((payload) => payload.missionId === selectedMission.id) ??
    payloads[0];

  const missionEvents = events.filter((event) => event.missionId === selectedMission.id).slice(0, 12);
  const visibleGlobePayloads =
    filteredPayloads.length > 0 ? filteredPayloads : payloads.filter((payload) => payload.missionId === selectedMission.id);

  const selectPayload = (payloadId: string) => {
    setUrlState({ payloadId });
    setMobileInspectorOpen(true);
  };

  return (
    <main className="shell">
      <a className="skip-link" href="#payload-table">
        Skip to manifest table
      </a>

      <header className="topbar" aria-label="Global controls">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Globe2 size={22} />
          </div>
          <div>
            <p>Transporter Globe</p>
            <span>{domain}</span>
          </div>
        </div>

        <label className="search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search mission, payload, operator, NORAD ID, or landing site</span>
          <input
            value={urlState.query}
            onChange={(event) => setUrlState({ query: event.target.value })}
            placeholder="Search payload, operator, NORAD"
          />
        </label>

        <div className="time-controls" aria-label="Playback controls">
          <button type="button" aria-label="Play mission timeline">
            <Play size={17} />
          </button>
          <a href="/api/export?format=csv" aria-label="Export payload table as CSV">
            <ArrowDownToLine size={17} />
          </a>
          <div className="freshness">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Sources refreshed Jul 8, 2026</span>
          </div>
        </div>
      </header>

      <nav className="primary-nav" aria-label="Primary">
        <Link href="/" aria-current="page">
          Globe
        </Link>
        <Link href="/missions">Missions</Link>
      </nav>

      <section className="workspace" aria-label="Transporter mission intelligence workspace">
        <aside className="sidebar" aria-label="Mission filters">
          <div className="panel-heading">
            <Filter size={17} aria-hidden="true" />
            <h1>Mission Index</h1>
          </div>
          <div className="mission-list" role="listbox" aria-label="Transporter missions">
            {missions.map((mission) => (
              <button
                key={mission.id}
                type="button"
                className={clsx("mission-row", mission.id === selectedMission.id && "active")}
                onClick={() => setUrlState({ missionId: mission.id, payloadId: undefined })}
                aria-selected={mission.id === selectedMission.id}
              >
                <span>{mission.name}</span>
                <small>{mission.manifestCount} objects</small>
              </button>
            ))}
          </div>

          <label className="field">
            <span>Operator</span>
            <select value={urlState.operator} onChange={(event) => setUrlState({ operator: event.target.value })}>
              <option value="all">All operators</option>
              {operatorsList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select value={urlState.status} onChange={(event) => setUrlState({ status: event.target.value })}>
              <option value="all">All status values</option>
              <option value="active">Active</option>
              <option value="catalog-pending">Catalog pending</option>
              <option value="decayed">Decayed</option>
              <option value="reentered">Reentered</option>
            </select>
          </label>

          <div className="chips" aria-label="Fast operator filters">
            {["Planet", "ICEYE", "Varda Space Industries", "Exolaunch"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setUrlState({ operator: item })}
                className={urlState.operator === item ? "selected" : ""}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="layer-toggles" aria-label="Globe layer toggles">
            <div className="panel-heading">
              <Layers size={17} aria-hidden="true" />
              <h2>Layers</h2>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={showOrbits} onChange={(event) => setShowOrbits(event.target.checked)} />
              <span>Orbit trails</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={showGroundTracks}
                onChange={(event) => setShowGroundTracks(event.target.checked)}
              />
              <span>Ground tracks</span>
            </label>
          </div>
        </aside>

        <section className="globe-zone" aria-label="3D orbital globe and mission context">
          <div className="mission-summary">
            <div>
              <p className="eyebrow">SpaceX rideshare intelligence</p>
              <h2>{selectedMission.name}</h2>
              <p>
                {selectedMission.orbitType} from {selectedMission.launchSite}
              </p>
              <Link className="mission-link" href={`/missions/${selectedMission.id}`}>
                Open mission profile
              </Link>
            </div>
            <div className="stats" aria-label="Mission summary statistics">
              <Stat icon={<Database size={17} />} label="Manifest" value={`${selectedMission.manifestCount}`} />
              <Stat icon={<Activity size={17} />} label="Visible" value={`${filteredPayloads.length}`} />
              <Stat icon={<Clock3 size={17} />} label="Launch" value={new Date(selectedMission.launchDateUtc).getUTCFullYear().toString()} />
            </div>
          </div>

          <div className="globe-card">
            <TransporterGlobe
              payloads={visibleGlobePayloads}
              selectedPayloadId={selectedPayload.id}
              onSelect={selectPayload}
              showGroundTracks={showGroundTracks}
              showOrbits={showOrbits}
            />
            <div className="legend" aria-label="Globe legend">
              <span>
                <i className="cyan" /> Orbit trails
              </span>
              <span>
                <i className="amber" /> Selected object
              </span>
              <span>
                <i className="rose" /> Varda reentry
              </span>
            </div>
          </div>

          <section className="timeline" aria-label="Deployment timeline">
            <div className="section-title">
              <h3>Deploy Sequence</h3>
              <span>{missionEvents.length} events</span>
            </div>
            <ol>
              {missionEvents.map((event) => (
                <li key={event.id}>
                  <time dateTime={event.timestampUtc}>{formatDate(event.timestampUtc)}</time>
                  <span>{event.description}</span>
                </li>
              ))}
            </ol>
          </section>
        </section>

        <InspectorPanel payload={selectedPayload} className="inspector inspector-desktop" />
      </section>

      <section className="manifest" id="payload-table" aria-label="Payload manifest">
        <div className="section-title">
          <div>
            <p className="eyebrow">Accessible manifest</p>
            <h2>Payload Table</h2>
          </div>
          <div className="export-links">
            <a href={`/api/export?format=csv&mission=${selectedMission.id}`}>Export CSV</a>
            <a href={`/api/export?format=json&mission=${selectedMission.id}`}>Export JSON</a>
          </div>
        </div>
        <PayloadTable
          payloads={filteredPayloads}
          selectedPayloadId={selectedPayload.id}
          missionName={selectedMission.name}
          onSelect={selectPayload}
        />
      </section>

      <MobileDrawer open={mobileInspectorOpen} title="Object inspector" onClose={() => setMobileInspectorOpen(false)}>
        <InspectorPanel payload={selectedPayload} className="inspector inspector-mobile" />
      </MobileDrawer>
    </main>
  );
}

export function Workspace() {
  return (
    <Suspense fallback={<div className="globe-loading">Loading workspace</div>}>
      <WorkspaceInner />
    </Suspense>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
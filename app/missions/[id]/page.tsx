import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobeHeader } from "@/components/GlobeHeader";
import { MissionManifest } from "@/components/MissionManifest";
import { events, missions, payloads, vardaTrajectory } from "@/data/transporter";
import { buildMissionSummary } from "@/lib/adapters/normalize";
import { formatDate } from "@/lib/format";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return missions.map((mission) => ({ id: mission.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const mission = missions.find((item) => item.id === id);
  return {
    title: mission?.name ?? "Mission"
  };
}

export default async function MissionPage({ params }: Props) {
  const { id } = await params;
  const mission = missions.find((item) => item.id === id);
  if (!mission) notFound();

  const missionPayloads = payloads.filter((payload) => payload.missionId === mission.id);
  const missionEvents = events.filter((event) => event.missionId === mission.id);
  const summary = buildMissionSummary(mission, missionPayloads, missionEvents);
  const vardaPayload = missionPayloads.find((payload) => payload.landingSiteName);

  return (
    <main className="shell mission-detail-page">
      <GlobeHeader activeRoute="missions" />

      <section className="mission-detail-hero">
        <p className="eyebrow">Mission profile</p>
        <h1>{mission.name}</h1>
        <p>
          {mission.vehicle} · {mission.launchSite} · {mission.orbitType}
        </p>
        <div className="stats" aria-label="Mission statistics">
          <div>
            <span>Manifest</span>
            <strong>{summary.manifestCount}</strong>
          </div>
          <div>
            <span>Operators</span>
            <strong>{summary.operatorCount}</strong>
          </div>
          <div>
            <span>Active</span>
            <strong>{summary.activeCount}</strong>
          </div>
          <div>
            <span>Confidence</span>
            <strong>{Math.round(summary.averageConfidence * 100)}%</strong>
          </div>
        </div>
      </section>

      <div className="mission-sections">
        <section className="mission-section" aria-labelledby="overview-heading">
          <h2 id="overview-heading">1. Mission overview</h2>
          <dl className="detail-grid">
            <div>
              <dt>Launch date</dt>
              <dd>
                <time dateTime={mission.launchDateUtc}>{formatDate(mission.launchDateUtc)}</time>
              </dd>
            </div>
            <div>
              <dt>Landing site</dt>
              <dd>{mission.landingSite}</dd>
            </div>
            <div>
              <dt>Deployment window</dt>
              <dd>Sequential rideshare deployment after stage separation</dd>
            </div>
            <div>
              <dt>Orbit context</dt>
              <dd>{mission.orbitType}</dd>
            </div>
          </dl>
        </section>

        <section className="mission-section" aria-labelledby="manifest-heading">
          <h2 id="manifest-heading">2. Payload manifest</h2>
          <p>{missionPayloads.length} payloads tracked with provenance references.</p>
          <Link href={`/?mission=${mission.id}`}>Inspect manifest on globe</Link>
        </section>

        <section className="mission-section" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">3. Deployment timeline</h2>
          <ol className="mission-timeline-list">
            {missionEvents.map((event) => (
              <li key={event.id}>
                <time dateTime={event.timestampUtc}>{formatDate(event.timestampUtc)}</time>
                <span>{event.description}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mission-section" aria-labelledby="orbit-heading">
          <h2 id="orbit-heading">4. Orbit and ground track</h2>
          <p>Ground tracks and orbit trails are rendered from seed TLE fixtures and CelesTrak/Space-Track enrichment.</p>
          <Link href={`/?mission=${mission.id}`}>View orbit context on globe</Link>
        </section>

        <section className="mission-section" aria-labelledby="recovery-heading">
          <h2 id="recovery-heading">5. Recovery / reentry / landing</h2>
          {vardaPayload ? (
            <ul>
              {vardaTrajectory.map((point) => (
                <li key={point.label}>
                  {point.label}: {point.lat.toFixed(2)}, {point.lng.toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recovery or reentry payloads are modeled for this mission in the current seed set.</p>
          )}
        </section>

        <section className="mission-section" aria-labelledby="telemetry-heading">
          <h2 id="telemetry-heading">6. Raw telemetry / TLE / catalog data</h2>
          <p>Catalog fields are enriched through mocked Space-Track and CelesTrak adapters with server-side caching.</p>
          <Link href={`/api/export?format=json&mission=${mission.id}`}>Download JSON export</Link>
        </section>

        <section className="mission-section" aria-labelledby="sources-heading">
          <h2 id="sources-heading">7. Sources and confidence</h2>
          <ul className="source-list">
            {mission.sourceRefs.map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noreferrer">
                  {ref.sourceName}
                </a>{" "}
                — {Math.round(ref.confidence * 100)}% ({ref.notes})
              </li>
            ))}
          </ul>
        </section>
      </div>

      <MissionManifest missionName={mission.name} missionId={mission.id} payloads={missionPayloads} />
    </main>
  );
}
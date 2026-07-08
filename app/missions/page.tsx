import Link from "next/link";
import { missions } from "@/data/transporter";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Mission Index"
};

export default function MissionsPage() {
  return (
    <main className="shell mission-index-page">
      <header className="topbar mission-index-header">
        <div className="brand">
          <div>
            <p>Transporter Globe</p>
            <span>Global mission index</span>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          <Link href="/">Globe</Link>
          <Link href="/missions" aria-current="page">
            Missions
          </Link>
        </nav>
      </header>

      <section className="mission-index" aria-label="All Transporter missions">
        <div className="section-title">
          <div>
            <p className="eyebrow">Transporter-1 through present</p>
            <h1>Mission Index</h1>
          </div>
          <span>{missions.length} launches</span>
        </div>

        <div className="mission-index-grid">
          {missions.map((mission) => (
            <article key={mission.id} className="mission-card">
              <p className="eyebrow">{mission.orbitType}</p>
              <h2>
                <Link href={`/missions/${mission.id}`}>{mission.name}</Link>
              </h2>
              <dl>
                <div>
                  <dt>Launch</dt>
                  <dd>
                    <time dateTime={mission.launchDateUtc}>{formatDate(mission.launchDateUtc)}</time>
                  </dd>
                </div>
                <div>
                  <dt>Manifest</dt>
                  <dd>{mission.manifestCount} payloads</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{mission.vehicle}</dd>
                </div>
                <div>
                  <dt>Launch site</dt>
                  <dd>{mission.launchSite}</dd>
                </div>
              </dl>
              <Link className="mission-link" href={`/?mission=${mission.id}`}>
                Open on globe
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
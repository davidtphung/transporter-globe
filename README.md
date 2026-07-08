# Transporter Globe

Production-grade SpaceX rideshare intelligence for Transporter missions, built to align with the Starlink Health globe UX while focusing on rideshare payloads, provenance, and capsule reentry tracks.

**Live site:** https://transporterglobe.davidtphung.com

## Features

- 3D orbital globe with selectable objects, orbit trails, ground tracks, and Varda reentry markers
- Sortable/filterable virtualized payload tables (81+ rows for Transporter-17)
- Mission index and per-mission profile pages
- Deployment timeline with launch, stage separation, and deployment events
- Provenance model with source, timestamp, and confidence per field
- Mock Space-Track and CelesTrak adapters with server-side orbital cache
- CSV/JSON export, global search, and URL deep-linking (`?mission=&payload=&operator=&status=&q=`)
- WCAG 2.2 AA patterns: skip links, keyboard focus, reduced motion, high contrast, touch targets

## Stack

- Next.js 15 + React 19 + TypeScript
- Three.js + React Three Fiber + satellite.js (SGP4 propagation)
- TanStack Virtual for manifest tables

## Project structure

```
app/                 Routes, API handlers, global styles
components/          Globe, workspace shell, inspector, virtual table
data/                Seed missions/manifests and deterministic fixtures
lib/adapters/        Space-Track mock, CelesTrak GP, normalization
lib/cache/           Server-side orbital enrichment cache
lib/search.ts        Mission/payload/operator/landing search
tests/               Fixture, adapter, and search tests
scripts/             Orbital refresh CLI
```

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Refresh orbital data

```bash
npm run refresh:orbital
```

Or call the API:

```bash
curl -X POST http://localhost:3000/api/refresh
```

## Add a new mission

1. Add mission metadata to `data/transporter.ts` with `sourceRefs` and confidence.
2. Extend manifest generation logic in `manifestRowCount()` if the mission needs full-table row counts.
3. Add deployment events in the `events` seed block.
4. Run `npm test` and `npm run build`.
5. Deploy; the mission index and `/missions/[id]` route are generated from seed data.

## Data provenance

Uncertain manifest fields are never guessed silently. Each mission/payload/event carries `sourceRefs` with:

- `sourceName`
- `url`
- `retrievedAtUtc`
- `confidence` (0–1)
- `notes`

Varda reentry corridor coordinates are fixture-modeled until live capsule telemetry is connected.

## Deployment

Deploy to Vercel and map custom domain `transporterglobe.davidtphung.com`.

```bash
npx vercel --prod
```

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run test` — Vitest suite
- `npm run typecheck` — TypeScript validation
- `npm run refresh:orbital` — invalidate cache and enrich payloads
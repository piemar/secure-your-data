# Architecture Boundary Separation

This document defines the intended boundary split for the codebase:

1. **Control Plane**: platform services that always run (auth, players, missions, metrics).
2. **Workshop Framework**: workshop session lifecycle and policy decisions.
3. **Sandbox Environments**: ephemeral execution runtime (tier-2 sandbox DB, execution verification, terminal shell runtime).

## Current server boundary map

### Control Plane
- `server/src/routes/auth.ts`
- `server/src/routes/players.ts`
- `server/src/routes/missions.ts`
- `server/src/routes/metrics.ts`
- `server/src/middleware/*`
- `server/src/config/db.ts`
- `server/src/config/collections.ts`

### Workshop Framework
- `server/src/routes/workshops.ts`
- `server/src/workshop/policy.ts`
- `server/src/workshop/session.ts`

### Sandbox Environments
- `server/src/services/sandbox.ts`
- `server/src/services/code-executor.ts`
- `server/src/services/code-parser.ts`
- `server/src/services/simulation.ts`
- `server/src/services/atlas-proxy.ts`
- `server/src/sandbox/verification/*`
- `server/src/sandbox/missions/*/verification.ts`
- `server/src/routes/terminal.ts`
- `server/src/services/terminal-shell-session.ts`

## Mission artifact separation pattern

Naming convention:

- Mission folders use normalized mission title: lowercase + underscore (example: `crud_boot_camp`, `the_phantom_index`).

Server-side mission verification checks are split by mission under `server/src/content/missions/<mission_slug>/verification.ts`:

- `server/src/content/missions/crud_boot_camp/verification.ts`
- `server/src/content/missions/the_phantom_index/verification.ts`
- `server/src/content/missions/the_aggregation_heist/verification.ts`
- `server/src/content/missions/the_schema_saboteur/verification.ts`
- `server/src/content/missions/rich_query_recon/verification.ts`
- `server/src/content/missions/analytics_extraction/verification.ts`
- `server/src/content/missions/geospatial_pursuit/verification.ts`
- `server/src/content/missions/graph_infiltration/verification.ts`
- `server/src/content/missions/change_stream_stakeout/verification.ts`
- `server/src/content/missions/transaction_lockout/verification.ts`
- `server/src/content/missions/time_series_infiltration/verification.ts`
- `server/src/content/missions/schema_evolution/verification.ts`

Aggregated through:

- `server/src/sandbox/verification/index.ts`

Backward-compatible import surface retained at:

- `server/src/config/verification-checks.ts`

Server-side mission seed data is also split by mission under `server/src/content/missions/<mission_slug>/seed-data.ts`:

- `server/src/content/missions/crud_boot_camp/seed-data.ts`
- `server/src/content/missions/the_phantom_index/seed-data.ts`
- `server/src/content/missions/the_aggregation_heist/seed-data.ts`
- `server/src/content/missions/the_schema_saboteur/seed-data.ts`
- `server/src/content/missions/rich_query_recon/seed-data.ts`
- `server/src/content/missions/analytics_extraction/seed-data.ts`
- `server/src/content/missions/geospatial_pursuit/seed-data.ts`
- `server/src/content/missions/graph_infiltration/seed-data.ts`
- `server/src/content/missions/change_stream_stakeout/seed-data.ts`
- `server/src/content/missions/transaction_lockout/seed-data.ts`
- `server/src/content/missions/time_series_infiltration/seed-data.ts`
- `server/src/content/missions/schema_evolution/seed-data.ts`

Aggregated through:

- `server/src/sandbox/seeding/index.ts`

Backward-compatible import surface retained at:

- `server/src/config/seed-data.ts`

Sandbox runtime boundary path added:

- `server/src/sandbox/runtime/sandbox.ts`
- `server/src/sandbox/runtime/coordinator.ts`

Entry points now import sandbox runtime/workshop boundary modules:

- `server/src/routes/execute.ts` imports `server/src/workshop/*` and `server/src/sandbox/runtime/*`
- `server/src/index.ts` imports sandbox init from `server/src/sandbox/runtime/sandbox.ts`

Frontend mission/quest source of truth is now physically split by artifact under `src/content/*`:

- `src/content/missions/<mission_slug>/mission.ts`
- `src/content/missions/<mission_slug>/skeleton.ts`
- `src/content/missions/<mission_slug>/validation.ts`
- `src/content/quests/<quest_slug>/quest.ts`

Aggregators remain at:

- `src/content/missions/index.ts`
- `src/content/missions/mission.ts`
- `src/content/missions/skeletons.ts`
- `src/content/missions/validation.ts`
- `src/content/quests/index.ts`
- `src/content/quests/quest.ts`

Backward-compatible import surface retained at:

- `src/lib/game-data.ts`
- `src/lib/mission-skeletons.ts`
- `src/lib/mission-validations.ts`

## Next migration steps

1. Move implementation ownership of `server/src/services/sandbox.ts` and `server/src/services/sandbox-coordinator.ts` into `server/src/sandbox/runtime/*` (current runtime files are compatibility facades).
2. (Done) Mirror mission artifact separation on frontend source-of-truth into `src/content/missions/<mission_slug>/*` and `src/content/quests/<quest_slug>/*`.

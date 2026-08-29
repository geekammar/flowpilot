# FlowPilot — Pilot Distribution Audit

> Pre-change audit of the deployment / distribution / demo / release workflows,
> performed before implementing the Pilot Distribution System (Ops 06).
> Scope: ops only — no product, schema, or architecture changes.
> Audit date: 2026-08-29 · Audited by: Ops 06 (Pilot Distribution pass).

## Method

Reviewed every distribution-relevant surface: `package.json` scripts,
`scripts/{deploy,vercel-check,doctor,verify,release.*}`, `vercel.json`,
`src/app/api/health/route.ts` + `src/proxy.ts`, `prisma/seed.ts` +
`prisma/demo-data.ts`, `scripts/dev*.sh` (DEMO_MODE), the ops documentation set
(`VERCEL_DEPLOYMENT.md`, `VERCEL_AUDIT.md`, `ENVIRONMENT_VARIABLES.md`,
`DEPLOYMENT_REPORT.md`, `DEMO_GUIDE.md`, `DEMO_SCRIPT.md`,
`RELEASE_PROCESS.md`, `GITHUB_WORKFLOW.md`), and the live state of this
machine (git, gh auth, Vercel CLI, env files, `.vercel` link).

## Current State

| Area                  | State | What exists today                                                                                                                                                                                                                                                                                |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub integration    | ✅    | `gh` authenticated; private repo model + gated `pnpm release` (gh-auth → doctor → verify → security) documented and tested; repo not yet pushed (v0.1.0 prepared, unpublished)                                                                                                                   |
| Vercel integration    | ⚠️    | `vercel.json` (buildCommand + SW cache headers), `postinstall: prisma generate`, gated deploy commands exist (`deploy:check/preview/vercel`); **Vercel CLI not installed** on this machine (dlx fallback works), **not logged in**, **project not linked** (`.vercel/` absent)                   |
| Deployment process    | ⚠️    | Env gate → build gate → `vercel deploy`; failures explained, but no pre-flight for Vercel auth/link, and the deployment URL is not captured/parsed — the user must copy it from CLI output                                                                                                       |
| Environment variables | ✅    | `pnpm vercel:check` validates all 4 required vars with per-var fixes; fail-fast Zod validation at build; docs complete. Device env still has placeholder `DATABASE_URL` (user action)                                                                                                            |
| Demo environment      | ⚠️    | Rich Egyptian demo dataset (36 customers / 22 conversations / 37 appointments) + demo credentials, but `DEMO_MODE=true` only affects **dev launchers**; nothing verifies or seeds demo data as part of a **deployment** — deploying against an unseeded DB yields empty dashboards (failed demo) |
| Seed process          | ✅    | `pnpm db:seed` idempotent, demo-business-scoped wipe, deterministic; timestamps relative to seed time (re-seed needed for fresh "today" activity)                                                                                                                                                |
| Health monitoring     | ⚠️    | `/api/health` returns status/version/environment only — no timestamp, no database reachability, no deployment-readiness signal                                                                                                                                                                   |
| Release workflow      | ✅    | `pnpm release` gates + tag + private repo + GitHub Release; versioning rules documented                                                                                                                                                                                                          |
| Docs                  | ✅    | Extensive (16 ops docs) but distribution-oriented docs are spread across multiple files; no one-page quick-deploy; no client-facing demo package doc                                                                                                                                             |

## Bottlenecks (ordered by demo-blocking impact)

| #   | Bottleneck                                                                                                                                                                                                                                                  | Impact |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | **No single `pnpm deploy` entry point.** Production deploy is `deploy:vercel` (undiscoverable name); running `pnpm deploy` today hits pnpm's built-in workspace command and errors (`ERR_PNPM_NOTHING_TO_DEPLOY`)                                           | High   |
| 2   | **Demo data is not part of the deploy path.** `DEMO_MODE` is dev-launcher-only; a first deploy against an empty Neon DB = login works but every screen is empty — the worst possible demo                                                                   | High   |
| 3   | **No deployment URL in output.** The URL must be copied manually from Vercel CLI output; nothing re-states it with validation steps (`/api/health`, demo logins)                                                                                            | Medium |
| 4   | **No Vercel auth/link pre-flight.** An unauthenticated or unlinked machine fails deep inside `vercel deploy` with CLI noise instead of "run `vercel login`" instructions                                                                                    | Medium |
| 5   | **`deploy:check` doesn't check the database.** Env shape + build are validated, but DB reachability, applied schema, Prisma client generation, and auth configuration are not part of the deploy gate (they live in `doctor`, which is not deploy-oriented) | Medium |
| 6   | **Health endpoint is liveness-only.** Cannot answer "is this deployment demo-ready?" (DB reachable? env present?) before a prospect opens the link                                                                                                          | Low    |
| 7   | **Preview vs production differences are tribal knowledge.** Preview `*.vercel.app` URLs have broken auth (trustedOrigins covers the production URL only); nothing in the deploy flow warns about this                                                       | Low    |

## Deployment Friction

1. Four env vars must be set in the Vercel console (Production + Preview)
   **before** the first build or the build fails mid-way (fail-fast `env.ts`).
2. Schema must be applied to Neon from desktop/CI (`pnpm db:deploy`) — the
   Prisma schema engine cannot run on Termux.
3. First-time setup is multi-toolflow: Neon console → GitHub push → Vercel
   import → env vars → deploy. Every step is documented but split across
   `VERCEL_DEPLOYMENT.md` (155 lines), `RELEASE_PROCESS.md`, and
   `ENVIRONMENT_VARIABLES.md` — no single fast path.
4. Deployment outcome (the URL) is not returned in a predictable, parseable
   way by the existing commands.

## Distribution Friction

1. **No prospect-facing demo package.** DEMO_GUIDE/DEMO_SCRIPT target the
   operator; there is no "share the URL + credentials + what-to-show" document
   designed to be handed to (or read aloud for) a prospect meeting.
2. Demo credentials exist only after seeding; nothing in the deploy flow
   guarantees they exist on the deployed database.
3. Demo data ages (timestamps drift from "today"); re-seeding before each demo
   is a manual, documented-only step.
4. The production URL is only known after the first deploy — but
   `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` must equal it, forcing a
   configure-deploy-reconfigure-redeploy loop for first-time setups.

## What This Pass Adds (preview of the fix)

| Friction               | Fix (Ops 06)                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single entry point     | `pnpm deploy` / `pnpm deploy:production` / `pnpm deploy:preview`                                                                                  |
| Deployment readiness   | `scripts/pre-deploy.mjs` (`pnpm deploy:check`): env, DB connection + schema, Prisma generation, auth config, build, demo data → READY / NOT READY |
| Demo-ready deployments | `DEMO_MODE=true` now also gates **deployments**: pre-deploy seeds + verifies the demo dataset against the target DB                               |
| URL & validation       | Deploy commands capture the deployment URL from CLI output and print it with validation steps                                                     |
| Auth/link pre-flight   | `vercel whoami` + `.vercel/project.json` checks with exact instructions — never fails silently                                                    |
| Health monitoring      | `/api/health` returns status, version, environment, timestamp, DB reachability, deployment readiness                                              |
| Distribution           | `docs/VERCEL_QUICK_DEPLOY.md` (5-minute path), `docs/CLIENT_DEMO.md` (prospect-facing demo package)                                               |

## Baseline Readiness Scores

| Area                        | Before Ops 06 | Target after Ops 06 |
| --------------------------- | :-----------: | :-----------------: |
| Deploy command ergonomics   |     5/10      |        9/10         |
| Pre-deploy validation       |     6/10      |        9/10         |
| Demo deployment readiness   |     4/10      |        9/10         |
| Deployment observability    |     6/10      |        9/10         |
| Distribution / sharing docs |     3/10      |        9/10         |
| **Overall**                 |  **4.8/10**   |      **9/10**       |

The remaining gap to 10/10 is user actions, not code: `vercel login`, project
link/import, real `DATABASE_URL`, and `pnpm db:deploy` against Neon
(steps in `VERCEL_QUICK_DEPLOY.md`).

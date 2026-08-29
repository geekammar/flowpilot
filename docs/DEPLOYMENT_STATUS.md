# FlowPilot — Deployment Status

> Deployment/distribution readiness snapshot after the Pilot Distribution
> System pass (Ops 06, 2026-08-29). Authoritative ledger: `BUILD_STATE.md`.
> Live gate: run `pnpm deploy:check` — this page records what was verified.

## Deployment Readiness

**READY ✅ (code side — all gates implemented and verified).**

| Capability                  | Command / File                                         | Status                                                                               |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Pre-deploy readiness gate   | `pnpm deploy:check` (`scripts/pre-deploy.mjs`)         | ✅ env, database, Prisma, auth config, build, demo data → READY/NOT READY with fixes |
| Environment validation      | `pnpm vercel:check`                                    | ✅ all 4 required variables, per-variable fixes                                      |
| Prisma generation in CI     | `postinstall` + `vercel.json` buildCommand             | ✅ double-covered                                                                    |
| Database + schema check     | pre-deploy step 3 (SELECT 1 + required tables)         | ✅ classified errors (DNS/timeout/auth/TLS)                                          |
| Health / readiness endpoint | `/api/health`                                          | ✅ status, version, environment, timestamp, DB reachability, deployment readiness    |
| Deploy automation           | `pnpm deploy` / `deploy:production` / `deploy:preview` | ✅ gated, auth+link pre-flight, URL captured                                         |

## Preview Readiness

**READY ✅** — `pnpm deploy:preview` runs the same full gate, then creates a
preview deployment and prints its URL.

| Aspect           | Preview                                                                   | Production                               |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Command          | `pnpm deploy:preview`                                                     | `pnpm deploy` / `pnpm deploy:production` |
| URL              | `https://<hash>.<app>.vercel.app`                                         | `https://<app>.vercel.app`               |
| **Auth (login)** | ⚠️ may not work — preview origins are not in Better Auth `trustedOrigins` | ✅ works (this is the demo URL)          |
| Best for         | internal smoke tests, visual checks                                       | **prospect demos, sharing, pilots**      |

Rule of thumb: **demo only ever from the production URL.**

## Production Readiness

**READY ✅ (code) — 3 user actions remain (consoles, not code):**

1. `vercel login` (+ `vercel link` or GitHub import) — the deploy command
   detects this and prints the exact instructions instead of failing silently.
2. The four environment variables set in **Vercel → Project → Settings →
   Environment Variables** for **Production and Preview** (values:
   `ENVIRONMENT_VARIABLES.md`).
3. Schema applied to Neon: `pnpm db:deploy` (from desktop/CI — the Prisma
   schema engine cannot run on Termux).

Fast path for all three: `docs/VERCEL_QUICK_DEPLOY.md` (< 5 minutes).

## Demo Readiness

**READY ✅ (dataset verified; seeding automated into the deploy path).**

| Requirement (DEMO_MODE=true) | How it is guaranteed                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| Demo users exist             | pre-deploy gate runs `pnpm db:seed` (idempotent) + verifies 2 accounts    |
| Demo business exists         | verified by stable business ID (عيادة الابتسامة)                          |
| Demo appointments exist      | verified (37 appointments incl. 4 today)                                  |
| Demo conversations exist     | verified (22 conversations, ~11 active today)                             |
| No empty dashboards          | counts checked in the gate; `GettingStarted` card covers true-zero states |

`DEMO_MODE=true` in `.env.local` → dev launchers **and** every
`pnpm deploy:*` command re-seed first, so "today" numbers are always fresh.
Without it, the gate reminds you how to enable it (informational, not
blocking). Demo package for prospects: `docs/CLIENT_DEMO.md`.

## Known Issues

| #   | Issue                                                                                                      | Severity | Handling                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| 1   | Device env has placeholder `DATABASE_URL` → `pnpm deploy:check` correctly reports NOT READY locally        | Info     | User action: set the real Neon string in `.env.local`                        |
| 2   | Vercel CLI not installed / not logged in on this machine → deploy aborts at gate 2 with login instructions | Info     | User action: `pnpm dlx vercel@latest login` (one-time)                       |
| 3   | First deploy URL chicken-and-egg (URLs must equal the final domain)                                        | Low      | Documented in `VERCEL_QUICK_DEPLOY.md` (pick the name first / redeploy once) |
| 4   | Auth on `*.vercel.app` preview URLs (trustedOrigins)                                                       | Medium   | Demos run on the production URL only — enforced by docs + deploy output      |
| 5   | Neon idle cold start (~1s first request)                                                                   | Low      | Acceptable at pilot scale; `/api/health` reveals it before a demo            |
| 6   | Prisma migrations cannot run on Termux                                                                     | Low      | `pnpm db:deploy` from desktop/CI; pre-deploy checks the schema remotely      |
| 7   | Health DB probe adds ≤ 3s (race-timeout) on cold/suspended DBs                                             | Low      | Liveness (`status`) unaffected; readiness reports `unreachable` honestly     |

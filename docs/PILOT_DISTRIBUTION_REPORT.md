# FlowPilot — Pilot Distribution Report (Prompt 10.5F / Ops 06)

> Final report of the Pilot Distribution System pass, 2026-08-29.
> Goal achieved state: **clone → configure env → `pnpm deploy` → shareable,
> demo-ready URL** — no project documentation required to get there.
> Audit: `PILOT_DISTRIBUTION_AUDIT.md` · Snapshot: `DEPLOYMENT_STATUS.md`.

## Created Files

| File                                | Purpose                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `scripts/pre-deploy.mjs`            | Pre-deploy readiness gate (`pnpm deploy:check`) → READY / NOT READY with fixes           |
| `docs/PILOT_DISTRIBUTION_AUDIT.md`  | Deployment workflow audit: current state, bottlenecks, friction, baseline scores         |
| `docs/VERCEL_QUICK_DEPLOY.md`       | One-page deploy guide (< 5 minutes: prerequisites → command → env → verification)        |
| `docs/CLIENT_DEMO.md`               | Prospect-facing demo package: URL, credentials, walkthrough, Q&A, sales flow, next steps |
| `docs/DEPLOYMENT_STATUS.md`         | Deployment / preview / production / demo readiness + known issues                        |
| `docs/PILOT_DISTRIBUTION_REPORT.md` | This report                                                                              |

## Modified Files

| File                            | Change                                                                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/deploy.mjs`            | Rewritten: `pnpm deploy` default mode, `deploy:production`, URL capture from live Vercel output, `whoami` auth pre-flight, link pre-flight, login-failure detection, demo-aware success output |
| `src/app/api/health/route.ts`   | v2: timestamp, `deploymentReady`, `database` probe (3s race-timeout via the app's own Prisma client), `missingEnvVars`                                                                         |
| `package.json`                  | Scripts: `deploy`, `deploy:production`; `deploy:check` → `pre-deploy.mjs`                                                                                                                      |
| `README.md`                     | Deploy commands table, quick-deploy + demo-package pointers, DEMO_MODE deploy note                                                                                                             |
| `docs/VERCEL_DEPLOYMENT.md`     | New commands, CLI path, health v2 JSON, `deploymentReady:false` troubleshooting                                                                                                                |
| `docs/ENVIRONMENT_VARIABLES.md` | `DEMO_MODE` deploy-time semantics, health endpoint fields                                                                                                                                      |
| `docs/QUALITY_CHECKS.md`        | Deploy commands added to the command map                                                                                                                                                       |
| `docs/DEMO_GUIDE.md`            | Deploy-time seeding note                                                                                                                                                                       |
| `docs/BUILD_STATE.md`           | Ops 06 section + current-state summary (ledger)                                                                                                                                                |
| `docs/CURRENT_STATE.md`         | Pilot Distribution readiness bullet                                                                                                                                                            |
| `docs/PROJECT_STATUS.md`        | Ops 06 in ops list, deployment status tables, release blocker update                                                                                                                           |
| `docs/DECISIONS.md`             | Decision #21 (append-only)                                                                                                                                                                     |

No business logic, database schema, UI, architecture, or dependency changes.

## New Commands

| Command                  | What it does                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm deploy`            | Full gate (env → DB → Prisma → auth config → demo data → build) → Vercel auth/link pre-flight → **production** deploy → prints the deployment URL + validation steps |
| `pnpm deploy:production` | Explicit alias of `pnpm deploy`                                                                                                                                      |
| `pnpm deploy:preview`    | Same gate → **preview** deploy → URL (warns that auth needs the production URL)                                                                                      |
| `pnpm deploy:check`      | Readiness gate only → **READY / NOT READY** with actionable fixes (`-- --fast` skips the build)                                                                      |

(`pnpm deploy:vercel` kept as a legacy alias; `pnpm vercel:check` unchanged as
the env validator reused by the gate.)

## Deployment Workflow (as of this pass)

```
pnpm deploy
 ├─ gate 1: scripts/pre-deploy.mjs
 │   1. environment variables        (vercel-check.mjs — 4 required vars)
 │   2. prisma generation            (auto-generates if missing)
 │   3. database                     (SELECT 1 + schema-applied check, classified errors)
 │   4. auth configuration           (secret ≥32, URLs valid, origins consistent)
 │   5. deployment configuration     (vercel.json, postinstall, link state)
 │   6. demo data (DEMO_MODE=true)   (re-seed + verify counts → no empty dashboards)
 │   7. build validation             (typecheck + next build)
 ├─ gate 2: Vercel CLI               (auth via whoami — instructions if logged out; link check)
 └─ deploy                           (vercel deploy [--prod], live output, URL captured)
      → "Deployment URL: https://…vercel.app" + validate /api/health + demo logins
```

Every failure explains its fix; authentication requirements are surfaced as
instructions, never silent failures.

## Distribution Workflow

1. **Deploy once:** `docs/VERCEL_QUICK_DEPLOY.md` (< 5 min, one command).
2. **Check before sharing:** `<url>/api/health` → `"deploymentReady": true`
   (DB reachable, env complete — false means fix first, usually a suspended
   Neon project).
3. **Share:** send the URL + credentials from `docs/CLIENT_DEMO.md` (or demo
   it live using its 5-minute walkthrough and Q&A table).
4. **Redeploy loop:** change → `pnpm deploy` (gates re-run; demo data
   re-seeded when `DEMO_MODE=true`).

## Demo Workflow

- `DEMO_MODE=true` in `.env.local` now covers **dev launchers AND deploys**:
  every `pnpm deploy:*` re-seeds the Egyptian demo dataset (idempotent,
  demo-business-scoped) and verifies counts (business, 2 users, customers,
  conversations, appointments) — deployed demos are never empty and "today"
  numbers are always fresh.
- `/api/health` is the 10-second pre-demo check (DB up → demo will work).
- Prospect-facing package: `docs/CLIENT_DEMO.md` (URL, credentials,
  walkthrough, what to show first, 8 objection answers, sales flow, next
  steps). Operator practice docs: `DEMO_GUIDE.md` + `DEMO_SCRIPT.md`.

## Verification (on-device, Termux)

| Check                                                                                                                                      | Result |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `node --check` on `pre-deploy.mjs` + `deploy.mjs` (before/after formatting)                                                                | ✅     |
| `pnpm deploy:check` on placeholder env → NOT READY with fixes; early-exit                                                                  | ✅     |
| `pnpm deploy:check --fast` with valid-shaped env → 15 checks, DB unreachable classified (DNS fix), exit 1                                  | ✅     |
| `pnpm deploy` / `deploy:preview` abort at gate with next actions; usage message on bad mode                                                | ✅     |
| `pnpm deploy` runs as a script (shadows pnpm's built-in `deploy`)                                                                          | ✅     |
| URL parser unit tests (production/preview/fallback/no-URL) + login-detection tests vs real CLI output                                      | ✅ 9/9 |
| `pnpm dlx vercel@latest whoami` live → exit 1 + "Logged out" (auth pre-flight double-covered)                                              | ✅     |
| `pnpm verify` (lint / typecheck / format / build --webpack)                                                                                | ✅     |
| `next start` + `/api/health` → full v2 JSON, HTTP 200, `deploymentReady:false` + `database:"unreachable"` (correct for the placeholder DB) | ✅     |
| Signed-out `/` still redirects to `/sign-in` (proxy untouched)                                                                             | ✅     |
| `pnpm security`                                                                                                                            | ✅     |

## Remaining Manual Steps (user actions, by design)

1. **`vercel login`** (+ `vercel link` once, or GitHub import) — the deploy
   command prints these exact instructions when needed.
2. **Real `DATABASE_URL`** in `.env.local` (Neon console) — the readiness gate
   blocks without it.
3. **`pnpm db:deploy`** against Neon from desktop/CI (Termux cannot run the
   Prisma schema engine) — the gate checks the schema remotely and says this
   when tables are missing.
4. **Four env vars in Vercel project settings** (Production + Preview) before
   the first Vercel-side build.
5. First-deploy URL chicken-and-egg: set `BETTER_AUTH_URL` /
   `NEXT_PUBLIC_APP_URL` to the intended `https://<name>.vercel.app` before
   deploying (two resolution paths documented in `VERCEL_QUICK_DEPLOY.md`).

## Recommended Next Actions

1. **Operator (≤ 10 min):** set a real `DATABASE_URL` (+ `DEMO_MODE=true`) →
   `pnpm deploy:check` → READY → `pnpm dlx vercel@latest login` + `link` →
   `pnpm deploy` → share the URL using `docs/CLIENT_DEMO.md`.
2. **Operator:** publish v0.1.0 (`pnpm release` — `gh` already authenticated;
   only the `DATABASE_URL` doctor gate remains) so the GitHub→Vercel
   auto-redeploy loop is active.
3. **Product (next agent):** ~~resume Prompt 09 (Arabic sign-up flow)~~
   SUPERSEDED (Prompt 09 auth alignment): next is the invitation/account
   lifecycle foundation, then customers → staff → services → settings →
   team — see `BUILD_STATE.md → Next Step`.
4. **Later (Spec B era, needs a decision):** per-prospect preview databases
   via Neon branching; CI pipeline running the encoded gate.

# FlowPilot — Project Status

> Point-in-time status snapshot. Date: 2026-09-02 (after PROMPT-03 —
> Invitation Creation Foundation).
> Authoritative ledger: `BUILD_STATE.md`. Evergreen summary: `CURRENT_STATE.md`.

## Current Spec

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`).

Goal: a pilot-ready generic engine that converts WhatsApp conversations into
confirmed appointments, sufficient to run paid pilots and collect evidence.

## Current Status (Spec A progress)

| Area                                                     | State                                  |
| -------------------------------------------------------- | -------------------------------------- |
| Foundation (stack, auth, env, tooling)                   | ✅ complete                            |
| Design system, RTL, responsive, PWA                      | ✅ complete                            |
| Database layer (schema, repos, seed)                     | ✅ complete                            |
| Onboarding wizard                                        | ✅ complete                            |
| Business admin dashboard                                 | ✅ complete                            |
| Conversations inbox + detail                             | ✅ complete                            |
| Appointments agenda/detail/create                        | ✅ complete                            |
| UX/A11y/PWA polish pass                                  | ✅ complete                            |
| Auth architecture alignment (docs)                       | ✅ complete (Prompt 09, DECISIONS #22) |
| Invitation data model (schema/migration/repo/validation) | ✅ complete (Prompt 10)                |
| Invitation creation foundation (service layer)           | ✅ complete (PROMPT-03)                |
| Invitation acceptance / account activation               | ⏳ not started (next)                  |
| Customers directory                                      | ⏳ placeholder                         |
| Services management                                      | ⏳ placeholder                         |
| Business settings / knowledge screens                    | ⏳ placeholder                         |
| Team management (admin)                                  | ⏳ placeholder                         |
| Staff area                                               | ⏳ placeholder                         |

Auth note (Prompts 09–10 + PROMPT-03): account creation for the pilot
stage is invitation-first — the Platform Operator provisions the Business
and invites the initial ADMIN; public self-sign-up is NOT the primary
pilot flow (future self-serve mode remains architecturally possible).
The `/sign-up` placeholder page remains in code but is no longer a
planned deliverable. The Invitation DATA foundation (model, migration,
repository, validation) AND the creation foundation (secure token
generation with hash-only persistence, 7-day expiry, duplicate-open
prevention, business-scoped create/list/revoke service operations) are
implemented; acceptance, activation, token delivery, and all invitation
UI are not yet implemented.

Ops (non-product) passes complete: Ops 01 run/reproducibility, Ops 02 health
verification + commit safety, Ops 03 release engineering, Ops 04 Vercel
deployment readiness, Ops 05 demo readiness, Ops 06 pilot distribution
system (`pnpm deploy` toolchain + distribution docs).

## Demo Readiness Status

**READY ✅ (Ops 05).** The app feels alive immediately after login:

| Capability                                          | Delivered as                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Egyptian demo business (عيادة الابتسامة، كفر الشيخ) | `prisma/demo-data.ts` (pure, deterministic)                                                                          |
| 36 customers / 22 conversations / 37 appointments   | all statuses covered, per-day conflict-free, 4 today                                                                 |
| Realistic Egyptian-Arabic WhatsApp threads          | booking, rescheduling, emergency, complaint, FAQ scenarios (all 4 conversation statuses)                             |
| Dashboard alive after login                         | ~11 conversations today, 5 NEED_HUMAN, 4 appointments today                                                          |
| No blank screens                                    | `GettingStarted` onboarding card at zero activity + existing empty states                                            |
| Auto-seed for demos                                 | `DEMO_MODE=true` in `.env.local` → dev launchers **and** every `pnpm deploy:*` re-seed (verified counts in the gate) |
| Demo & sales documentation                          | `DEMO_GUIDE.md` (logins/scenarios), `DEMO_SCRIPT.md` (5-min flow), `CLIENT_DEMO.md` (prospect package)               |

Demo logins: `admin@flowpilot.app` / `Admin@1234` and
`staff@flowpilot.app` / `Staff@1234` (demo databases only).

## Deployment Readiness Status

**Code side: READY ✅ (Ops 04 + Ops 06).** What exists:

| Capability                    | Delivered as                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Prisma client generated in CI | `postinstall: prisma generate` + `vercel.json` buildCommand                                                    |
| Environment validation        | `pnpm vercel:check` (same precedence as the app; clear per-var fixes)                                          |
| Pre-deploy readiness gate     | `pnpm deploy:check` → env + DB connection + schema + Prisma + auth + demo data + build → READY / NOT READY     |
| Gated deploy commands         | `pnpm deploy` / `deploy:production` / `deploy:preview` (URL captured + printed)                                |
| Vercel auth/link pre-flight   | `vercel whoami` + `.vercel/project.json` checks with exact instructions                                        |
| Demo-ready deployments        | `DEMO_MODE=true` seeds + verifies demo data inside every deploy gate                                           |
| Health/readiness endpoint     | `/api/health` → status, version, environment, timestamp, DB, deploymentReady                                   |
| PWA cache safety              | no-cache headers for `/sw.js`, `/offline.html` in `vercel.json`                                                |
| Deployment documentation      | `VERCEL_QUICK_DEPLOY.md` (< 5 min), `VERCEL_DEPLOYMENT.md`, `ENVIRONMENT_VARIABLES.md`, `DEPLOYMENT_STATUS.md` |

**User actions remaining** (consoles, not code — steps in
`VERCEL_QUICK_DEPLOY.md`):

1. Set the 4 env vars in Vercel project settings (Production + Preview).
2. Apply schema to Neon: `pnpm db:deploy` (from desktop; Termux can't).
3. `vercel login` + `vercel link` (CLI path) or push the repo to GitHub
   (`pnpm release`) and import it in Vercel — then `pnpm deploy` returns a
   shareable URL.

Audit details and risk register: `VERCEL_AUDIT.md` · current snapshot:
`DEPLOYMENT_STATUS.md`.

## Build Status

| Gate                                                  | Result (Termux device)                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm verify` (lint/typecheck/format/build --webpack) | ✅ PASSED                                                                            |
| `pnpm security` (secret scan)                         | ✅ clean                                                                             |
| `pnpm run doctor`                                     | ❌ NOT READY — `DATABASE_URL` is a placeholder (device-local env, not a code defect) |
| Pre-commit hook                                       | ✅ installed (core.hooksPath=.githooks)                                              |

Device limitations (documented, not blockers): Turbopack unusable on Android
(→ `--webpack` everywhere automatically); Prisma schema engine can't run
on-device (→ migrate from desktop/CI).

## Release Status

**v0.1.0 — Initial Pilot-Ready Core: PREPARED, NOT YET PUBLISHED.**

- Release automation: `scripts/release.sh` (`pnpm release`) — gated,
  idempotent, refuses to push unless doctor + verify + security all pass.
- Blocked by ONE remaining user action (see `RELEASE_REPORT.md`; `gh` is now
  authenticated): set a real `DATABASE_URL` in `.env.local` (doctor gate).
- After that: `pnpm release` creates the private repo `flowpilot`, the commit
  `feat: initial pilot-ready release`, tag `v0.1.0`, and the GitHub Release.

## Next Spec

**Finish Spec A first** (recommended order: invitation acceptance /
activation (next) → customers → staff area → services → settings →
team). Spec A exit criteria live in `ROADMAP.md`.

After Spec A exit: **Spec B — Evidence Layer + Founder Side** (pilot tracking,
ROI tracking, vertical registry, evidence logging, founder dashboard).
Spec C (Vertical Discovery Engine) after that. Nothing beyond Spec C.

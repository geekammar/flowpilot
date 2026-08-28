# FlowPilot — Project Status

> Point-in-time status snapshot. Date: 2026-08-28 (after Ops 05).
> Authoritative ledger: `BUILD_STATE.md`. Evergreen summary: `CURRENT_STATE.md`.

## Current Spec

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`).

Goal: a pilot-ready generic engine that converts WhatsApp conversations into
confirmed appointments, sufficient to run paid pilots and collect evidence.

## Current Status (Spec A progress)

| Area                                   | State                             |
| -------------------------------------- | --------------------------------- |
| Foundation (stack, auth, env, tooling) | ✅ complete                       |
| Design system, RTL, responsive, PWA    | ✅ complete                       |
| Database layer (schema, repos, seed)   | ✅ complete                       |
| Onboarding wizard                      | ✅ complete                       |
| Business admin dashboard               | ✅ complete                       |
| Conversations inbox + detail           | ✅ complete                       |
| Appointments agenda/detail/create      | ✅ complete                       |
| UX/A11y/PWA polish pass                | ✅ complete                       |
| Auth sign-up form                      | ⏳ placeholder (Prompt 09 — next) |
| Customers directory                    | ⏳ placeholder                    |
| Services management                    | ⏳ placeholder                    |
| Business settings / knowledge screens  | ⏳ placeholder                    |
| Team management (admin)                | ⏳ placeholder                    |
| Staff area                             | ⏳ placeholder                    |

Ops (non-product) passes complete: Ops 01 run/reproducibility, Ops 02 health
verification + commit safety, Ops 03 release engineering, Ops 04 Vercel
deployment readiness, Ops 05 demo readiness.

## Demo Readiness Status

**READY ✅ (Ops 05).** The app feels alive immediately after login:

| Capability                                          | Delivered as                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Egyptian demo business (عيادة الابتسامة، كفر الشيخ) | `prisma/demo-data.ts` (pure, deterministic)                                              |
| 36 customers / 22 conversations / 37 appointments   | all statuses covered, per-day conflict-free, 4 today                                     |
| Realistic Egyptian-Arabic WhatsApp threads          | booking, rescheduling, emergency, complaint, FAQ scenarios (all 4 conversation statuses) |
| Dashboard alive after login                         | ~11 conversations today, 5 NEED_HUMAN, 4 appointments today                              |
| No blank screens                                    | `GettingStarted` onboarding card at zero activity + existing empty states                |
| Auto-seed for demos                                 | `DEMO_MODE=true` in `.env.local` → dev launchers re-seed                                 |
| Demo & sales documentation                          | `DEMO_GUIDE.md` (logins/scenarios), `DEMO_SCRIPT.md` (5-min flow)                        |

Demo logins: `admin@flowpilot.app` / `Admin@1234` and
`staff@flowpilot.app` / `Staff@1234` (demo databases only).

## Deployment Readiness Status

**Code side: READY ✅ (Ops 04).** What exists:

| Capability                    | Delivered as                                                               |
| ----------------------------- | -------------------------------------------------------------------------- |
| Prisma client generated in CI | `postinstall: prisma generate` + `vercel.json` buildCommand                |
| Environment validation        | `pnpm vercel:check` (same precedence as the app; clear per-var fixes)      |
| Gated deploy commands         | `pnpm deploy:check` / `deploy:preview` / `deploy:vercel`                   |
| Liveness endpoint             | `/api/health` → `{"status":"ok","version":"0.1.0",…}`                      |
| PWA cache safety              | no-cache headers for `/sw.js`, `/offline.html` in `vercel.json`            |
| Deployment documentation      | `VERCEL_DEPLOYMENT.md`, `ENVIRONMENT_VARIABLES.md`, `DEPLOYMENT_REPORT.md` |

**User actions remaining** (consoles, not code — steps in
`VERCEL_DEPLOYMENT.md`):

1. Set the 4 env vars in Vercel project settings (Production + Preview).
2. Apply schema to Neon: `pnpm db:deploy` (from desktop; Termux can't).
3. Push the repo to GitHub (`pnpm release`) and import it in Vercel (or
   `pnpm deploy:vercel` CLI path).

Audit details and risk register: `VERCEL_AUDIT.md`.

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
- Blocked by exactly two user actions (see `RELEASE_REPORT.md`):
  1. `gh auth login` (GitHub CLI not authenticated)
  2. Set a real `DATABASE_URL` in `.env.local` (doctor gate)
- After both: `pnpm release` creates the private repo `flowpilot`, the commit
  `feat: initial pilot-ready release`, tag `v0.1.0`, and the GitHub Release.

## Next Spec

**Finish Spec A first** (recommended order: auth sign-up → customers →
staff area → services → settings → team). Spec A exit criteria live in
`ROADMAP.md`.

After Spec A exit: **Spec B — Evidence Layer + Founder Side** (pilot tracking,
ROI tracking, vertical registry, evidence logging, founder dashboard).
Spec C (Vertical Discovery Engine) after that. Nothing beyond Spec C.

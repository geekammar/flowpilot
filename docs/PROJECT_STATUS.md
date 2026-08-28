# FlowPilot — Project Status

> Point-in-time status snapshot. Date: 2026-08-27 (after Ops 03).
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
verification + commit safety, Ops 03 release engineering.

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

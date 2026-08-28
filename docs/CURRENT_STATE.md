# FlowPilot — Current State

> Evergreen 30-second snapshot for any agent or human arriving cold.
> Details: `PROJECT_STATUS.md` (point-in-time) · `BUILD_STATE.md` (ledger).
> Last updated: 2026-08-27 — Ops 03.

- **Product:** WhatsApp Appointment Conversion System, Arabic-first/RTL,
  vertical-agnostic. Discovery strategy in Kafr El Sheikh.
- **Spec in flight:** A — Discovery Foundation + Booking Core (frozen).
- **Spec A status:** core engine done (auth wiring, onboarding, dashboard,
  conversations, appointments, polish). Remaining placeholders: sign-up,
  customers, services, settings, team, staff area.
- **Quality:** `pnpm verify` green (lint/typecheck/format/build).
  `pnpm run doctor` NOT READY locally until a real `DATABASE_URL` is set.
- **Ops:** bootstrap + dev scripts (Win/Linux/macOS/Termux), doctor/verify/
  security tooling, pre-commit secret guard — all tested.
- **Release:** v0.1.0 prepared; publishing blocked on `gh auth login` +
  real `DATABASE_URL`, then `pnpm release` (see `RELEASE_REPORT.md`).
- **Next step (product):** Prompt 09 — Arabic Better Auth sign-up flow, then
  customers → staff → services → settings → team (`BUILD_STATE.md`).
- **Next spec:** B — Evidence Layer (only after Spec A exit criteria).

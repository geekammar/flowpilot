# FlowPilot — Current State

> Evergreen 30-second snapshot for any agent or human arriving cold.
> Details: `PROJECT_STATUS.md` (point-in-time) · `BUILD_STATE.md` (ledger).
> Last updated: 2026-08-29 — Ops 06 (Pilot Distribution System).

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
- **Demo Readiness: READY.** Egyptian demo dataset (عيادة الابتسامة بكفر
  الشيخ — 36 customers, 22 Arabic WhatsApp conversations, 37 appointments)
  in pure `prisma/demo-data.ts`; dashboard onboarding card at zero activity;
  `DEMO_MODE=true` auto-seeds on dev launch **and** inside every
  `pnpm deploy:*` gate; `docs/DEMO_GUIDE.md` + `docs/DEMO_SCRIPT.md`
  (5-minute sales flow) + prospect package `docs/CLIENT_DEMO.md`.
- **Pilot Distribution: READY (code side).** Ops 06 shipped the distribution
  toolchain: `pnpm deploy` / `deploy:production` / `deploy:preview`
  (gated: env → database → Prisma → auth → demo data → build, then Vercel
  deploy with auth/link pre-flight and the deployment URL printed) and
  `pnpm deploy:check` (`scripts/pre-deploy.mjs` → READY / NOT READY);
  `/api/health` reports timestamp + DB reachability + `deploymentReady`;
  one-page `docs/VERCEL_QUICK_DEPLOY.md` (< 5 min). Remaining steps are user
  actions (vercel login/link, Vercel env vars, `pnpm db:deploy` vs Neon) —
  see `docs/DEPLOYMENT_STATUS.md`.
- **Deployment Readiness: READY (code side).** Ops 04 shipped the Vercel
  toolchain (postinstall Prisma generation, `vercel.json`, `pnpm
vercel:check`, `/api/health`, deployment docs) — superseded/extended by
  Ops 06 above. Remaining deploy steps are user actions (env vars in Vercel,
  `pnpm db:deploy` vs Neon, push repo, import) — see `docs/DEPLOYMENT_STATUS.md`.
- **Release:** v0.1.0 prepared; `gh` is authenticated — publishing blocked on
  a real `DATABASE_URL` only, then `pnpm release` (see `RELEASE_REPORT.md`).
- **Next step (product):** Prompt 09 — Arabic Better Auth sign-up flow, then
  customers → staff → services → settings → team (`BUILD_STATE.md`).
- **Next spec:** B — Evidence Layer (only after Spec A exit criteria).

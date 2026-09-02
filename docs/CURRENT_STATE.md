# FlowPilot — Current State

> Evergreen 30-second snapshot for any agent or human arriving cold.
> Details: `PROJECT_STATUS.md` (point-in-time) · `BUILD_STATE.md` (ledger).
> Last updated: 2026-09-02 — PROMPT-03 (Invitation Creation Foundation).

- **Product:** WhatsApp Appointment Conversion System, Arabic-first/RTL,
  vertical-agnostic. Discovery strategy in Kafr El Sheikh.
- **Spec in flight:** A — Discovery Foundation + Booking Core (frozen).
- **Spec A status:** core engine done (auth wiring, onboarding, dashboard,
  conversations, appointments, polish). Remaining placeholders: customers,
  services, settings, team, staff area (the `/sign-up` placeholder page
  remains in code but is no longer a planned deliverable).
- **Auth architecture alignment (Prompt 09) complete — documentation only:**
  invitation-first pilot account creation (Platform Operator provisions
  Business → invites ADMIN → activation → onboarding → ADMIN invites
  STAFF); ONE Better Auth system; PLATFORM vs BUSINESS authorization
  scopes; ADMIN/STAFF business roles only; Platform Operator is not a
  Business role; Invitation/account/Business lifecycles documented as the
  TARGET model — see `DECISIONS.md` #22 + `ARCHITECTURE.md →
Authentication & Authorization Model`.
- **Invitation data foundation: ✅ implemented** (Prompt 10): `Invitation`
  Prisma model (token hash only, derived lifecycle, ADMIN/STAFF role) +
  migration `20260902120000_invitation_model` + repository (tenant-scoped
  data primitives incl. guarded revoke/markAccepted) + Zod
  `CreateInvitationDto` + domain type.
- **Invitation creation foundation: ✅ implemented** (PROMPT-03): secure
  token generation (256-bit CSPRNG, URL-safe) with SHA-256 hash-only
  persistence (raw token returned once, never logged), centralized
  7-day expiry, transactional duplicate-open-invitation prevention
  (Business + normalized email; expired/revoked/accepted never block),
  and business-scoped `createInvitation` / `listInvitations` /
  `revokeInvitation` service operations with typed results — no UI, no
  acceptance, no activation, no delivery yet. **Invitation acceptance:
  🟡 not implemented yet.** **Account activation: 🟡 not implemented
  yet.** **Platform Operator: 🟡 architecture documented, implementation
  pending.**
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
- **Next step (product):** Invitation acceptance + account activation
  (accept a valid pending token, set password via Better Auth, activate)
  — then customers → staff → services → settings → team (`BUILD_STATE.md`).
- **Next spec:** B — Evidence Layer (only after Spec A exit criteria).

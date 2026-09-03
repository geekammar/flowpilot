# FlowPilot — Current State

> Evergreen 30-second snapshot for any agent or human arriving cold.
> Details: `PROJECT_STATUS.md` (point-in-time) · `BUILD_STATE.md` (ledger).
> Last updated: 2026-09-03 — PROMPT-07 (Onboarding UX Completion).

- **Product:** WhatsApp Appointment Conversion System, Arabic-first/RTL,
  vertical-agnostic. Discovery strategy in Kafr El Sheikh.
- **Spec in flight:** A — Discovery Foundation + Booking Core (frozen).
- **Spec A status:** core engine done (auth wiring, onboarding, dashboard,
  conversations, appointments, polish). Onboarding restructured in
  PROMPT-07 into the 4-step operational-foundation wizard (بيانات
  المنشأة incl. vertical → ساعات العمل → إعدادات الحجز الأساسية →
  مراجعة وتشغيل) with smart resume (`/onboarding` → first incomplete
  step / dashboard when completed), step-order guards, back-navigation,
  a real review summary, and a server-side completion guard (services/
  knowledge deferred to their own later screens). Remaining
  placeholders: customers, services, settings, team, staff area (the
  `/sign-up` placeholder page remains in code but is no longer a planned
  deliverable).
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
  delivery yet.
- **Invitation acceptance foundation: ✅ implemented** (PROMPT-04):
  one-time, atomic, token-based acceptance — raw token hashed with the
  existing utility, hash-only lookup, lifecycle enforcement
  (expired/revoked/already-accepted rejected with typed Arabic errors;
  unknown tokens get one generic not-found), a single conditional-update
  repository primitive (concurrent acceptance cannot succeed twice),
  and a safe invitation context result (id, email, businessId, role,
  acceptedAt — never the raw token or hash).
- **ADMIN account activation foundation: ✅ implemented** (PROMPT-05):
  an accepted ADMIN invitation becomes a real Better Auth identity with
  Business ADMIN membership — eligibility enforced (pending/expired/
  revoked/STAFF rejected; ADMIN + accepted + unactivated only), Better
  Auth `signUpEmail` behind an injectable dependency (Better Auth owns
  passwords; the adapter runs with `transaction: true` so identity
  creation is atomic), one identity per email (no duplicates, no
  password resets, no silent role changes; cross-Business/STAFF
  conflicts typed), one-time activation via the atomic `activatedAt`
  guard (concurrent attempts cannot both succeed), interrupted
  activations resumable, and safe results only. **Platform
  Operator: 🟡 architecture documented, implementation pending.**
- **ADMIN activation → onboarding integration: ✅ implemented**
  (PROMPT-06): public activation route `/invite/[token]` with a
  read-only invitation pre-screen (no GET-time mutation), an
  Arabic/RTL activation form (name + password), one server action
  composing the existing accept + activate services (Zod-stripped
  input; invitation stays the sole authority for
  businessId/email/role), typed Arabic error states (invalid/expired/
  revoked/already-activated/conflict/failure), and a safe sign-in →
  onboarding handoff after success (DECISIONS #25 — the service
  discards the auto-created session, so the ADMIN signs in with the
  password just chosen and lands in the existing wizard). Onboarding
  is ADMIN-only (`requireRole("ADMIN")`); public-path policy lives in
  `@/lib/public-paths`. Still pending on this path: invitation
  creation/delivery UX (Team management) and the STAFF activation
  workflow.
- **Quality:** `pnpm verify` green (lint/typecheck/format/build).
  `pnpm run doctor` NOT READY locally until a real `DATABASE_URL` is set.
- **Onboarding UX completion (PROMPT-07): ✅ implemented:** 4-step wizard
  with `Business.vertical` discovery metadata (nullable TEXT + Zod union
  `VERTICAL_VALUES` — migration `20260903130000_business_vertical`,
  authored but not applied on-device), smart resume redirector,
  step-order guards, review summary with per-step edit links, and a
  server-authoritative completion guard over the step data only.
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
- **Release:** v0.1.0 published on GitHub (2026-08-27). v0.2.0 —
  Invitation Creation Foundation, v0.3.0 — Invitation Acceptance
  Foundation, and v0.4.0 — ADMIN Account Activation Foundation:
  published on GitHub (2026-09-03, PROMPT-05A). v0.5.0 — ADMIN
  Activation → Onboarding Integration: published 2026-09-03 (PROMPT-06).
  v0.6.0 — Onboarding UX Completion: published 2026-09-03 (PROMPT-07,
  via the documented GitHub publication workflow) — every tag is pushed
  to origin and has a GitHub Release; v0.6.0 is the current Latest.
  Local `main` and origin `main` are in sync (see `PROJECT_STATUS.md →
Release Status`). Open user action: the repo is public but must be
  private (GITHUB_WORKFLOW.md / DECISIONS #18).
- **Next step (product):** decided by the operator from the updated
  BUILD_STATE — natural candidates: Services management screen (onboarding
  no longer creates services, raising its priority) or Customers
  Directory (Spec A §11); then staff area → settings → team.
- **Next spec:** B — Evidence Layer (only after Spec A exit criteria).

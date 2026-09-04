# FlowPilot — Project Status

> Point-in-time status snapshot. Date: 2026-09-04 (after PROMPT-12 —
> Smart Create Appointment: Available-Slot Selection, Step 4).
> Authoritative ledger: `BUILD_STATE.md`. Evergreen summary: `CURRENT_STATE.md`.

## Current Spec

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`).

Goal: a pilot-ready generic engine that converts WhatsApp conversations into
confirmed appointments, sufficient to run paid pilots and collect evidence.

## Current Status (Spec A progress)

| Area                                                         | State                                  |
| ------------------------------------------------------------ | -------------------------------------- |
| Foundation (stack, auth, env, tooling)                       | ✅ complete                            |
| Design system, RTL, responsive, PWA                          | ✅ complete                            |
| Database layer (schema, repos, seed)                         | ✅ complete                            |
| Onboarding wizard (4-step operational foundation, PROMPT-07) | ✅ complete                            |
| Business admin dashboard                                     | ✅ complete                            |
| Conversations inbox + detail                                 | ✅ complete                            |
| Appointments agenda/detail/create                            | ✅ complete                            |
| UX/A11y/PWA polish pass                                      | ✅ complete                            |
| Auth architecture alignment (docs)                           | ✅ complete (Prompt 09, DECISIONS #22) |
| Invitation data model (schema/migration/repo/validation)     | ✅ complete (Prompt 10)                |
| Invitation creation foundation (service layer)               | ✅ complete (PROMPT-03)                |
| Invitation acceptance foundation (service layer)             | ✅ complete (PROMPT-04)                |
| ADMIN account activation (Better Auth + membership)          | ✅ complete (PROMPT-05, service layer) |
| Activation → onboarding integration                          | ✅ complete (PROMPT-06)                |
| Services management (PROMPT-08)                              | ✅ complete                            |
| Business settings — identity + booking behavior (PROMPT-09)  | ✅ complete                            |
| Availability domain/service foundation (PROMPT-10)           | ✅ complete (service layer, no UI)     |
| Smart Create flow Steps 1–3 (PROMPT-11)                      | ✅ complete                            |
| Smart Create Step 4 — available-slot selection (PROMPT-12)   | ✅ complete                            |
| Smart Create Steps 5–6 (review/confirm)                      | ⏳ next product slice                  |
| Customers directory                                          | ⏳ placeholder (oldest remaining)      |
| Business knowledge screen                                    | ⏳ placeholder                         |
| Team management (admin)                                      | ⏳ placeholder                         |
| Staff area                                                   | ⏳ placeholder                         |

Auth note (Prompts 09–10 + PROMPT-03/04/05/06): account creation for
the pilot stage is invitation-first — the Platform Operator provisions
the Business and invites the initial ADMIN; public self-sign-up is NOT
the primary pilot flow (future self-serve mode remains architecturally
possible). The `/sign-up` placeholder page remains in code but is no
longer a planned deliverable. The Invitation DATA foundation (model,
migration, repository, validation), the creation foundation (secure
token generation with hash-only persistence, 7-day expiry,
duplicate-open prevention, business-scoped create/list/revoke service
operations), the acceptance foundation (one-time, atomic, token-based
acceptance with lifecycle enforcement and a safe invitation-context
result), the ADMIN account activation foundation (Better Auth
identity creation, one identity per email, one-time atomic
`activatedAt` + Business ADMIN membership), AND the activation →
onboarding integration (public `/invite/[token]` activation route
composing accept + activate, safe sign-in → onboarding handoff,
ADMIN-only onboarding guard) are implemented. Onboarding was
restructured in PROMPT-07 into the 4-step operational-foundation wizard
(بيانات المنشأة incl. vertical discovery metadata → ساعات العمل →
إعدادات الحجز الأساسية → مراجعة وتشغيل) with smart resume, step-order
guards, a review summary, and a server-side completion guard over the
step data only — services/knowledge management moved out of onboarding
into their own upcoming Spec A screens. Services management is now
implemented (PROMPT-08): `/services` with list/create/edit/activate/
deactivate, ADMIN-only + tenant-scoped in the service layer, the
Business always derived from the session, a small shared create/edit
dialog, active/inactive canonical statuses, empty/loading/error
states, and role-scoped navigation — zero schema changes (the existing
Service model/repository/validation were sufficient; inactive services
remain excluded from booking selection paths). Business Settings is
now implemented (PROMPT-09): `/settings` with بيانات المنشأة (name,
vertical, city, WhatsApp, timezone) and إعدادات الحجز (confirmation
mode + cancellation policy) in one form with one save action, inline
Arabic validation, visible success/failure states, ADMIN-only +
tenant-scoped in the settings service layer, the Business always
derived from the session, and role-scoped navigation. One additive
field `Business.confirmationMode` (manual/automatic, default manual;
migration authored, not applied on-device) drives the server-derived
initial status of new appointments. Not yet implemented: default
appointment duration (no clean domain representation — documented,
not invented), working-hours editing in settings, account
activate/deactivate, and the knowledge screen.
Smart availability (PROMPT-10) is implemented as a
service/domain foundation (no UI): `getAvailability` in the
appointments feature computes deterministic bookable start times from
the Business's workingHours, stored timezone, canonical
slotDurationMinutes step, and the service's durationMinutes, filtered
by the same PENDING/CONFIRMED conflict rule the write path enforces
(read via the new `AppointmentRepository.listBlockingForDate`
primitive). Typed result contract with explicit no-slots reasons and
Arabic error codes; `getAvailabilityAction` is the server-action hook
for the Smart Create flow. Zero schema changes; verified offline 36/36
with in-memory stand-ins running the real service code.
Smart Create Appointment Steps 1–3 (PROMPT-11) are now implemented:
`/appointments/new` is a step flow (العميل → الخدمة → التاريخ) with a
6-step progress indicator. Step 1 searches customers by name or phone
(debounced, tenant-scoped server action over the existing customer
repository search primitive, with empty/selected/change states); Step 2
lists active services only as radio-cards; Step 3 offers a 14-day
quick-pick strip from business-timezone today plus a native date input
validated by the shared date schema. Selections live in one client
container and never reset on back-navigation. Smart Create Step 4
(PROMPT-12) is now implemented too: الوقت is REAL available-slot
selection consuming the PROMPT-10 availability layer through
`getAvailabilityAction` verbatim (no second engine, zero algorithm or
schema changes). Every displayed time comes from the server result; the
request runs only while the step is mounted with a valid date + service.
Four UI states: loading, grouped morning/afternoon/evening chips
(360px-safe, aria-pressed selection, aria-live count,
business-timezone label, selected date always visible), zero slots with
the EXPLICIT reason as clear Arabic copy plus actionable next steps
(BUSINESS_CLOSED / SERVICE_TOO_LONG / FULLY_BOOKED), and failure with
retry. The typed `SelectedSlot` lives in the wizard's container state,
is cleared when service or date changes, and is preserved for the
future review step — Step 4 is SELECTION ONLY (no appointment is
created from it; the interim manual time-entry screen was removed, so
the flow deliberately ends at slot selection while steps 5–6 stay
locked). Verified offline 89/89 with in-memory stand-ins running the
real service code + source-level checks.
Not yet implemented: Smart Create Steps 5–6 (review/confirmation),
token delivery, invitation creation UI (Team management), and the
STAFF activation workflow.

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

- **v0.1.0 — Initial Pilot-Ready Core: PUBLISHED** (GitHub Release
  exists on the lightweight tag at the initial scaffold commit;
  published 2026-08-27 — the earlier "prepared, not published" wording
  in this section predated the actual publication).
- **v0.2.0 — Invitation Creation Foundation: PUBLISHED** (2026-09-03,
  PROMPT-05A). Annotated tag `v0.2.0` points at the PROMPT-03 commit
  (`4c80f13`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.2.0 — Invitation Creation Foundation" exists.
- **v0.3.0 — Invitation Acceptance Foundation: PUBLISHED** (2026-09-03,
  PROMPT-05A). Annotated tag `v0.3.0` points at the PROMPT-04 commit
  (`ef012f0`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.3.0 — Invitation Acceptance Foundation" exists.
- **v0.4.0 — ADMIN Account Activation Foundation: PUBLISHED**
  (2026-09-03, PROMPT-05A). Annotated tag `v0.4.0` points at the
  PROMPT-05 commit (`896188a`, `feat(auth): add ADMIN account
activation`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.4.0 — ADMIN Account Activation Foundation" exists.
- **v0.5.0 — ADMIN Activation → Onboarding Integration: PUBLISHED**
  (2026-09-03, PROMPT-06 — current Latest release). Annotated tag
  `v0.5.0` points at the PROMPT-06 commit
  (`feat(auth): connect admin activation to onboarding`); the tag is
  pushed to origin and the GitHub Release "FlowPilot v0.5.0 — ADMIN
  Activation → Onboarding Integration" exists. Published through the
  documented GitHub publication workflow (PROMPT-05A pattern: git
  state → origin identity → gh auth → local/remote commits →
  local/remote tags → existing releases → push →
  `gh release create --verify-tag`); the legacy `pnpm release`
  doctor gate still blocks on this device's placeholder
  `DATABASE_URL` (device-local, user action) and was not used, per
  the operator's instruction for operations-only publication.
- **v0.6.0 — Onboarding UX Completion: PUBLISHED** (2026-09-03,
  PROMPT-07). Annotated tag `v0.6.0` points at the PROMPT-07 commit
  (`feat(onboarding): improve business onboarding experience`); the tag
  is pushed to origin and the GitHub Release "FlowPilot v0.6.0 —
  Onboarding UX Completion" exists. Published through the documented
  GitHub publication workflow (PROMPT-05A/06 pattern); the legacy
  `pnpm release` doctor gate still blocks on this device's placeholder
  `DATABASE_URL` (device-local, user action) and was not used, per the
  operator's instruction.
- **v0.7.0 — Services Management Foundation: PUBLISHED** (2026-09-03,
  PROMPT-08). Annotated tag `v0.7.0` points at
  the PROMPT-08 commit (`feat(services): add services management
foundation`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.7.0 — Services Management Foundation" exists. Published
  through the documented GitHub publication workflow (PROMPT-05A/06/07
  pattern); the legacy `pnpm release` doctor gate still blocks on this
  device's placeholder `DATABASE_URL` (device-local, user action) and
  was not used, per the operator's instruction.
- **v0.8.0 — Business Settings Foundation: PUBLISHED** (2026-09-03,
  PROMPT-09). Annotated tag `v0.8.0` points at
  the PROMPT-09 commit (`feat(settings): add business settings
foundation`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.8.0 — Business Settings Foundation" exists. Published
  through the documented GitHub publication workflow
  (PROMPT-05A..08 pattern); the legacy `pnpm release` doctor gate
  still blocks on this device's placeholder `DATABASE_URL`
  (device-local, user action) and was not used, per the
  operator's instruction.
- **v0.9.0 — Smart Availability Foundation: PUBLISHED** (2026-09-04,
  PROMPT-10). Annotated tag `v0.9.0` points
  at the PROMPT-10 commit (`feat(appointments): add deterministic
availability foundation`); the tag is pushed to origin and the
  GitHub Release "FlowPilot v0.9.0 — Smart Availability Foundation"
  exists. Published through the documented GitHub publication workflow
  (PROMPT-05A..09 pattern); the legacy `pnpm release` doctor gate
  still blocks on this device's placeholder `DATABASE_URL`
  (device-local, user action) and was not used, per the operator's
  instruction.
- **v0.10.0 — Smart Create Appointment Foundation (Steps 1–3):
  PUBLISHED** (2026-09-04, PROMPT-11).
  Annotated tag `v0.10.0` points at the PROMPT-11 commit
  (`feat(appointments): add smart create appointment flow
foundation`); the tag is pushed to origin and the GitHub Release
  "FlowPilot v0.10.0 — Smart Create Appointment Foundation" exists.
  Published through the documented GitHub publication workflow
  (PROMPT-05A..10 pattern); the legacy `pnpm release` doctor gate still
  blocks on this device's placeholder `DATABASE_URL`
  (device-local, user action) and was not used, per the operator's
  instruction.
- **v0.11.0 — Smart Create Appointment: Available-Slot Selection
  (Step 4): PUBLISHED** (2026-09-04, PROMPT-12 — current Latest
  release). Annotated tag `v0.11.0` points at the PROMPT-12 commit
  (`feat(appointments): add available slot selection`); the tag is
  pushed to origin and the GitHub Release "FlowPilot v0.11.0 — Smart
  Create Appointment: Available-Slot Selection" exists. Published
  through the documented GitHub publication workflow (PROMPT-05A..11
  pattern); the legacy `pnpm release` doctor gate still blocks on this
  device's placeholder `DATABASE_URL` (device-local, user action) and
  was not used, per the operator's instruction.
- Publication history was reconciled by PROMPT-05A (operations-only):
  local `main` was already current on origin (no commit push needed);
  the three missing tags were pushed normally (no force) and the
  missing GitHub Releases were created in chronological order with
  notes built only from verified BUILD_STATE/commit scope. Future
  releases continue through `bash scripts/release.sh flowpilot <tag>
<notes-file>` once its gates pass.
- **Open item (user action):** the GitHub repository is currently
  **public**, but `GITHUB_WORKFLOW.md` / DECISIONS #18 require
  **private** during the discovery stage — fix with
  `gh repo edit geekammar/flowpilot --visibility private` (or GitHub →
  Settings → Change visibility).

## Next Spec

**Finish Spec A first.** Recommended next product slice: **PROMPT-13 —
Smart Create Appointment: Step 5 Review** — consumes the preserved
`SelectedSlot` from the wizard state (then Step 6 confirmation). Then
the remaining
placeholders (customers directory → business knowledge screen → team,
which includes the STAFF invitation/activation UX composing the
existing invitation services; then staff area). Spec A exit criteria
live in `ROADMAP.md`.

After Spec A exit: **Spec B — Evidence Layer + Founder Side** (pilot tracking,
ROI tracking, vertical registry, evidence logging, founder dashboard).
Spec C (Vertical Discovery Engine) after that. Nothing beyond Spec C.

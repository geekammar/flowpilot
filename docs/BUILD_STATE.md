# FlowPilot — Build State

> ⚠️ THE authoritative current-state ledger — the single answer to "what is
> the state of FlowPilot?". Every agent MUST read it before starting work and
> MUST update it after finishing a prompt. Keep updates MINIMAL: status,
> completed work, known issues, next step — not a historical diary.
> Historical implementation detail lives in Git history (`git log --oneline`,
> `git show <commit>`, release tags) and `DECISIONS.md`.
> Last updated: PROMPT-14 (Smart Create Step 6 — confirmation / creation).
> Product version: **v0.13.0**.

## Current State (summary)

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`)
is implemented and verified prompt-by-prompt through the complete Smart
Create flow. Complete: the booking core (dashboard, conversations inbox +
detail, appointments agenda/detail, services, settings, deterministic
availability, Smart Create steps 1–6 — review hands off to التأكيد, which
creates the appointment through the canonical `createAppointment` write
path), the invitation-first auth lifecycle (data model → creation →
acceptance → ADMIN activation → activation UI → onboarding handoff), the
4-step onboarding wizard, and the ops toolchain (bootstrap/dev scripts,
doctor/verify/security, gated releases, Vercel deployment, demo dataset,
pilot distribution).

**Remaining Spec A placeholders:** customers directory, business knowledge
screen, team management (incl. STAFF invitation/activation UX, invitation
creation UI, token delivery), staff area. The `/sign-up` placeholder page
remains in code but is superseded (invitation-first, DECISIONS #22).

**Quality:** `pnpm verify` green (lint/typecheck/format/build);
`pnpm security` clean; `pnpm run doctor` NOT READY on this device only
(placeholder `DATABASE_URL` — device-local, not a code defect).

## Completed Major Work

| Area                        | Highlights                                                                                                                                                                                                                               | Release         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Foundation                  | Next.js 16 + TS strict + Tailwind v4 + shadcn/ui, Better Auth, Prisma 7 / Neon, feature-based modular monolith, env fail-fast, PWA                                                                                                       | v0.1.0          |
| Design system / RTL / PWA   | Arabic-first RTL tokens, AppShell (desktop right sidebar / mobile bottom nav), status system, PNG PWA icons                                                                                                                              | v0.1.0          |
| Database layer              | Full Spec A domain model + Invitation, repositories (only Prisma consumers), Zod DTOs, Arabic demo seed                                                                                                                                  | v0.1.0          |
| Onboarding wizard           | 4-step operational-foundation wizard, smart resume, step guards, server-side completion guard, `Business.vertical` discovery metadata                                                                                                    | v0.1.0 → v0.6.0 |
| Dashboard                   | Today-focused Admin dashboard (conversations needing attention, pending/confirmed appointments, today's agenda, quick actions)                                                                                                           | v0.1.0          |
| Conversations               | Inbox (search, status/assignee filters) + tenant-scoped detail thread, staff replies (transactional, optimistic), assignment/status actions                                                                                              | v0.1.0          |
| Appointments                | Agenda view by day + filters, detail with lifecycle actions, conflict-checked create/reschedule, status transition rules                                                                                                                 | v0.1.0          |
| Polish pass                 | Loading/error/empty states everywhere, a11y fixes, Arabic pluralization, honest placeholders                                                                                                                                             | v0.1.0          |
| Auth architecture alignment | Invitation-first model locked (docs only): ONE Better Auth system, PLATFORM vs BUSINESS scopes, ADMIN/STAFF only, Platform Operator ≠ Business role                                                                                      | DECISIONS #22   |
| Invitation foundation       | Secure token creation (hash-only persistence, 7-day expiry, duplicate-open guard), one-time atomic acceptance, ADMIN activation (Better Auth identity + membership, one-time `activatedAt`)                                              | v0.2.0–v0.4.0   |
| Activation UI               | Public `/invite/[token]` route: read-only pre-screen, activation form, typed Arabic states, safe sign-in → onboarding handoff; `/onboarding` ADMIN-only                                                                                  | v0.5.0          |
| Onboarding UX completion    | Restructured to 4 steps, `vertical` metadata, smart resume redirector, review summary                                                                                                                                                    | v0.6.0          |
| Services management         | `/services`: list/create/edit/activate/deactivate, ADMIN-only, tenant-scoped, role-scoped nav                                                                                                                                            | v0.7.0          |
| Business settings           | `/settings`: identity + booking behavior, `Business.confirmationMode` drives server-derived initial appointment status                                                                                                                   | v0.8.0          |
| Smart availability          | Deterministic `getAvailability` (working hours + timezone + slot step + duration fit + conflict rule); `getAvailabilityAction` hook                                                                                                      | v0.9.0          |
| Smart Create steps 1–3      | Customer search → service selection → date selection (6-step indicator, selections never reset)                                                                                                                                          | v0.10.0         |
| Smart Create step 4         | Real available-slot selection consuming the availability layer; explicit no-slots reasons; stale-selection protection                                                                                                                    | v0.11.0         |
| Smart Create step 5         | Review with per-section تعديل affordances, missing-input protection, on-demand slot revalidation; verified review = hand-off to Step 6                                                                                                   | v0.12.0         |
| Smart Create step 6         | التأكيد: final read-only summary + confirmation-mode behavior → creates through the canonical `createAppointment` path; typed failures incl. `SLOT_CONFLICT` recovery to Step 4; server-confirmed success state + detail-page navigation | v0.13.0         |
| Ops (DX, non-product)       | Cross-platform bootstrap/dev scripts, `pnpm run setup/doctor`, `pnpm verify`, `pnpm security` + pre-commit hook, gated `pnpm release`, Vercel deploy toolchain (`pnpm deploy*`), Egyptian demo dataset + `DEMO_MODE`, distribution docs  | Ops 01–06       |

## Key Known Limitations (current)

- Smart Create has no notes entry: Step 6 submits without notes (PROMPT-14
  scope decision — a notes field was not among the required inputs).
- Availability is a READ layer: no slot reservation; the transactional
  conflict check at write time is the final guard (no DB exclusion
  constraint — accepted at pilot scale; same for invitation duplicate-open).
  Two SIMULTANEOUS identical creates could still race past the check (the
  count-then-create transaction is not serializable); the wizard blocks
  duplicate submission in-flight, and the realistic single-actor double-click
  cannot produce a duplicate.
- Step 5 revalidation is a hand-off, not a reservation — by design; the
  write's conflict check is the authority (PROMPT-13/14 semantics).
- Unassigned appointments block the whole business day (consistency with the
  write path; staff-assignment-aware availability is a later decision).
- WhatsApp transport is not implemented: the inbox reads DB/seeded messages;
  staff replies persist through repositories. Message send/transport stays
  behind an interface (Spec A §8).
- Invitation token delivery is manual: the raw token is returned exactly
  once from `createInvitation`; delivery (email/WhatsApp) is out of scope.
- STAFF activation workflow and invitation creation UI (Team management) do
  not exist yet; STAFF invitations reaching `/invite/[token]` get a "not
  supported yet" state.
- Creating an appointment requires an existing Customer; customer creation
  belongs to the Customers Directory prompt.
- Appointments accept past dates at the domain level (the date step's
  `min=today` is a UX guard only).
- Blocking reads cap at 200 rows/day; customer search caps at 20/page; no
  pagination UI (pilot scale).
- Health DB probe adds up to 3s on cold/suspended Neon (liveness unaffected).
- Termux device: builds use `--webpack` (no Turbopack bindings); the Prisma
  schema engine cannot run on-device (migrate from desktop/CI); SVG→PNG icon
  regeneration via `pnpm icons`.

## Migration State

Applied state lives in `prisma/migrations/`. Authored but NOT applied
on-device (Termux schema-engine limitation — apply from desktop/CI with
`pnpm db:deploy`): `20260902120000_invitation_model`,
`20260903120000_invitation_activation`,
`20260903130000_business_vertical`,
`20260903140000_business_confirmation_mode`.

## Ops State

- Release model (DECISIONS #18): private GitHub repo, single `main` branch,
  annotated `vX.Y.Z` tags, gated `pnpm release`; pre-commit secret hook
  active (`core.hooksPath=.githooks`).
- Deploy: `pnpm deploy` / `deploy:preview` / `deploy:check` (gated; URL
  captured); `/api/health` reports version + DB reachability +
  `deploymentReady`. Guides: `VERCEL_DEPLOYMENT.md` (§0 = quick path),
  `ENVIRONMENT_VARIABLES.md`.
- Demo: Egyptian dataset (عيادة الابتسامة — 36 customers, 22 conversations,
  37 appointments) in `prisma/demo-data.ts`; `DEMO_MODE=true` re-seeds in dev
  launchers and every deploy. Docs: `DEMO_GUIDE.md`, `DEMO_SCRIPT.md`,
  `CLIENT_DEMO.md`. Demo logins (demo DBs only): `admin@flowpilot.app` /
  `Admin@1234`, `staff@flowpilot.app` / `Staff@1234`.
- Releases v0.1.0–v0.12.0 are published on GitHub (tags pushed; each has a
  GitHub Release; newest = Latest). Local and origin `main` are in sync.

## Unresolved User Actions (not code)

1. Make the GitHub repository **private** (currently public; required by
   `GITHUB_WORKFLOW.md` / DECISIONS #18).
2. Set a real `DATABASE_URL` in `.env.local` on this device (doctor gate).
3. For deployment: Vercel env vars (Production + Preview) + `pnpm db:deploy`
   against Neon from desktop/CI (`VERCEL_DEPLOYMENT.md`).

## PROMPT-14 — Smart Create Step 6: Confirmation / Appointment Creation

- **Scope:** activate the wizard's final step (التأكيد) ONLY — connect the
  verified Step 5 review state to the existing `createAppointment` write
  path and make Step 6 a real confirmation experience. Steps 1–5 unchanged
  except entry/exit wiring; no schema change; no new route.
- **Implementation:**
  - `createAppointment` logic extracted VERBATIM into
    `src/features/appointments/server/appointment-create-service.ts`
    (`createAppointmentRecord`) following the feature's injectable-deps
    service pattern (availability/booking-flow); the action stays the
    canonical write path and only derives the actor from the session
    (`requireUser` + `userRepository.findById`). No second engine, no new
    repository, no rule change: tenant isolation, active-service check,
    server-derived `endTime` + initial status from
    `Business.confirmationMode`, and the transactional conflict check are
    all preserved; failures are now typed
    (`CreateAppointmentErrorCode`: VALIDATION / NO_BUSINESS /
    CUSTOMER_NOT_FOUND / SERVICE_UNAVAILABLE / END_OF_DAY / SLOT_CONFLICT /
    CREATE_FAILED) and success carries the created appointment's id +
    ACTUAL server-derived status.
  - Step 6 (`confirm-step.tsx`): read-only final summary (customer name +
    phone, service + duration, long Arabic date, slot start/end, business
    timezone) + post-confirmation behavior copy from the Business's
    confirmationMode (server-passed props). Primary action تأكيد الحجز
    (wizard footer) → `createAppointment`; duplicate submission blocked
    (in-flight ref + disabled buttons); loading announced; summary stays
    visible. Success ONLY from the server result: canonical status badge,
    primary action عرض الموعد → existing `/appointments/[id]`, wizard
    cleared only after success (إنشاء موعد آخر). `SLOT_CONFLICT` →
    Arabic alert + اختيار وقت آخر → clears the stale slot through the
    wizard mechanism, returns to Step 4, and drops the cached
    `booking-availability` query so Step 4 refetches through the SAME
    `getAvailabilityAction`. Other failures: retryable role=alert panels.
  - Review (Step 5) now hands off: verified revalidation → navigate to
    التأكيد (revalidation stays a hand-off, never a reservation);
    `BOOKING_FLOW_ACTIVE_STEPS` 5 → 6; verified-panel copy updated.
- **Tests:** temporary offline harness (removed after the run) — 83/83
  checks: real create service against in-memory repository stand-ins
  (valid create + server-derived status for both confirmation modes,
  duplicate submit rejected, stale/overlapping slot → SLOT_CONFLICT,
  malformed payloads, hostile businessId/status/assignedUserId/role
  stripped, cross-business customer/service rejected, inactive service,
  no-business actor, business-record-missing, repository-throw →
  CREATE_FAILED, END_OF_DAY, notes handling, addMinutes math) + real
  Step 6 markup assertions (summary content, submitting/success/error/
  conflict/missing states, a11y roles) + source-level wiring checks
  (single creation engine, single availability engine, state preservation,
  logical CSS, 360px, step-6-only activation).
- **Known limitations:** no live-DB run on this device (placeholder
  `DATABASE_URL` — device-local); the count-then-create conflict
  transaction is not serializable against a truly simultaneous second
  write (accepted at pilot scale, same as before); no notes entry in the
  wizard.
- **Exact next step:** PROMPT-15 — Customers Directory (`/customers`):
  list/search + customer detail (contacts + appointments history via the
  existing reads), plus the create-customer primitive the booking flow
  lacks today.

## Next Step (product)

**PROMPT-15 — Customers Directory.** The booking flow requires an existing
customer; the directory (list + search + detail + creation) is the next
smallest product step after the completed Smart Create flow. After that,
the remaining Spec A placeholders (business knowledge screen → team, incl.
STAFF invitation/activation UX → staff area) proceed per the operator's
choice. Spec A exit criteria: see `SPEC_A.md → Spec Sequence & Exit
Criteria`.

After each prompt: update this file (minimally) and append to
`DECISIONS.md` when a decision was made.

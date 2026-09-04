# FlowPilot — Build State

> ⚠️ THE authoritative current-state ledger — the single answer to "what is
> the state of FlowPilot?". Every agent MUST read it before starting work and
> MUST update it after finishing a prompt. Keep updates MINIMAL: status,
> completed work, known issues, next step — not a historical diary.
> Historical implementation detail lives in Git history (`git log --oneline`,
> `git show <commit>`, release tags) and `DECISIONS.md`.
> Last updated: PROMPT-13.5 (documentation reset). Product version: **v0.12.0**.

## Current State (summary)

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`)
is implemented and verified prompt-by-prompt through the Smart Create review
step. Complete: the booking core (dashboard, conversations inbox + detail,
appointments agenda/detail/create, services, settings, deterministic
availability, Smart Create steps 1–5), the invitation-first auth lifecycle
(data model → creation → acceptance → ADMIN activation → activation UI →
onboarding handoff), the 4-step onboarding wizard, and the ops toolchain
(bootstrap/dev scripts, doctor/verify/security, gated releases, Vercel
deployment, demo dataset, pilot distribution).

**Remaining Spec A placeholders:** Smart Create Step 6 (confirmation /
appointment creation — next), customers directory, business knowledge
screen, team management (incl. STAFF invitation/activation UX, invitation
creation UI, token delivery), staff area. The `/sign-up` placeholder page
remains in code but is superseded (invitation-first, DECISIONS #22).

**Quality:** `pnpm verify` green (lint/typecheck/format/build);
`pnpm security` clean; `pnpm run doctor` NOT READY on this device only
(placeholder `DATABASE_URL` — device-local, not a code defect).

## Completed Major Work

| Area                        | Highlights                                                                                                                                                                                                                              | Release         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Foundation                  | Next.js 16 + TS strict + Tailwind v4 + shadcn/ui, Better Auth, Prisma 7 / Neon, feature-based modular monolith, env fail-fast, PWA                                                                                                      | v0.1.0          |
| Design system / RTL / PWA   | Arabic-first RTL tokens, AppShell (desktop right sidebar / mobile bottom nav), status system, PNG PWA icons                                                                                                                             | v0.1.0          |
| Database layer              | Full Spec A domain model + Invitation, repositories (only Prisma consumers), Zod DTOs, Arabic demo seed                                                                                                                                 | v0.1.0          |
| Onboarding wizard           | 4-step operational-foundation wizard, smart resume, step guards, server-side completion guard, `Business.vertical` discovery metadata                                                                                                   | v0.1.0 → v0.6.0 |
| Dashboard                   | Today-focused Admin dashboard (conversations needing attention, pending/confirmed appointments, today's agenda, quick actions)                                                                                                          | v0.1.0          |
| Conversations               | Inbox (search, status/assignee filters) + tenant-scoped detail thread, staff replies (transactional, optimistic), assignment/status actions                                                                                             | v0.1.0          |
| Appointments                | Agenda view by day + filters, detail with lifecycle actions, conflict-checked create/reschedule, status transition rules                                                                                                                | v0.1.0          |
| Polish pass                 | Loading/error/empty states everywhere, a11y fixes, Arabic pluralization, honest placeholders                                                                                                                                            | v0.1.0          |
| Auth architecture alignment | Invitation-first model locked (docs only): ONE Better Auth system, PLATFORM vs BUSINESS scopes, ADMIN/STAFF only, Platform Operator ≠ Business role                                                                                     | DECISIONS #22   |
| Invitation foundation       | Secure token creation (hash-only persistence, 7-day expiry, duplicate-open guard), one-time atomic acceptance, ADMIN activation (Better Auth identity + membership, one-time `activatedAt`)                                             | v0.2.0–v0.4.0   |
| Activation UI               | Public `/invite/[token]` route: read-only pre-screen, activation form, typed Arabic states, safe sign-in → onboarding handoff; `/onboarding` ADMIN-only                                                                                 | v0.5.0          |
| Onboarding UX completion    | Restructured to 4 steps, `vertical` metadata, smart resume redirector, review summary                                                                                                                                                   | v0.6.0          |
| Services management         | `/services`: list/create/edit/activate/deactivate, ADMIN-only, tenant-scoped, role-scoped nav                                                                                                                                           | v0.7.0          |
| Business settings           | `/settings`: identity + booking behavior, `Business.confirmationMode` drives server-derived initial appointment status                                                                                                                  | v0.8.0          |
| Smart availability          | Deterministic `getAvailability` (working hours + timezone + slot step + duration fit + conflict rule); `getAvailabilityAction` hook                                                                                                     | v0.9.0          |
| Smart Create steps 1–3      | Customer search → service selection → date selection (6-step indicator, selections never reset)                                                                                                                                         | v0.10.0         |
| Smart Create step 4         | Real available-slot selection consuming the availability layer; explicit no-slots reasons; stale-selection protection                                                                                                                   | v0.11.0         |
| Smart Create step 5         | Review with per-section تعديل affordances, missing-input protection, on-demand slot revalidation; Step 6 locked                                                                                                                         | v0.12.0         |
| Ops (DX, non-product)       | Cross-platform bootstrap/dev scripts, `pnpm run setup/doctor`, `pnpm verify`, `pnpm security` + pre-commit hook, gated `pnpm release`, Vercel deploy toolchain (`pnpm deploy*`), Egyptian demo dataset + `DEMO_MODE`, distribution docs | Ops 01–06       |

## Key Known Limitations (current)

- Smart Create ends at review: Step 6 (التأكيد) is locked — no appointment is
  created from the wizard yet; `createAppointment` (the untouched write path)
  is the designated consumer for PROMPT-14.
- Availability is a READ layer: no slot reservation; the transactional
  conflict check at write time is the final guard (no DB exclusion
  constraint — accepted at pilot scale; same for invitation duplicate-open).
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

## Next Step (product)

**PROMPT-14 — Smart Create Appointment: Step 6 Confirmation / Appointment
Creation.** The review's verified state is the hand-off point;
`createAppointment` remains the untouched write path (conflict check,
server-derived initial status from `Business.confirmationMode`). Notes entry
(none exists in wizard state today) is that prompt's scope decision.

After that, the remaining Spec A placeholders (customers directory →
business knowledge screen → team, incl. STAFF invitation/activation UX →
staff area) proceed per the operator's choice. Spec A exit criteria: see
`SPEC_A.md → Spec Sequence & Exit Criteria`.

After each prompt: update this file (minimally) and append to
`DECISIONS.md` when a decision was made.

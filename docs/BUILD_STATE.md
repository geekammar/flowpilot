# FlowPilot — Build State

> ⚠️ THE authoritative current-state ledger — the single answer to "what is
> the state of FlowPilot?". Every agent MUST read it before starting work and
> MUST update it after finishing a prompt. Keep updates MINIMAL: status,
> completed work, known issues, next step — not a historical diary.
> Historical implementation detail lives in Git history (`git log --oneline`,
> `git show <commit>`, release tags) and `DECISIONS.md`.
> Last updated: PROMPT-15 (Customers Directory + Customer Creation).
> Product version: **v0.13.1**.

## Current State (summary)

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`)
is implemented and verified prompt-by-prompt through the customers directory.
Complete: the booking core (dashboard, conversations inbox + detail,
appointments agenda/detail, services, settings, deterministic availability,
Smart Create steps 1–6 — review hands off to التأكيد, which creates the
appointment through the canonical `createAppointment` write path), the
customers directory (`/customers` list + search + creation, `/customers/[id]`
detail with appointment/conversation history, Smart Create Step 1
create-customer integration), the invitation-first auth lifecycle (data model
→ creation → acceptance → ADMIN activation → activation UI → onboarding
handoff), the 4-step onboarding wizard, and the ops toolchain (bootstrap/dev
scripts, doctor/verify/security, gated releases, Vercel deployment, demo
dataset, pilot distribution).

**Remaining Spec A placeholders:** business knowledge screen, team management
(incl. STAFF invitation/activation UX, invitation creation UI, token
delivery), staff area. The `/sign-up` placeholder page remains in code but is
superseded (invitation-first, DECISIONS #22).

**Quality:** `pnpm verify` green (lint/typecheck/format/build);
`pnpm security` clean; `pnpm run doctor` NOT READY on this device only
(placeholder `DATABASE_URL` — device-local, not a code defect).

## Completed Major Work

| Area                        | Highlights                                                                                                                                                                                                                                                                                                                                                                                      | Release         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Foundation                  | Next.js 16 + TS strict + Tailwind v4 + shadcn/ui, Better Auth, Prisma 7 / Neon, feature-based modular monolith, env fail-fast, PWA                                                                                                                                                                                                                                                              | v0.1.0          |
| Design system / RTL / PWA   | Arabic-first RTL tokens, AppShell (desktop right sidebar / mobile bottom nav), status system, PNG PWA icons                                                                                                                                                                                                                                                                                     | v0.1.0          |
| Database layer              | Full Spec A domain model + Invitation, repositories (only Prisma consumers), Zod DTOs, Arabic demo seed                                                                                                                                                                                                                                                                                         | v0.1.0          |
| Onboarding wizard           | 4-step operational-foundation wizard, smart resume, step guards, server-side completion guard, `Business.vertical` discovery metadata                                                                                                                                                                                                                                                           | v0.1.0 → v0.6.0 |
| Dashboard                   | Today-focused Admin dashboard (conversations needing attention, pending/confirmed appointments, today's agenda, quick actions)                                                                                                                                                                                                                                                                  | v0.1.0          |
| Conversations               | Inbox (search, status/assignee filters) + tenant-scoped detail thread, staff replies (transactional, optimistic), assignment/status actions                                                                                                                                                                                                                                                     | v0.1.0          |
| Appointments                | Agenda view by day + filters, detail with lifecycle actions, conflict-checked create/reschedule, status transition rules                                                                                                                                                                                                                                                                        | v0.1.0          |
| Polish pass                 | Loading/error/empty states everywhere, a11y fixes, Arabic pluralization, honest placeholders                                                                                                                                                                                                                                                                                                    | v0.1.0          |
| Auth architecture alignment | Invitation-first model locked (docs only): ONE Better Auth system, PLATFORM vs BUSINESS scopes, ADMIN/STAFF only, Platform Operator ≠ Business role                                                                                                                                                                                                                                             | DECISIONS #22   |
| Invitation foundation       | Secure token creation (hash-only persistence, 7-day expiry, duplicate-open guard), one-time atomic acceptance, ADMIN activation (Better Auth identity + membership, one-time `activatedAt`)                                                                                                                                                                                                     | v0.2.0–v0.4.0   |
| Activation UI               | Public `/invite/[token]` route: read-only pre-screen, activation form, typed Arabic states, safe sign-in → onboarding handoff; `/onboarding` ADMIN-only                                                                                                                                                                                                                                         | v0.5.0          |
| Onboarding UX completion    | Restructured to 4 steps, `vertical` metadata, smart resume redirector, review summary                                                                                                                                                                                                                                                                                                           | v0.6.0          |
| Services management         | `/services`: list/create/edit/activate/deactivate, ADMIN-only, tenant-scoped, role-scoped nav                                                                                                                                                                                                                                                                                                   | v0.7.0          |
| Business settings           | `/settings`: identity + booking behavior, `Business.confirmationMode` drives server-derived initial appointment status                                                                                                                                                                                                                                                                          | v0.8.0          |
| Smart availability          | Deterministic `getAvailability` (working hours + timezone + slot step + duration fit + conflict rule); `getAvailabilityAction` hook                                                                                                                                                                                                                                                             | v0.9.0          |
| Smart Create steps 1–3      | Customer search → service selection → date selection (6-step indicator, selections never reset)                                                                                                                                                                                                                                                                                                 | v0.10.0         |
| Smart Create step 4         | Real available-slot selection consuming the availability layer; explicit no-slots reasons; stale-selection protection                                                                                                                                                                                                                                                                           | v0.11.0         |
| Smart Create step 5         | Review with per-section تعديل affordances, missing-input protection, on-demand slot revalidation; verified review = hand-off to Step 6                                                                                                                                                                                                                                                          | v0.12.0         |
| Smart Create step 6         | التأكيد: final read-only summary + confirmation-mode behavior → creates through the canonical `createAppointment` path; typed failures incl. `SLOT_CONFLICT` recovery to Step 4; server-confirmed success state + detail-page navigation                                                                                                                                                        | v0.13.0         |
| Customers directory         | `/customers`: server-backed debounced search (name/phone), rows with last conversation/appointment, honest states; `/customers/[id]`: identity + notes + appointment/conversation history, all rows navigable; ONE canonical creation path (`createCustomerAction` → customers service, typed `DUPLICATE_PHONE`); Smart Create Step 1 composes the same create dialog (route-layer composition) | PROMPT-15       |
| Ops (DX, non-product)       | Cross-platform bootstrap/dev scripts, `pnpm run setup/doctor`, `pnpm verify`, `pnpm security` + pre-commit hook, gated `pnpm release`, Vercel deploy toolchain (`pnpm deploy*`), Egyptian demo dataset + `DEMO_MODE`, distribution docs                                                                                                                                                         | Ops 01–06       |
| Ops (ship tooling)          | Lightweight operator ship path `pnpm ship patch/minor` (`scripts/ship.mjs`, dependency-free Node; DECISIONS #26): safety validation → version bump → one conventional commit → annotated tag → push main + tag → published GitHub Release; never re-runs the full gate (the prompt's `pnpm verify` is the gate), never deploys or touches the DB; full `pnpm release` preserved unchanged       | Ops 07          |

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
- Customer creation does not collect email (Spec A minimum: name, phone,
  optional notes); customer edit/deletion is not exposed in the UI.
- A soft-deleted customer's phone still occupies the unique-per-business
  constraint: recreating that phone surfaces the duplicate-phone error
  instead of restoring the row (accepted at pilot scale; restore is a
  repository method away if evidence demands it).
- Directory reads cap at 20 customers/page (same cap as the booking search);
  no pagination UI (pilot scale).
- Appointments accept past dates at the domain level (the date step's
  `min=today` is a UX guard only).
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
  active (`core.hooksPath=.githooks`). Routine post-prompt shipping uses the
  lightweight operator path `pnpm ship patch/minor` (DECISIONS #26;
  `RELEASE_PROCESS.md → Lightweight Operator Ship`).
- Deploy: `pnpm deploy` / `deploy:preview` / `deploy:check` (gated; URL
  captured); `/api/health` reports version + DB reachability +
  `deploymentReady`. Guides: `VERCEL_DEPLOYMENT.md` (§0 = quick path),
  `ENVIRONMENT_VARIABLES.md`.
- Demo: Egyptian dataset (عيادة الابتسامة — 36 customers, 22 conversations,
  37 appointments) in `prisma/demo-data.ts`; `DEMO_MODE=true` re-seeds in dev
  launchers and every deploy. Docs: `DEMO_GUIDE.md`, `DEMO_SCRIPT.md`,
  `CLIENT_DEMO.md`. Demo logins (demo DBs only): `admin@flowpilot.app` /
  `Admin@1234`, `staff@flowpilot.app` / `Staff@1234`.
- Releases v0.1.0–v0.13.1 are published on GitHub (tags pushed; each has a
  GitHub Release; newest = Latest). Local and origin `main` are in sync.

## Unresolved User Actions (not code)

1. Make the GitHub repository **private** (currently public; required by
   `GITHUB_WORKFLOW.md` / DECISIONS #18).
2. Set a real `DATABASE_URL` in `.env.local` on this device (doctor gate).
3. For deployment: Vercel env vars (Production + Preview) + `pnpm db:deploy`
   against Neon from desktop/CI (`VERCEL_DEPLOYMENT.md`).

## PROMPT-15 — Customers Directory + Customer Creation

- **Scope:** the Spec A Customers area only — directory with search, customer
  detail (appointment + conversation history), ONE canonical customer
  creation path, and the smallest Smart Create Step 1 integration. No CRM
  features; no schema change.
- **Implementation:**
  - `src/features/customers/` (services-feature pattern): form schema derived
    from the shared customer validation contract (client NEVER sends
    `businessId`); `server/customer-service.ts` = THE single creation engine
    (tenant-scoped to the actor's session Business, duplicate phone → typed
    `DUPLICATE_PHONE`, DB unique-constraint error caught as fallback) plus
    the directory list/search reusing `CustomerRepository.listByBusiness`;
    `server/customer-queries.ts` = tenant-scoped detail read (fetch +
    ownership check; appointment history ≤ 50 + conversation history ≤ 50)
    with injectable deps; thin `"use server"` wrappers revalidating
    `/customers`, the created detail, and `/appointments/new`.
  - Repository additions only: `ConversationRepository.listByCustomer`
    (lightweight rows) and `AppointmentRepository.listRecentByCustomer`
    (optional `take`, default 3 preserves the conversation-detail behavior).
  - UI: `customers-directory.tsx` (debounced server search via TanStack
    Query, rows with name/phone/آخر محادثة/آخر موعد, count via
    `CUSTOMER_NOUNS`, honest empty/loading/error states, one primary action
    إضافة عميل); `customer-form-dialog.tsx` (name/phone/optional notes,
    Arabic validation, duplicate-phone error); `customer-detail-screen.tsx`
    (server-rendered: identity card + notes, سجل المواعيد and سجل المحادثات
    rows linking to the existing detail pages, primary action حجز موعد →
    `/appointments/new`).
  - Routes: `/customers` rewritten (session-derived Business + initial list);
    `/customers/[id]` + loading skeleton added. `useDebouncedValue` promoted
    to `src/hooks/` (documented cross-feature-hooks location).
  - Smart Create Step 1: `SmartCreateAppointment` accepts an optional
    `CustomerCreateDialog` component prop; `/appointments/new` composes the
    customers feature's `CustomerFormDialog` (route-layer composition —
    feature isolation preserved); the affordance appears ONLY in the two
    empty states; a created customer flows through the SAME `onSelect`
    mechanism. Steps/availability/review/confirmation untouched.
- **Tests:** temporary offline harness (removed after the run) — 67/67
  checks: real services/queries against in-memory stand-ins (list/search
  name/phone/empty/no-match, invalid + overlong inputs, hostile
  businessId/role stripped, cross-tenant + wrong-context + soft-deleted →
  null, duplicate active phone + P2002 → DUPLICATE_PHONE, storage failure,
  no-business actor, detail mapping incl. histories) + real markup
  assertions (directory rows/states, detail sections/links/status labels,
  Step 1 with/without the dialog — unchanged without it) + source-level
  wiring checks (single creation path, logical CSS, 360px patterns, step
  order unchanged).
- **Known limitations:** see "Key Known Limitations" (email not collected;
  no customer edit/delete UI; soft-deleted phone occupies the constraint;
  20/page cap).
- **Exact next step:** PROMPT-16 — Team Management (ADMIN/STAFF management,
  invitation/activation lifecycle UX, role behavior, minimum operational
  foundation for the Staff workspace).

## Next Step (product)

**PROMPT-16 — Team Management.** ADMIN/STAFF management, the
invitation/activation lifecycle UX (invitation creation UI, STAFF activation
workflow, token delivery), and the minimum operational foundation for the
Staff workspace. After that, the remaining Spec A placeholders (business
knowledge screen → staff area) proceed per the operator's choice. Spec A
exit criteria: see `SPEC_A.md → Spec Sequence & Exit Criteria`.

After each prompt: update this file (minimally) and append to
`DECISIONS.md` when a decision was made.

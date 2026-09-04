# FlowPilot — Build State

> ⚠️ THE authoritative current-state ledger — the single answer to "what is
> the state of FlowPilot?". Every agent MUST read it before starting work and
> MUST update it after finishing a prompt. Keep updates MINIMAL: status,
> completed work, known issues, next step — not a historical diary.
> Historical implementation detail lives in Git history (`git log --oneline`,
> `git show <commit>`, release tags) and `DECISIONS.md`.
> Last updated: PROMPT-19 (conversation engine slice).
> Product version: **v0.15.1** (pre-ship; operator bumps via `pnpm ship`).

## Current State (summary)

**Spec A — Discovery Foundation + Booking Core** (frozen scope: `SPEC_A.md`)
is implemented and verified prompt-by-prompt through the business knowledge
screen. Complete: the booking core (dashboard, conversations inbox + detail,
appointments agenda/detail, services, settings, deterministic availability,
Smart Create steps 1–6 — review hands off to التأكيد, which creates the
appointment through the canonical `createAppointment` write path), the
customers directory (`/customers` list + search + creation,
`/customers/[id]` detail with appointment/conversation history, Smart Create
Step 1 create-customer integration), team management (`/admin/team`: member
directory with roles/active states, STAFF invitation creation with one-time
manual link delivery, STAFF member activate/deactivate, generalized
invited-account activation for BOTH Business roles at `/invite/[token]`),
the invitation-first auth lifecycle (data model → creation → acceptance →
ADMIN/STAFF activation → activation UI → role-aware sign-in handoff →
onboarding handoff), the 4-step onboarding wizard, the STAFF operational
workspace (`/staff`: NEED_HUMAN human-handoff queue with takeover,
assigned-to-me section, appointment context — see PROMPT-17), the business
knowledge screen (`/settings/knowledge`: plain-text FAQ entries for the
future AI assistant — see PROMPT-18), the conversation engine slice
(PROMPT-19: provider-neutral inbound path + AI reply loop + transport
boundary — see below), and the ops toolchain
(bootstrap/dev scripts, doctor/verify/security, gated releases, Vercel
deployment, demo dataset, pilot distribution).

**All Spec A screens are implemented.** The `/sign-up` placeholder page
remains in code but is superseded (invitation-first, DECISIONS #22). The
Spec A exit-criteria conversation loop now exists in code shape: inbound
message → typed intent → safe AI reply or NEED_HUMAN → staff resolve →
book via Smart Create — but the two external providers (WhatsApp
transport, LLM inference) are intentionally NOT integrated (DECISIONS
#29: provider-neutral boundaries with deterministic offline
implementations; both remain operator decisions).

**Quality:** `pnpm verify` green (lint/typecheck/format/build);
`pnpm security` clean; `pnpm run doctor` NOT READY on this device only
(placeholder `DATABASE_URL` — device-local, not a code defect).

## Completed Major Work

| Area                        | Highlights                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Release         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Foundation                  | Next.js 16 + TS strict + Tailwind v4 + shadcn/ui, Better Auth, Prisma 7 / Neon, feature-based modular monolith, env fail-fast, PWA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | v0.1.0          |
| Design system / RTL / PWA   | Arabic-first RTL tokens, AppShell (desktop right sidebar / mobile bottom nav), status system, PNG PWA icons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | v0.1.0          |
| Database layer              | Full Spec A domain model + Invitation, repositories (only Prisma consumers), Zod DTOs, Arabic demo seed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | v0.1.0          |
| Onboarding wizard           | 4-step operational-foundation wizard, smart resume, step guards, server-side completion guard, `Business.vertical` discovery metadata                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | v0.1.0 → v0.6.0 |
| Dashboard                   | Today-focused Admin dashboard (conversations needing attention, pending/confirmed appointments, today's agenda, quick actions)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | v0.1.0          |
| Conversations               | Inbox (search, status/assignee filters) + tenant-scoped detail thread, staff replies (transactional, optimistic), assignment/status actions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | v0.1.0          |
| Appointments                | Agenda view by day + filters, detail with lifecycle actions, conflict-checked create/reschedule, status transition rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | v0.1.0          |
| Polish pass                 | Loading/error/empty states everywhere, a11y fixes, Arabic pluralization, honest placeholders                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | v0.1.0          |
| Auth architecture alignment | Invitation-first model locked (docs only): ONE Better Auth system, PLATFORM vs BUSINESS scopes, ADMIN/STAFF only, Platform Operator ≠ Business role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | DECISIONS #22   |
| Invitation foundation       | Secure token creation (hash-only persistence, 7-day expiry, duplicate-open guard), one-time atomic acceptance, ADMIN activation (Better Auth identity + membership, one-time `activatedAt`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | v0.2.0–v0.4.0   |
| Activation UI               | Public `/invite/[token]` route: read-only pre-screen, activation form, typed Arabic states, safe sign-in → onboarding handoff; `/onboarding` ADMIN-only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | v0.5.0          |
| Onboarding UX completion    | Restructured to 4 steps, `vertical` metadata, smart resume redirector, review summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | v0.6.0          |
| Services management         | `/services`: list/create/edit/activate/deactivate, ADMIN-only, tenant-scoped, role-scoped nav                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | v0.7.0          |
| Business settings           | `/settings`: identity + booking behavior, `Business.confirmationMode` drives server-derived initial appointment status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | v0.8.0          |
| Smart availability          | Deterministic `getAvailability` (working hours + timezone + slot step + duration fit + conflict rule); `getAvailabilityAction` hook                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | v0.9.0          |
| Smart Create steps 1–3      | Customer search → service selection → date selection (6-step indicator, selections never reset)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | v0.10.0         |
| Smart Create step 4         | Real available-slot selection consuming the availability layer; explicit no-slots reasons; stale-selection protection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | v0.11.0         |
| Smart Create step 5         | Review with per-section تعديل affordances, missing-input protection, on-demand slot revalidation; verified review = hand-off to Step 6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | v0.12.0         |
| Smart Create step 6         | التأكيد: final read-only summary + confirmation-mode behavior → creates through the canonical `createAppointment` path; typed failures incl. `SLOT_CONFLICT` recovery to Step 4; server-confirmed success state + detail-page navigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | v0.13.0         |
| Customers directory         | `/customers`: server-backed debounced search (name/phone), rows with last conversation/appointment, honest states; `/customers/[id]`: identity + notes + appointment/conversation history, all rows navigable; ONE canonical creation path (`createCustomerAction` → customers service, typed `DUPLICATE_PHONE`); Smart Create Step 1 composes the same create dialog (route-layer composition)                                                                                                                                                                                                                                                                                                                                                                                                                                                          | PROMPT-15       |
| Team management             | `/admin/team`: member directory (identity, ADMIN/STAFF role, active state, self marker), open STAFF invitations (pending/accepted states), ONE canonical add-staff path (`createStaffInvitation` → existing `createInvitation` service; email-only input, ADMIN-only, tenant-scoped, fixed STAFF role), one-time manual invite-link delivery in `StaffInviteDialog`, STAFF activate/deactivate via `User.isActive` (ADMIN targets blocked — no lockout); invited-account activation generalized to invitation-role-driven (`activateInvitedMember`/`activateInvitedAccount`, DECISIONS #27) — `/invite/[token]` activates BOTH roles with role-aware sign-in handoff (STAFF never sent to onboarding)                                                                                                                                                    | PROMPT-16       |
| Staff workspace             | `/staff` (STAFF-only, `(staff)` group): the human-handoff workspace — NEED_HUMAN queue (unassigned → mine → others) with takeover via the EXISTING `transitionConversation` action route-injected (one assignment system), assigned-to-me section, customer/last-message/status/activity/latest-appointment context rows; navigation made role-aware (staff see مهامي، not the admin dashboard); reply no longer silently reassigns owned conversations; conversation detail gains takeover for unassigned NEED_HUMAN (PROMPT-17, DECISIONS #28)                                                                                                                                                                                                                                                                                                         | PROMPT-17       |
| Business knowledge          | `/settings/knowledge`: ADMIN-only management of the plain-text FAQ/knowledge entries the future AI assistant will use (create/list/edit/confirmed remove, empty/loading/error/success states, question-as-natural-key semantics) over the canonical `Business.faqs` JSON field — ZERO schema changes, no RAG/vector/embeddings (PROMPT-18)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | PROMPT-18       |
| Conversation engine         | PROMPT-19 (DECISIONS #29): ONE canonical inbound path `POST /api/conversations/inbound` (token-gated by optional `INBOUND_WEBHOOK_TOKEN`, disabled/503 while unset) → `receiveInboundMessage` engine: business resolved ONLY by receiving WhatsApp number, customer `upsertByPhone`, latest-conversation reuse, CUSTOMER message persisted via the single `addMessage` write path (transport-owned `receivedAt` preserved), typed AI turn (`ConversationAi` interface — deterministic Arabic keyword/FAQ classifier, NO LLM) → verbatim-FAQ reply OR NEED_HUMAN handoff (all booking intents, ambiguity, sensitive language, human requests; booking handoffs note the intent in `aiSummary`), AI reply persisted + delivered via `MessageTransport` (offline logging adapter, NO live WhatsApp); engine never creates appointments; ZERO schema changes | PROMPT-19       |
| Ops (DX, non-product)       | Cross-platform bootstrap/dev scripts, `pnpm run setup/doctor`, `pnpm verify`, `pnpm security` + pre-commit hook, gated `pnpm release`, Vercel deploy toolchain (`pnpm deploy*`), Egyptian demo dataset + `DEMO_MODE`, distribution docs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Ops 01–06       |
| Ops (ship tooling)          | Lightweight operator ship path `pnpm ship patch/minor` (`scripts/ship.mjs`, dependency-free Node; DECISIONS #26): safety validation → version bump → one conventional commit → annotated tag → push main + tag → published GitHub Release; never re-runs the full gate (the prompt's `pnpm verify` is the gate), never deploys or touches the DB; full `pnpm release` preserved unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Ops 07          |

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
- WhatsApp transport is NOT live: the outbound boundary is the offline
  logging adapter behind `MessageTransport` (DECISIONS #29) and the
  inbound webhook is provider-neutral + token-gated, disabled (503)
  until `INBOUND_WEBHOOK_TOKEN` is set. A real WhatsApp provider is an
  undecided operator decision (it would also settle webhook signature
  verification and `Message.externalId` dedupe — a future migration).
- The AI assistant is a deterministic rule-based Arabic classifier behind
  the `ConversationAi` interface — NOT live LLM inference: keyword/phrase
  matching + verbatim `Business.faqs` answer matching. Phrasings outside
  the keyword tables / FAQ vocabulary land safely on NEED_HUMAN (never a
  fabricated answer, but more handoffs than an LLM would produce). A real
  AI provider is an undecided operator decision.
- No inbound message dedupe: `Message` has no `externalId` column
  (zero-schema-change outcome, DECISIONS #29), so a retried webhook
  appends a second customer message; customer/conversation resolution is
  idempotent (`upsertByPhone` + latest-thread reuse). The inbound
  contract already carries the optional `externalId` for the future
  provider decision.
- The engine never books: booking-related intents hand off to staff
  (NEED_HUMAN with an `aiSummary` intent note); the AI posts a polite
  acknowledgment message on handoff turns, and threads in any
  non-AI_ACTIVE state (or assigned) never receive AI interjections.
- The staff workspace queue reuses the inbox read (caps at 100
  conversations, no pagination) and shows the LATEST appointment per
  customer as context (not specifically the next upcoming one) — both
  accepted at pilot scale.
- Takeover/assignment ownership changes are explicit-action-only (DECISIONS
  #28); the workspace offers takeover ONLY for unassigned threads — taking
  over someone else's thread requires the conversation detail's explicit
  assignment path.
- Invitation token delivery is manual: the raw invite link is surfaced to
  the inviting ADMIN exactly once in the Team invite dialog (copy +
  "never shown again"); email/WhatsApp delivery is out of scope.
- Team management has no invitation-revocation UI (revocation stays a
  service-layer capability); a pending invitation simply expires after
  7 days, after which the same email can be re-invited.
- Only STAFF members can be deactivated/reactivated in the Team UI
  (ADMIN members are protected by design — no accidental business
  lockout; ADMIN membership management is not exposed).
- Knowledge entries are JSON rows of `Business.faqs`: no per-entry id,
  active state, or timestamps (the DECISIONS #13 shape is
  question/answer only) — removal is the supported state change, and
  the trimmed question is the workflow-enforced natural key (one entry
  per distinct question, 50-entry cap). JSON has no DB constraints, so
  the duplicate/cap guards are workflow-level (same accepted-race
  caveat as appointments/invitations at pilot scale).
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

## PROMPT-17 — Staff Area / Human Handoff UX

- **Scope:** the smallest complete STAFF operational workspace for the
  Human-in-the-Loop flow — NEED_HUMAN queue, safe takeover, reuse of the
  existing conversation detail + reply path, minimum customer/appointment
  context. No staff management, no permissions, no second
  conversation/assignment/auth system; ZERO schema changes.
- **Implementation:**
  - `src/features/staff/`: `workspace-service.ts` (`getStaffWorkspace` —
    STAFF-only, tenant-scoped from the session-derived actor, injectable
    repository deps; queue = all NEED_HUMAN ordered unassigned → mine →
    others, assigned section = actor's non-NEED_HUMAN threads; latest
    appointment per visible customer via ONE new repository read),
    `staff-workspace.tsx` (calm queue UI: identity, preview, activity,
    canonical status, assignment marker, appointment chip; per-row action =
    takeover for unassigned, follow-up links otherwise; honest
    empty/error states, duplicate-submit protection, `role="alert"` +
    `aria-live`), workspace types incl. the structural
    `TakeOverConversationAction` contract.
  - Routes: `/staff` page composes staff + conversations features (the
    conversations feature's `transitionConversation` is injected as the
    takeover prop — route-layer composition, feature isolation intact);
    `loading.tsx` skeleton; `(staff)` layout guard unchanged
    (`requireRole("STAFF")`, ADMIN unaffected).
  - Navigation: STAFF nav = مهامي + المحادثات + المواعيد; in `(app)`,
    staff see مهامي instead of the ADMIN dashboard item (`/` is
    ADMIN-only in nav — direct visits still redirect STAFF → `/staff`).
  - Conversations feature (minimal extensions): `sendStaffReply` takes
    ownership only when the thread is UNOWNED (previously reassigned on
    every reply — the silent steal; the detail UI's optimistic logic
    already assumed preserve-if-assigned); `refreshConversation`
    revalidates `/staff`; conversation detail offers تولّي المحادثة for
    unassigned NEED_HUMAN threads (previously only AI_ACTIVE).
  - `AppointmentRepository.listLatestByCustomers`: one business-scoped
    read for queue appointment context (repository-only Prisma preserved).
- **Tests:** temporary offline harness (removed after the run) — 62/62
  checks: real service logic against in-memory stand-ins (STAFF allowed,
  ADMIN/roleless rejected, tenant scoping captured at the repository
  boundary, queue filtering/priority/assignment discriminators,
  per-actor views, appointment mapping, load failure), real markup via
  `renderToStaticMarkup` (queue rendering, exactly one takeover button —
  unassigned only, معينة إليك/معينة إلى markers, links into
  `/conversations/[id]`, appointment context, empty states, aria-live,
  native buttons, 360px patterns), Zod hostile-input stripping
  (businessId/role/sender fields dropped), and source wiring checks
  (guards, cross-tenant rejection, single takeover path, logical CSS
  only, feature isolation, repository-only Prisma).
- **Known limitations:** see "Key Known Limitations" (queue reads cap at
  the inbox's 100 conversations; appointment context shows the LATEST
  appointment, not specifically the next upcoming one).
- **Exact next step:** PROMPT-18 — the last Spec A screen placeholder:
  the business knowledge screen (`/settings/knowledge`, Spec A §6).

## PROMPT-18 — Business Knowledge Screen

- **Objective:** Spec A §6 — give the authenticated Business ADMIN a
  small, clear, Arabic-first interface for maintaining the plain-text
  business knowledge the future AI assistant will use when answering
  customer questions (prices, policies, preparation instructions,
  recurring questions). Content management only — NOT an AI system,
  no RAG/vector DB/embeddings, no vertical-specific fields.
- **Implemented scope:** `/settings/knowledge` (ADMIN-only route) +
  the isolated `src/features/knowledge` feature: list entries, create
  (إضافة معلومة), edit (by current question), confirmed remove, useful
  empty state, route loading skeleton, honest load-failure state with
  retry, inline Arabic validation, calm success confirmation,
  mobile-first single-column cards (usable at 360px), full RTL/logical
  CSS, count live-region, and a settings-screen link card for
  discoverability. Categories (أسعار/سياسات/تعليمات/أسئلة متكررة) are
  copy guidance only — the data model stays question/answer.
- **Files changed:** new `src/features/knowledge/` (types, schemas,
  service, actions, screen + form/remove dialogs, README); new
  `src/app/(app)/settings/knowledge/{page,loading}.tsx`; modified
  `src/lib/validation/business.ts` (exported the existing `faqSchema`
  as `faqEntrySchema` with Arabic bound messages), `src/lib/arabic.ts`
  (`KNOWLEDGE_NOUNS`), `src/features/settings/components/settings-screen.tsx`
  (link card), docs.
- **Database/migration result:** ZERO schema changes — the canonical
  storage is the existing `Business.faqs` JSON field (DECISIONS #13,
  migration `20260826120000_onboarding_fields`); entries read/written
  whole through `businessRepository.update`. No second knowledge
  system. No migration authored or applied.
- **Authorization/tenancy:** ADMIN-only (page `requireRole("ADMIN")`
  redirect + service-layer `resolveScope` role check on every
  operation + action actor built from session → DB user with
  least-privilege fallback); the Business is ALWAYS derived
  server-side from the authenticated actor — client `businessId`/
  role keys are stripped by Zod and can never target another tenant
  (writes go only to the actor's own business row).
- **Tests:** temporary offline harness (removed after the run) —
  48/48 checks: real service logic against in-memory repository
  stand-ins (ADMIN list/create/edit/remove, STAFF forbidden on all
  operations, businessless ADMIN rejected, duplicate question and
  50-entry cap rejected, stale natural-key edits/removes fail
  honestly, malformed stored JSON fails honestly with no rewrite,
  tenant scoping captured at the repository boundary, hostile
  businessId/role stripped), real markup via `renderToStaticMarkup`
  (entries, exactly one primary action, edit/remove per entry, empty
  state, count live-region, the assistant mental-model line), Zod
  validation contracts (empty/oversized Arabic messages, trimming,
  shared array cap), and source wiring checks (repository-only
  Prisma, feature isolation, server-derived tenant, one canonical
  storage, route thinness, no physical left/right CSS, no
  RAG/vector/embedding code).
- **Quality gates:** `pnpm db:generate`, `pnpm lint`,
  `pnpm typecheck`, `pnpm format:check` (after one `pnpm format`
  pass), `pnpm verify` (lint + typecheck + format + webpack build —
  `/settings/knowledge` present in the route table), `pnpm security`
  — ALL GREEN. No DB runtime check needed (no migration; the demo
  DB's seeded FAQs render through the normal read path).
- **Known limitations:** see "Key Known Limitations" (JSON entry
  shape: no per-entry id/active state/timestamps; question natural
  key with workflow-level guards).
- **Exact next step:** PROMPT-19 — with every Spec A screen now
  implemented, close the Spec A exit-criteria gap: the conversation
  engine slice (WhatsApp message transport + the AI assistant reply
  path behind the existing interfaces, Spec A §8), so a real
  conversation can flow customer message → reply → booked
  appointment.

## PROMPT-19 — Conversation Engine Slice

- **Scope (DECISIONS #29):** the Spec A exit-criteria gap — the smallest
  production-shaped engine that turns an incoming WhatsApp-style customer
  message into a safe assistant reply: inbound → business/customer/
  conversation resolution → message persistence → typed intent → AI
  reply OR NEED_HUMAN → reply persistence → existing conversation UI.
  No vendor integrations, no RAG/embeddings, no second conversation/
  booking/customer system, no UI redesign, ZERO schema changes.
- **Implemented:**
  - `src/features/conversations/server/conversation-engine.ts` —
    `receiveInboundMessage`: business resolved ONLY by the receiving
    WhatsApp number (`findByWhatsappNumber`, active-only), customer via
    the EXISTING `upsertByPhone` (phone-derived placeholder name),
    conversation via EXISTING latest-thread reuse, CUSTOMER message via
    the single `addMessage` write path (transport-owned `receivedAt`
    persisted as `createdAt`), AI turn ONLY on unassigned AI_ACTIVE
    threads (everything else routes to staff attention preserving
    assignment), AI output validated before persistence and failing
    safe to a silent handoff, AI reply persisted as sender `AI` with the
    workflow the turn decided, booking handoffs note the intent in the
    EXISTING `aiSummary` field (never clobbering staff summaries),
    best-effort outbound delivery. Injectable deps (repository singletons
    - boundaries by default).
  - `src/features/conversations/server/conversation-ai.ts` —
    `ConversationAi` interface + `AiTurnResult` typed union
    (`reply`/`handoff`/`booking_handoff`) + the minimal intent model
    (FAQ, BOOKING, AVAILABILITY, RESCHEDULE, CANCELLATION, HUMAN_REQUEST,
    AMBIGUOUS) + `deterministicConversationAi`: Arabic normalization
    (diacritics/tatweel/alef/ya/ta-marbuta, article stripping) with
    keyword/phrase classification and verbatim FAQ matching — FAQ replies
    are the stored answer text; every unsafe or booking-related case
    hands off. NO LLM.
  - `src/features/conversations/server/conversation-transport.ts` —
    `MessageTransport` interface + the offline logging adapter (the only
    approved outbound seam; NOT live WhatsApp).
  - `POST /api/conversations/inbound` (thin route) — shared-secret token
    gate (`INBOUND_WEBHOOK_TOKEN`, optional env — route disabled/503
    while unset, constant-time compare), JSON parse → engine → typed
    JSON result, revalidates `/conversations`, `/conversations/[id]`,
    `/`, `/staff` so the EXISTING inbox/detail/staff workspace surfaces
    reflect the new state (zero UI changes: the detail page already
    renders AI messages and NEED_HUMAN badges).
  - `inboundMessageSchema` (feature) — canonical inbound contract
    (`to`/`from`/`text`/`receivedAt`, optional `externalId`); Zod strips
    hostile `businessId`/`role`/internal ids. `CreateMessageDto` gained
    an optional `createdAt` (transport-owned receive timestamp).
- **Honest state:** NO live WhatsApp transport and NO live AI inference —
  both boundaries are provider-neutral with deterministic offline
  implementations, and both real providers are explicitly undecided
  operator decisions (see Known Limitations).
- **Tests:** temporary offline harness (removed after the run) — 76/76
  checks: real engine logic against in-memory repository stand-ins and a
  recording transport (FAQ reply verbatim from `Business.faqs`, booking/
  availability/reschedule/cancellation classification → NEED_HUMAN +
  `aiSummary` intent notes, human-request and sensitive and ambiguous →
  handoff, no-knowledge questions never fabricate, malformed input typed
  failures, duplicate inbound behavior, tenant isolation by receiving
  number incl. inactive/unknown businesses, hostile `businessId`/`role`
  stripping, AI-reply persistence through `addMessage` with
  `lastMessageAt` advance, AI deferral on staff-owned/BOOKED threads, AI
  exception/invalid-output fail-safe handoffs, real markup via
  `renderToStaticMarkup` (existing ConversationDetail renders engine
  output: AI bubble المساعد الذكي, NEED_HUMAN badge, engine-written
  `aiSummary`, logical CSS only), and source wiring checks
  (repository-only Prisma, single message write path, no appointment
  imports in the engine, thin route, provider-neutral boundaries).
- **Exact next step:** PROMPT-20 (operator decision required) — approve
  or defer the two real provider integrations that finish Spec A's
  exit criteria end-to-end: (1) the WhatsApp provider (vendor, webhook
  signature verification, `Message.externalId` + migration for inbound
  dedupe) and (2) the AI provider (LLM behind `ConversationAi`).
  Until decided, the engine is verified offline and demo-able through
  the seeded conversations + the token-gated webhook.

## Next Step (product)

**PROMPT-20 — provider decisions (operator gate):** the conversation
engine slice (PROMPT-19, DECISIONS #29) completed Spec A's screen +
flow scope with provider-neutral boundaries. The remaining Spec A exit
criteria require TWO operator decisions recorded in `DECISIONS.md`
before implementation: the real WhatsApp transport provider and the
real AI (LLM) provider. Spec A implementation itself is COMPLETE.

After each prompt: update this file (minimally) and append to
`DECISIONS.md` when a decision was made.

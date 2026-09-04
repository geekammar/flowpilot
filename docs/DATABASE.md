# Database Layer

PostgreSQL (Neon) · Prisma 7 · UUID primary keys everywhere.

## Entities & Relationships (Current Implemented Model)

```
Business 1 ──* User            (staff/admin belong to one business)
Business 1 ──* Service
Business 1 ──* Customer
Business 1 ──* Conversation    Conversation *──1 Customer
Conversation 1 ──* Message     Message *──1 User?  (via conversation assignee)
Business 1 ──* Appointment     Appointment *──1 Customer / Service / User?
Business 1 ──* Invitation      Invitation *──1 User?  (nullable invitedBy)
```

| Entity       | Table           | Soft delete           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | --------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business     | `businesses`    | ✔                     | Root tenant. `workingHours` is JSON. `vertical` (nullable TEXT, migration `20260903130000_business_vertical`, PROMPT-07) is discovery METADATA — a stable machine key validated by the Zod union `VERTICAL_VALUES` in `src/lib/validation/business.ts`; extending the list needs no migration and is never permission for vertical-specific UI. `confirmationMode` (NOT NULL TEXT default `'manual'`, migration `20260903140000_business_confirmation_mode`, PROMPT-09) is booking behavior — `manual` (new appointments PENDING) or `automatic` (CONFIRMED on creation), validated by the Zod union `CONFIRMATION_MODE_VALUES`; the initial appointment status is derived server-side from this field, never from client input. |
| User         | `users`         | ✖ (`isActive`)        | Shared table with Better Auth; domain fields: `businessId`, `role`, `isActive`. Avatar = Better Auth `image`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Service      | `services`      | ✔                     | `durationMinutes` drives appointment end times.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Customer     | `customers`     | ✔                     | Unique per business phone: `@@unique([businessId, phone])`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Conversation | `conversations` | ✔                     | One active thread per customer flow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Message      | `messages`      | ✖ (immutable log)     | Append-only; deleted with its conversation (cascade).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Appointment  | `appointments`  | ✔                     | `date` (@db.Date) + `startTime`/`endTime` (@db.Time).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Invitation   | `invitations`   | ✖ (derived lifecycle) | Domain concept separate from Better Auth (DECISIONS #22). Only the token **hash** is stored (unique). Lifecycle from `acceptedAt`/`revokedAt`/`expiresAt`/`activatedAt` — no status enum, no `deletedAt`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Enums

- **UserRole** — `ADMIN`, `STAFF` (also the Invitation role — Business
  roles only; no platform role exists)
- **ConversationStatus** — `AI_ACTIVE`, `NEED_HUMAN`, `BOOKED`, `INCOMPLETE`
- **MessageSenderType** — `CUSTOMER`, `AI`, `STAFF`
- **AppointmentStatus** — `PENDING`, `CONFIRMED`, `CANCELLED`, `NO_SHOW`, `COMPLETED`

## Indexes

Practical indexes on every foreign key plus:

- `customers(phone)`, `customers(businessId, phone)` (unique)
- `conversations(businessId, status)`, `conversations(lastMessageAt)`
- `appointments(status)`, `appointments(businessId, date)`
- `messages(conversationId, createdAt)`
- `services(businessId, isActive)`
- `invitations(tokenHash)` (unique), `invitations(businessId)`,
  `invitations(businessId, email)` — no `expiresAt`/`invitedById` indexes
  yet (no query patterns; add when operations demand them)

## Soft Delete Policy

Reads always filter `deletedAt: null` (enforced inside repositories).
Deletes set `deletedAt` (and usually `isActive: false`). Restore clears the
flag. Messages are immutable and cascade with their conversation.
Hard deletes happen only via DB cascades from a parent row.

## Target Authorization / Invitation Model

> Locked conceptually in Prompt 09 (Auth & User Management Architecture
> Alignment; `DECISIONS.md` #22). Split status: the **Invitation data
> model is IMPLEMENTED** (Prompt 10), the **Invitation creation
> workflow is IMPLEMENTED** (PROMPT-03), the **Invitation acceptance
> workflow is IMPLEMENTED** (PROMPT-04), and the **ADMIN account
> activation workflow is IMPLEMENTED** (PROMPT-05) — see the four
> "CURRENT IMPLEMENTED" subsections below; everything else in this
> section is **"Planned / next implementation step"** — no Prisma
> fields, tables, enums, or migrations exist for those parts yet.

### CURRENT IMPLEMENTED — Invitation model (Prompt 10)

Table `invitations` (migration `20260902120000_invitation_model`):

- `id` UUID PK, `createdAt`/`updatedAt`
- `email` TEXT — the invited address (NOT unique: the same email may
  be invited by different Businesses, and re-invited after expiry/revocation)
- `business_id` FK → `businesses` (`ON DELETE CASCADE`) — tenant scope
- `role` `UserRole` — reuses the Business role system (`ADMIN`/`STAFF`)
- `token_hash` TEXT **unique** — secure hash of the invitation token;
  the raw token is NEVER stored
- `expires_at`, nullable `accepted_at`, nullable `revoked_at`
- nullable `activated_at` (added in PROMPT-05, migration
  `20260903120000_invitation_activation`) — set exactly once when
  account activation completes; the one-time activation guarantee
- nullable `invited_by_id` FK → `users` (`ON DELETE SET NULL`) —
  nullable because a required relation would block future
  platform-level provisioning (Platform Operator is not a Business
  User; DECISIONS #22)

Indexes: unique `invitations(token_hash)`, `invitations(business_id)`,
`invitations(business_id, email)`.

Lifecycle representation — **derived, no persisted status enum and no
`deletedAt`**:

- Pending: `acceptedAt` null AND `revokedAt` null AND `expiresAt` future
- Accepted: `acceptedAt` set AND `activatedAt` null
- Activated: `acceptedAt` set AND `activatedAt` set (activation
  completed — PROMPT-05)
- Revoked: `revokedAt` set
- Expired: pending AND `expiresAt` past

### CURRENT IMPLEMENTED — Invitation creation workflow (PROMPT-03)

Server/domain foundation on top of the data model (no UI, no
acceptance, no activation, no delivery):

- **Token security** (`src/server/security/invitation-token.ts`):
  raw token = 256 bits of CSPRNG, URL-safe base64url; only its SHA-256
  hex hash is persistable. The raw token is returned from creation
  exactly once and is never logged (DECISIONS #23).
- **Expiration policy** (centralized in the invitation service):
  `expiresAt = creation + 7 days` (`INVITATION_EXPIRY_DAYS`).
- **Email normalization**: trim + lowercase, defined once in the
  invitation workflow schema; the same normalized form is used for
  duplicate detection, persistence, and listing. No DB uniqueness on
  `(businessId, email)` — prevention lives in the workflow.
- **Duplicate-open prevention**
  (`InvitationRepository.createIfNoOpenInvitation`): transaction-scoped
  check-then-create — a second OPEN invitation (same Business +
  normalized email, not accepted/revoked/expired) is refused with a
  typed conflict error. Expired, revoked, and accepted invitations
  never block a new one. Same accepted race caveat as appointment
  conflicts (pilot volume).
- **Business-scoped operations**: `createInvitation` (verifies the
  Business via the repository first), `listInvitations` (tenant-scoped,
  newest-first, paginated, derived status, hash excluded), and
  `revokeInvitation` (accepted → invalid state; already-revoked →
  idempotent success; pending, including expired-pending → revoked).
- **Result shape**: typed results with Arabic messages and codes
  INVALID_INPUT / BUSINESS_NOT_FOUND / INVITATION_ALREADY_OPEN /
  INVITATION_NOT_FOUND / INVALID_INVITATION_STATE / PERSISTENCE_FAILED;
  `tokenHash` never leaves the repository layer.

### CURRENT IMPLEMENTED — Invitation acceptance workflow (PROMPT-04)

One-time, atomic, token-based acceptance on top of the data model (no
UI, no account activation, no password, no User creation, no
delivery):

- **Acceptance primitive**
  (`InvitationRepository.acceptPendingInvitation(tokenHash)`): a
  single conditional `updateMany` (pending + unrevoked + unexpired)
  inside a transaction followed by a re-read of the accepted row. The
  guard lives in the UPDATE's WHERE clause itself, so a concurrent
  acceptance, revocation, or expiry updates zero rows and safely
  returns null — two concurrent acceptances cannot both succeed.
  Token-hash is the lookup boundary (unique index); no
  client-provided `businessId` is trusted — the invitation record is
  the sole authority for email/businessId/role.
- **Acceptance workflow** (`acceptInvitation` service operation):
  Zod-validated raw token (non-empty, ≤256, base64url charset) →
  hashed with the EXISTING `hashInvitationToken` utility →
  hash-only lookup → lifecycle evaluation via `deriveInvitationStatus`
  (the centralized expiry policy is enforced here at the workflow
  layer) → atomic conditional acceptance → race-safe failure
  re-classification → safe `InvitationView` result.
- **One-time semantics**: after acceptance the invitation is
  terminally accepted; a second attempt (sequential or concurrent)
  fails with `INVITATION_ALREADY_ACCEPTED` — acceptance is never
  idempotent-successful.
- **Result shape**: typed results with Arabic messages; codes
  INVALID_INPUT / INVITATION_NOT_FOUND (generic for unknown or
  invalid tokens — the message does not differentiate token states) /
  INVITATION_ALREADY_ACCEPTED / INVITATION_REVOKED /
  INVITATION_EXPIRED / PERSISTENCE_FAILED. The result excludes both
  the raw token and the `tokenHash`; neither is ever logged.

### CURRENT IMPLEMENTED — ADMIN account activation workflow (PROMPT-05)

Connects an accepted ADMIN invitation to a real Better Auth identity
and activates the Business ADMIN account (no UI, no session handling
at this layer, no onboarding, no STAFF activation):

- **Eligibility** (`activateAdminAccount` service operation): the
  persisted invitation (located by token hash only) must be role
  ADMIN, previously accepted, not revoked, and not yet activated.
  Pending invitations (including expired-pending) and STAFF
  invitations are rejected with typed Arabic errors
  (`INVITATION_NOT_ACCEPTED` / `INVITATION_EXPIRED` /
  `INVITATION_REVOKED` / `ROLE_NOT_ALLOWED`); already-activated
  invitations return `ACCOUNT_ALREADY_ACTIVATED`. Expiry only gates
  PENDING invitations — acceptance already ran inside the validity
  window. The invitation is the sole authority for
  email/businessId/role; the input schema accepts only token, name,
  and password (Zod strips everything else — callers cannot override
  business, role, or email).
- **Identity creation** (Better Auth boundary): an injectable
  `IdentityCreator` (default: the installed version's official
  server-side `auth.api.signUpEmail`) creates the email/password
  identity for the invitation email. Better Auth owns the password
  hash, the credential account row, and any session; only `user.id`
  crosses back into the domain. The prismaAdapter now runs with its
  public `transaction: true` option, so the user + credential account
  rows are created atomically inside Better Auth. Password bounds in
  the input schema mirror Better Auth's configured defaults (8–128);
  no separate password policy is invented.
- **One identity per email**: existing identities are never
  duplicated, never password-reset, and never silently moved or
  promoted. Same-Business ADMIN identities resume activation
  idempotently (`identityCreated: false`); never-assigned identities
  (businessId null — the interrupted-activation recovery path) are
  attached; other-Business identities and same-Business STAFF
  identities are rejected with `ACCOUNT_CONFLICT`. A USER_ALREADY_
  EXISTS race inside Better Auth is re-read and classified the same
  way.
- **Atomic activation**
  (`InvitationRepository.activateInvitedAdmin`): ONE Prisma
  transaction that (1) conditionally sets `invitations.activatedAt`
  (one-time guard — concurrent activations serialize and the loser
  reads ALREADY_ACTIVATED) and (2) conditionally attaches the Business
  membership (`businessId`, `role: ADMIN`, `isActive: true`) only when
  the user row is `businessId IS NULL` or already ADMIN of the SAME
  Business; otherwise the throw rolls the whole transaction back. The
  membership attach is therefore race-safe even when two Businesses
  invite the same email concurrently.
- **Cross-boundary consistency**: Better Auth identity creation and
  the FlowPilot membership write are two sequential atomic phases
  (no shared transaction is possible through the supported Better
  Auth API). An interruption between them leaves a recoverable state
  — the invitation stays unactivated while the identity has zero
  privileges (no Business membership, no platform marker) — and a
  retry resumes idempotently without creating a second identity or
  touching the existing password. The reverse inconsistency (ADMIN
  active without an identity) cannot occur because membership is only
  written after the identity exists.
- **Result shape**: safe data only — the invitation view (now with
  `activatedAt`), `userId`, and `identityCreated`. Never the raw
  token, the hash, the password, or any session token.

### PLANNED (not yet implemented — do not assume these exist)

- STAFF activation (the STAFF analog of the ADMIN activation
  operation)
- Token delivery (email / WhatsApp link to the invitee)
- Activation UI (`/invite/[token]`-style route) and the
  activation→onboarding connection (PROMPT-06)
- Platform Operator identity / platform-level authorization marker
  (`accountType` discriminator from the target model below — deferred
  until a platform identity is actually implemented; PROMPT-05
  creates BUSINESS identities only and never infers platform access
  from `businessId = null`)

### Target conceptual account model (planned)

| Account        | accountType | businessId   | Business role |
| -------------- | ----------- | ------------ | ------------- |
| PLATFORM USER  | `PLATFORM`  | `null`       | `null`        |
| BUSINESS ADMIN | `BUSINESS`  | `<business>` | `ADMIN`       |
| BUSINESS STAFF | `BUSINESS`  | `<business>` | `STAFF`       |

- The `User` remains the authentication identity (Better Auth) with an
  account scope/type, an optional business association, a business role
  where applicable, and an active/inactive state.
- `UserRole` stays `ADMIN` / `STAFF` — Business roles only. The Platform
  Operator is NOT a `UserRole` value and is not a Business User.
- Platform access uses an explicit platform-level authorization marker — it
  must NEVER be inferred from `businessId = null`.

### Target lifecycles (conceptual)

- **Business:** `PROVISIONED → ACTIVE → DEACTIVATED` — planned (no such
  states on `businesses` yet)
- **Invitation:** `PENDING → ACCEPTED / EXPIRED / REVOKED` — the data
  representation is implemented (derived, above); creation
  (PROMPT-03), acceptance (PROMPT-04), and ADMIN activation
  (PROMPT-05: accepted → activated via `activatedAt`) workflows are
  implemented; token delivery is planned
- **Business User:** `INVITED → ACTIVE → DEACTIVATED` (an ACTIVE user may
  return to ACTIVE after reactivation) — planned

## Validation Layer (`src/lib/validation`)

Zod v4 schemas per entity, Arabic error messages:

| File              | Exports                                                                                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common.ts`       | `uuidSchema`, `phoneSchema`, `emailSchema`, `timeSchema`, working-hours schemas, pagination helpers                                                                                                                                                                                             |
| `business.ts`     | `CreateBusinessDto`, `UpdateBusinessDto`, `VERTICALS`/`VERTICAL_VALUES`/`VERTICAL_LABELS` + `verticalSchema` (PROMPT-07), `CONFIRMATION_MODE_VALUES`/`CONFIRMATION_MODES` + `confirmationModeSchema` + `TIMEZONES` (PROMPT-09; TIMEZONES promoted from the onboarding feature — shared by both) |
| `service.ts`      | `CreateServiceDto`, `UpdateServiceDto`                                                                                                                                                                                                                                                          |
| `customer.ts`     | `CreateCustomerDto`, `UpdateCustomerDto`                                                                                                                                                                                                                                                        |
| `conversation.ts` | conversation + message DTOs and status/sender literal unions                                                                                                                                                                                                                                    |
| `appointment.ts`  | appointment DTOs (cross-field refine: end > start), status union                                                                                                                                                                                                                                |
| `user.ts`         | user DTOs (identity itself stays in Better Auth)                                                                                                                                                                                                                                                |

DTOs are the repository input contract — controllers/routes validate with
Zod, then pass typed DTOs down. Never pass raw request objects further.

## Repository Layer (`src/server/repositories`)

One class per entity; singletons exported from `index.ts`.
Features must depend on repositories, not on `db` directly.

Highlights:

- `CustomerRepository.upsertByPhone` — idempotent entry point for inbound
  WhatsApp contacts.
- `ConversationRepository.addMessage` — creates the message and advances
  `lastMessageAt` in one transaction (the only message write path).
- `AppointmentRepository.hasConflict` — overlap check for scheduling
  (`PENDING`/`CONFIRMED` only, optional staff scope, exclusion-aware).
- `AppointmentRepository.listBlockingForDate` — availability read
  (PROMPT-10): tenant-scoped blocking intervals for one date
  (`PENDING`/`CONFIRMED`, `deletedAt: null`), returned as plain
  business-local `"HH:mm"` start/end pairs — the read-side twin of the
  write-path conflict rule, consumed by the appointments availability
  service.
- `AppointmentRepository` converts validated `"YYYY-MM-DD"`/`"HH:mm"` strings
  to Prisma `@db.Date`/`@db.Time` values internally.
- `UserRepository.assignToBusiness` — links an authenticated user during
  onboarding (defaults to `ADMIN`); `UserRepository.findByEmail` —
  identity lookup for the invitation activation workflow's collision
  handling (Better Auth owns email uniqueness).
- `InvitationRepository` — data primitives + the creation guard and
  the acceptance/activation primitives (DECISIONS #22): `create`,
  `createIfNoOpenInvitation` (transactional duplicate-open guard,
  PROMPT-03), `findByTokenHash` (hash-only lookup),
  `findByIdWithinBusiness`, `listByBusiness` (tenant-scoped; no global
  list), guarded `revoke` / `markAccepted` (only while pending —
  business-scoped state primitives), `acceptPendingInvitation`
  (PROMPT-04: atomic conditional PENDING→ACCEPTED transition by token
  hash, including expiry enforcement at the database level), and
  `activateInvitedAdmin` (PROMPT-05: atomic one-time `activatedAt`
  mark + conditional Business ADMIN membership attach in one
  transaction — never promotes STAFF, never steals cross-Business
  users, rolls back fully on conflict). No `deletedAt` filter: the
  entity has no soft delete.

## Seeding

Realistic Arabic demo data — Egyptian dental clinic **عيادة الابتسامة**
(كفر الشيخ, Africa/Cairo, WhatsApp +20). Dataset lives in
`prisma/demo-data.ts` (pure, deterministic, no DB imports) and is consumed by
`prisma/seed.ts`:

```bash
pnpm db:migrate   # create/apply schema
pnpm db:seed      # tsx prisma/seed.ts
pnpm db:studio    # inspect
```

Seeds:

- Business: vertical `dental` (discovery metadata), working hours (الجمعة
  مساءً فقط), 5 FAQs (أسعار/تأمين/أطفال/عنوان/تقسيط), cancellation policy,
  completed onboarding
- Team with Better Auth credential accounts — demo login:
  `admin@flowpilot.app` / `Admin@1234` (د. سارة محمود الشريف) and
  `staff@flowpilot.app` / `Staff@1234` (نورهان السيد) — demo DBs only
- 6 services (كشف · تنظيف · حشو · علاج عصب · تبييض · تاج زيركون)
- 36 customers — Egyptian names, deterministic `+20 (10|11|12|15)` phones
- 22 conversations (73 messages) in Egyptian colloquial Arabic covering all
  statuses: bookings confirmed end-to-end, reschedule + emergency + complaint
  handoffs (`NEED_HUMAN`), FAQ answers (`AI_ACTIVE`), dropped-off threads
  (`INCOMPLETE`)
- 37 appointments across the last ~2 weeks and next week: 14 completed ·
  11 confirmed · 9 pending · 2 cancelled · 1 no-show — 4 today (3 confirmed +
  1 pending) so the dashboard looks alive right after login

Re-running is idempotent and only wipes rows of the demo business (scoped by
business ID). All IDs, phones, and offsets are deterministic, so every seed
run produces the same demo state. Demo walkthrough: `DEMO_GUIDE.md`;
auto-seed via `DEMO_MODE=true` in dev launchers: `ENVIRONMENT_VARIABLES.md`.

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

| Entity       | Table           | Soft delete           | Notes                                                                                                                                                                                       |
| ------------ | --------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business     | `businesses`    | ✔                     | Root tenant. `workingHours` is JSON.                                                                                                                                                        |
| User         | `users`         | ✖ (`isActive`)        | Shared table with Better Auth; domain fields: `businessId`, `role`, `isActive`. Avatar = Better Auth `image`.                                                                               |
| Service      | `services`      | ✔                     | `durationMinutes` drives appointment end times.                                                                                                                                             |
| Customer     | `customers`     | ✔                     | Unique per business phone: `@@unique([businessId, phone])`.                                                                                                                                 |
| Conversation | `conversations` | ✔                     | One active thread per customer flow.                                                                                                                                                        |
| Message      | `messages`      | ✖ (immutable log)     | Append-only; deleted with its conversation (cascade).                                                                                                                                       |
| Appointment  | `appointments`  | ✔                     | `date` (@db.Date) + `startTime`/`endTime` (@db.Time).                                                                                                                                       |
| Invitation   | `invitations`   | ✖ (derived lifecycle) | Domain concept separate from Better Auth (DECISIONS #22). Only the token **hash** is stored (unique). Lifecycle from `acceptedAt`/`revokedAt`/`expiresAt` — no status enum, no `deletedAt`. |

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
> model is IMPLEMENTED** (Prompt 10) and the **Invitation creation
> workflow is IMPLEMENTED** (PROMPT-03) — see the two "CURRENT
> IMPLEMENTED" subsections below; everything else in this section is
> **"Planned / next implementation step"** — no Prisma fields, tables,
> enums, or migrations exist for those parts yet.

### CURRENT IMPLEMENTED — Invitation model (Prompt 10)

Table `invitations` (migration `20260902120000_invitation_model`):

- `id` UUID PK, `createdAt`/`updatedAt`
- `email` TEXT — the invited address (NOT unique: the same email may be
  invited by different Businesses, and re-invited after expiry/revocation)
- `business_id` FK → `businesses` (`ON DELETE CASCADE`) — tenant scope
- `role` `UserRole` — reuses the Business role system (`ADMIN`/`STAFF`)
- `token_hash` TEXT **unique** — secure hash of the invitation token;
  the raw token is NEVER stored
- `expires_at`, nullable `accepted_at`, nullable `revoked_at`
- nullable `invited_by_id` FK → `users` (`ON DELETE SET NULL`) —
  nullable because a required relation would block future
  platform-level provisioning (Platform Operator is not a Business
  User; DECISIONS #22)

Indexes: unique `invitations(token_hash)`, `invitations(business_id)`,
`invitations(business_id, email)`.

Lifecycle representation — **derived, no persisted status enum and no
`deletedAt`**:

- Pending: `acceptedAt` null AND `revokedAt` null AND `expiresAt` future
- Accepted: `acceptedAt` set
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

### PLANNED (not yet implemented — do not assume these exist)

- Invitation acceptance workflow (incl. expiry enforcement)
- ADMIN activation / STAFF activation (password setup)
- Token delivery (email / WhatsApp link to the invitee)
- Platform Operator identity / platform-level authorization marker

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
  representation is implemented (derived, above); the workflows driving
  the transitions are planned
- **Business User:** `INVITED → ACTIVE → DEACTIVATED` (an ACTIVE user may
  return to ACTIVE after reactivation) — planned

## Validation Layer (`src/lib/validation`)

Zod v4 schemas per entity, Arabic error messages:

| File              | Exports                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `common.ts`       | `uuidSchema`, `phoneSchema`, `emailSchema`, `timeSchema`, working-hours schemas, pagination helpers |
| `business.ts`     | `CreateBusinessDto`, `UpdateBusinessDto`                                                            |
| `service.ts`      | `CreateServiceDto`, `UpdateServiceDto`                                                              |
| `customer.ts`     | `CreateCustomerDto`, `UpdateCustomerDto`                                                            |
| `conversation.ts` | conversation + message DTOs and status/sender literal unions                                        |
| `appointment.ts`  | appointment DTOs (cross-field refine: end > start), status union                                    |
| `user.ts`         | user DTOs (identity itself stays in Better Auth)                                                    |

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
- `AppointmentRepository` converts validated `"YYYY-MM-DD"`/`"HH:mm"` strings
  to Prisma `@db.Date`/`@db.Time` values internally.
- `UserRepository.assignToBusiness` — links an authenticated user during
  onboarding (defaults to `ADMIN`).
- `InvitationRepository` — data primitives + the creation guard
  (DECISIONS #22): `create`, `createIfNoOpenInvitation` (transactional
  duplicate-open guard, PROMPT-03), `findByTokenHash`,
  `findByIdWithinBusiness`, `listByBusiness` (tenant-scoped; no global
  list), and guarded `revoke` / `markAccepted` (only while pending —
  expiry validation belongs to the future acceptance workflow). No
  `deletedAt` filter: the entity has no soft delete.

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

- Business: working hours (الجمعة مساءً فقط), 5 FAQs (أسعار/تأمين/أطفال/
  عنوان/تقسيط), cancellation policy, completed onboarding
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

# Database Layer

PostgreSQL (Neon) · Prisma 7 · UUID primary keys everywhere.

## Entities & Relationships

```
Business 1 ──* User            (staff/admin belong to one business)
Business 1 ──* Service
Business 1 ──* Customer
Business 1 ──* Conversation    Conversation *──1 Customer
Conversation 1 ──* Message     Message *──1 User?  (via conversation assignee)
Business 1 ──* Appointment     Appointment *──1 Customer / Service / User?
```

| Entity       | Table           | Soft delete       | Notes                                                                                                         |
| ------------ | --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Business     | `businesses`    | ✔                 | Root tenant. `workingHours` is JSON.                                                                          |
| User         | `users`         | ✖ (`isActive`)    | Shared table with Better Auth; domain fields: `businessId`, `role`, `isActive`. Avatar = Better Auth `image`. |
| Service      | `services`      | ✔                 | `durationMinutes` drives appointment end times.                                                               |
| Customer     | `customers`     | ✔                 | Unique per business phone: `@@unique([businessId, phone])`.                                                   |
| Conversation | `conversations` | ✔                 | One active thread per customer flow.                                                                          |
| Message      | `messages`      | ✖ (immutable log) | Append-only; deleted with its conversation (cascade).                                                         |
| Appointment  | `appointments`  | ✔                 | `date` (@db.Date) + `startTime`/`endTime` (@db.Time).                                                         |

## Enums

- **UserRole** — `ADMIN`, `STAFF`
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

## Soft Delete Policy

Reads always filter `deletedAt: null` (enforced inside repositories).
Deletes set `deletedAt` (and usually `isActive: false`). Restore clears the
flag. Messages are immutable and cascade with their conversation.
Hard deletes happen only via DB cascades from a parent row.

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

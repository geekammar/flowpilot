# FlowPilot — Spec A (Current Scope)

> The complete, frozen scope of the current build. Anything not listed under
> "Included" is out of scope. Last updated: Prompt 03.

## Scope Definition

**Spec A = Discovery Foundation + Booking Core**

One generic engine that a business can be onboarded onto and that converts
WhatsApp conversations into appointments — sufficient to run paid pilots and
collect evidence.

## Included

### 1. Login

- Email + password sign-in / sign-up (Better Auth)
- Session persistence; protected route groups `(app)`, `(admin)`, `(staff)`
- Arabic-first auth screens on centered-card layout

### 2. Onboarding

- Post-signup flow: create Business (name, city, WhatsApp number, timezone,
  about, working hours, cancellation policy)
- Links authenticated user as `ADMIN` of the new business
- Repeatable checklist pattern for pilot onboarding

### 3. Business Setup

- View/edit business profile and working hours
- Activate/deactivate business account

### 4. Services

- CRUD for bookable services (name, description, duration in minutes)
- Active/inactive toggle; inactive services hidden from booking flows

### 5. Availability

- Working hours per weekday (open/close/closed) from business setup
- Slot derivation for proposed appointment times
- Conflict awareness via `AppointmentRepository.hasConflict`

### 6. Business Knowledge

- Structured FAQ/knowledge entries the AI assistant may use when replying
  (e.g., prices, policies, preparation instructions)
- Plain stored text entries; no vector DB, no RAG infrastructure

### 7. Dashboard

- Calm overview: today's appointments, pending confirmations, conversations
  needing human attention, key stat cards
- Agenda-style upcoming list (see DECISIONS.md)

### 8. Conversations

- Thread list with status (`AI_ACTIVE`, `NEED_HUMAN`, `BOOKED`, `INCOMPLETE`)
- Thread view with ordered messages (`CUSTOMER`/`AI`/`STAFF`)
- Staff can reply (message sender `STAFF`), assign threads, set status,
  view/edit AI summary
- Message transport (WhatsApp provider integration) kept behind an interface;
  UI reads/writes via repositories

### 9. Appointments

- Create/confirm/reschedule/cancel appointments linked to customer + service
- Status lifecycle: `PENDING → CONFIRMED → COMPLETED`, plus `CANCELLED`,
  `NO_SHOW`
- Agenda views by day/range with filters; conflict-checked scheduling

### 10. Team

- List business users (`ADMIN`/`STAFF`)
- Invite/add staff identity, set role, activate/deactivate
- No granular permissions beyond role

### 11. Customers

- Directory with search (name/phone), notes, last conversation/appointment
  timestamps
- Auto-created from inbound WhatsApp contacts (`upsertByPhone`)
- Customer history: their conversations and appointments

## Excluded (do NOT build)

| Excluded                | Reason                                             |
| ----------------------- | -------------------------------------------------- |
| Billing / subscriptions | Pilots are invoiced manually                       |
| Payments                | No money movement inside the product               |
| CRM features            | Pipelines/leads are out of product identity        |
| Marketing tools         | No campaigns/broadcasts                            |
| Founder Console         | Founder-side tooling arrives in Spec B             |
| Discovery Engine        | Vertical scoring arrives in Spec C                 |
| Marketplace             | Never part of FlowPilot identity                   |
| Public API platform     | No external developers during discovery            |
| Multi-language UI       | Arabic-only until verticalization                  |
| Native mobile apps      | PWA covers mobile                                  |
| Automated reminders     | Listed only as future scalability note; not Spec A |

## Screens (Included)

| Route group | Screen                | Purpose                                  |
| ----------- | --------------------- | ---------------------------------------- |
| `(auth)`    | `/sign-in`            | Login                                    |
| `(auth)`    | `/sign-up`            | Registration                             |
| `(app)`     | `/onboarding`         | Business creation wizard                 |
| `(app)`     | `/`                   | Dashboard                                |
| `(app)`     | `/appointments`       | Appointment list/agenda + detail actions |
| `(app)`     | `/conversations`      | Thread list                              |
| `(app)`     | `/conversations/[id]` | Thread view + staff reply                |
| `(app)`     | `/customers`          | Customer directory                       |
| `(app)`     | `/customers/[id]`     | Customer profile/history                 |
| `(app)`     | `/services`           | Service catalog management               |
| `(app)`     | `/settings/business`  | Business setup                           |
| `(app)`     | `/settings/knowledge` | Business knowledge entries               |
| `(admin)`   | `/admin`              | Admin area shell (team mgmt entry)       |
| `(admin)`   | `/admin/team`         | Team management                          |
| `(staff)`   | `/staff`              | Staff area shell (own agenda/tasks)      |

Route groups/layouts already exist; individual screens land prompt-by-prompt.

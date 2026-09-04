# FlowPilot — Spec A (Current Scope)

> The complete, frozen scope of the current build. Anything not listed under
> "Included" is out of scope. Last updated: PROMPT-13.5 (absorbed
> `ROADMAP.md` — the spec sequence + exit criteria below; scope unchanged).

## Scope Definition

**Spec A = Discovery Foundation + Booking Core**

One generic engine that a business can be onboarded onto and that converts
WhatsApp conversations into appointments — sufficient to run paid pilots and
collect evidence.

## Included

### 1. Login

- Email + password sign-in (Better Auth) — the single authentication system
- Session persistence; protected route groups `(app)`, `(admin)`, `(staff)`
- Arabic-first auth screens on centered-card layout
- Account creation for the current pilot stage is **invitation-first** (see
  `ARCHITECTURE.md → Authentication & Authorization Model` and
  `DECISIONS.md` #22): the Platform Operator provisions the Business and
  invites the initial `ADMIN`; the invitee accepts and activates the account
  (sets a password) at `/invite/[token]` (implemented in PROMPT-06), then
  completes onboarding. Public self-sign-up is NOT the primary pilot flow —
  it remains a possible future self-serve acquisition mode, and the
  authentication architecture must not prevent it

### 2. Onboarding

- Runs after invitation-based ADMIN account activation (not after public
  sign-up): the 4-step operational-foundation wizard — بيانات المنشأة
  (name, vertical, city, WhatsApp number, timezone, optional about), ساعات
  العمل (working hours), إعدادات الحجز الأساسية (default slot duration +
  cancellation policy), مراجعة وتشغيل (review + completion) (PROMPT-07)
- `vertical` is discovery METADATA for Local Vertical Discovery (stable
  machine key on the Business record) — never permission for vertical-
  specific UI
- Links the activated user as `ADMIN` of the business
- Resumable: `/onboarding` routes to the first incomplete step (completed
  accounts go straight to the dashboard); progress is server-authoritative
  on the Business record; completion re-validates all step data
  server-side and never requires services/knowledge (those screens arrive
  in later prompts)
- The onboarding wizard is implemented and connected with the
  invitation-based lifecycle (PROMPT-06: activation hands off through
  sign-in to the wizard; the wizard area is ADMIN-only)

### 3. Business Setup

- View/edit business profile and working hours
- Activate/deactivate business account
- **Implemented (PROMPT-09):** `/settings` — business identity (name,
  vertical, city, WhatsApp number, timezone) and booking behavior
  (confirmation mode manual/automatic + cancellation policy),
  ADMIN-only, tenant-scoped. Working-hours editing and account
  activate/deactivate remain follow-up slices. The confirmation mode
  drives the server-derived initial status of new appointments.
- **Implemented (PROMPT-18):** `/settings/knowledge` — business
  knowledge entries (§6) over the plain-text `Business.faqs` JSON
  storage, ADMIN-only, tenant-scoped.

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

| Route group | Screen                | Purpose                                                                                                                    |
| ----------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `(auth)`    | `/sign-in`            | Login                                                                                                                      |
| `(auth)`    | `/invite/[token]`     | Invitation activation (PROMPT-06): accept + set password + activate, then hand off to onboarding via safe sign-in redirect |
| `(app)`     | `/onboarding`         | Business onboarding wizard (after ADMIN activation; ADMIN-only guard)                                                      |
| `(app)`     | `/`                   | Dashboard                                                                                                                  |
| `(app)`     | `/appointments`       | Appointment list/agenda + detail actions                                                                                   |
| `(app)`     | `/conversations`      | Thread list                                                                                                                |
| `(app)`     | `/conversations/[id]` | Thread view + staff reply                                                                                                  |
| `(app)`     | `/customers`          | Customer directory                                                                                                         |
| `(app)`     | `/customers/[id]`     | Customer profile/history                                                                                                   |
| `(app)`     | `/services`           | Service catalog management                                                                                                 |
| `(app)`     | `/settings`           | Business settings (PROMPT-09): identity + booking behavior                                                                 |
| `(app)`     | `/settings/knowledge` | Business knowledge entries                                                                                                 |
| `(admin)`   | `/admin`              | Admin area shell (team mgmt entry)                                                                                         |
| `(admin)`   | `/admin/team`         | Team management                                                                                                            |
| `(staff)`   | `/staff`              | Staff area shell (own agenda/tasks)                                                                                        |

Route groups/layouts already exist; individual screens land prompt-by-prompt.
The public `/sign-up` route exists today as a placeholder only and is no
longer a Spec A deliverable — invitation-based activation replaces it as the
pilot account-creation flow. Exact invitation route naming is an
implementation decision for the next prompt. Do NOT add Founder Console or
any Spec B functionality here.

## Spec Sequence & Exit Criteria

> Merged from `ROADMAP.md` (PROMPT-13.5 documentation reset). Each spec is
> frozen before the next begins. Status tracking: `BUILD_STATE.md`.

### Spec A — Discovery Foundation + Booking Core (CURRENT)

**Goal:** a pilot-ready generic engine that proves daily usefulness for one
business at a time.

**Exit criteria:**

- A real business can be onboarded in < 1 day using the app alone.
- A conversation can flow: customer message → AI/staff reply → booked,
  confirmed appointment.
- Owner can see today's agenda and act on `NEED_HUMAN` threads.

### Spec B — Evidence Layer + Founder Side (planned)

**Goal:** turn pilot operations into structured, comparable evidence.

Contents (planned): 1. Pilot tracking (pilot registry: business, vertical,
start date, plan price, status trial/paid/churned; weekly check-in log). 2. ROI tracking (baseline vs. current: recovered bookings, response time,
no-show rate; monthly ROI statement per pilot). 3. Vertical registry
(first-class vertical records attached to pilots; vertical-scoped
copy/template packs — still no vertical UI forks). 4. Evidence logging
(structured event log: onboarding steps, objections, feature requests,
churn reasons; exportable timeline per vertical). 5. Founder Side
(cross-pilot read-only founder dashboard over the same database;
founder-only route group; no new infrastructure).

Still excluded: billing automation, payments, public API.

**Exit criterion:** the founder can answer "which vertical is winning and
why?" from the product, not from memory.

### Spec C — Vertical Discovery Engine (planned)

**Goal:** make the vertical decision data-driven and repeatable.

Contents (planned): vertical scoring (composite score per vertical from the
`PRODUCT_STRATEGY.md` decision criteria), willingness-to-pay tracking,
feature clustering (grouped requests/objections by vertical), and a decision
center (guided comparison + double-down / iterate / drop recommendation with
evidence links).

**Exit criterion:** a documented, evidence-backed choice of the winning
vertical, ready for the verticalization plan in `PRODUCT_STRATEGY.md`.

### Beyond Spec C (unplanned — do not start)

Geographic expansion playbook, vertical-specific deepening (e.g., dental
recall cycles), automated reminders/notifications, public API (only if a
paying partner demands it). Nothing here may be built without a scope
decision recorded in `DECISIONS.md`.

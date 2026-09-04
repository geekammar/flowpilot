# Feature: appointments

Booking lifecycle: creation, confirmation, rescheduling, cancellation, reminders,
deterministic availability (PROMPT-10), and the Smart Create Appointment flow
(PROMPT-11 Steps 1–3 + PROMPT-12 Step 4 — available-slot selection).

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/lib/*`, `@/server/db`,
  `@/types`, and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not here.
- No circular dependencies. If two features need shared logic, promote it to
  `@/lib` or `@/server` deliberately and stays small.
- Keep files small and single-purpose; no giant shared barrels.

## Structure

- `actions/appointment-actions.ts` — create/status/reschedule writes
  (tenant-scoped, conflict-checked, status transitions enforced).
- `actions/availability-actions.ts` — `getAvailabilityAction`: thin
  `"use server"` read hook for the availability service (consumed by
  Step 4 of the Smart Create flow).
- `actions/booking-flow-actions.ts` — `searchBookingCustomersAction`: thin
  `"use server"` wrapper for the booking-flow customer search (Step 1).
- `schemas/appointment-schema.ts` — form-level Zod inputs for the agenda
  actions.
- `schemas/availability-schema.ts` — availability request input
  (`{date, serviceId}` ONLY; the Business is never client-controlled —
  Zod strips every other key). Step 4 consumes this schema verbatim.
- `schemas/booking-flow-schema.ts` — booking-flow inputs: customer search
  (`{query}` ONLY — hostile keys stripped).
- `server/appointment-queries.ts` — agenda/detail reads.
- `server/availability-service.ts` — deterministic availability
  calculation (see Semantics below).
- `server/booking-flow-service.ts` — Steps 1–2 reads: tenant-scoped
  customer search (name/phone via the existing repository primitive) and
  the active-services list.
- `hooks/use-debounced-value.ts` — debounce for the search box.
- `components/smart-create/*` — the Smart Create flow (see below).
- `types.ts` — agenda/detail/option types, the availability result
  contract, the 6-step flow constants, `SelectedSlot`, and booking-flow
  option types.

## Smart Create flow (Steps 1–4)

`/appointments/new` is the Smart Create Appointment flow: العميل → الخدمة
→ التاريخ → الوقت, shown in a 6-step progress indicator where ONLY steps
1–4 are active (المراجعة/التأكيد stay locked until later prompts).

- **Step 1 — العميل** (`customer-step.tsx`): search by name or phone
  (debounced, `searchBookingCustomersAction` → `searchBookingCustomers`,
  tenant-scoped by construction), a clear no-match empty state, an obvious
  selected-customer state, and an easy تغيير before continuing.
- **Step 2 — الخدمة** (`service-step.tsx`): radio-cards of the Business's
  ACTIVE services only (inactive services are never bookable), with name +
  duration in minutes.
- **Step 3 — التاريخ** (`date-step.tsx`): a quick-pick strip of the next 14
  days (starting from business-timezone today, server-derived) plus a
  native date input (min = business today). Validation reuses the shared
  `appointmentDateSchema`. NO availability calculation happens here.
- **Step 4 — الوقت** (`slot-step.tsx`, PROMPT-12): REAL available-slot
  selection consuming the PROMPT-10 availability layer through
  `getAvailabilityAction` — every displayed time comes from the server
  result; nothing is invented on the client. The query runs only while
  the step is mounted with a valid date + service (query key
  `["booking-availability", serviceId, date]`). Four distinct states:
  loading (skeleton + sr-only status), slots (grouped
  الصباح/بعد الظهر/المساء chips, `aria-pressed` selection, `aria-live`
  count, business-timezone label), zero slots with the explicit reason
  rendered as clear Arabic copy + actionable next steps (تغيير التاريخ,
  and تغيير الخدمة for `SERVICE_TOO_LONG`), and failure (`role="alert"`
  - retry, with العودة إلى الخدمات for service-related typed errors).
    `slot-helpers.ts` holds the pure presentation helpers (Arabic time
    formatting, period grouping, stale-selection membership check,
    timezone label) — display-only; the availability semantics live in the
    service.
- **Wizard state** lives in `smart-create-appointment.tsx` only
  (`customerId`/`serviceId`/`date`/`selectedSlot` + current screen):
  moving back and forth never resets selections; each step's continue
  action stays disabled until its selection is valid; completed steps in
  the progress indicator are clickable for safe back-navigation
  (onboarding-wizard convention). Changing the service or the date
  CLEARS the slot selection (a slot is only valid for the inputs it was
  computed for); changing the customer does not (availability does not
  depend on the customer). Step 4 is SELECTION ONLY: the chosen slot is
  preserved in wizard state for the future review step (PROMPT-13), no
  appointment is created from it, and there is deliberately no continue
  action past it while steps 5–6 stay locked.

The interim manual time-entry details screen from PROMPT-11 was REMOVED
(superseded by Step 4) — the manual start-time entry is no longer part
of the Smart Create path.

## Availability semantics (PROMPT-10)

`getAvailability(deps, actor, input)` answers: "For this Business, on this
date, for this active Service, which start times are actually bookable?"

- **Business resolution**: the actor's own Business (ADMIN or STAFF); a
  client-provided `businessId` never overrides it.
- **Working hours**: the existing `Business.workingHours` JSON week (single
  open/close interval per weekday). Closed day (or missing/invalid entry) →
  zero slots with reason `BUSINESS_CLOSED`.
- **Service validation**: only active, non-deleted services of the actor's
  Business produce availability — inactive → `SERVICE_INACTIVE`,
  cross-Business/unknown/deleted → `SERVICE_NOT_FOUND`.
- **Slot generation**: candidates step from `open` by the Business's
  canonical `slotDurationMinutes` (onboarding step 3 setting — REUSED, no
  new setting). A candidate is valid only when the FULL
  `Service.durationMinutes` fits before `close` (17:30 for a 45-minute
  service in a 10:00–18:00 day is invalid — it ends 18:15).
- **Conflicts**: a slot must not overlap a blocking appointment — same
  business, same date, not soft-deleted, `PENDING`/`CONFIRMED` — the exact
  rule `AppointmentRepository.hasConflict` /
  `createWithConflictCheck` enforce for writes. Reads go through
  `AppointmentRepository.listBlockingForDate`; repositories remain the only
  Prisma consumers.
- **Timezone**: slots are business-local wall-clock "HH:mm" (the stored
  `@db.Time` semantics); the weekday is derived from the calendar date
  itself (timezone-independent). The Business's stored timezone travels in
  the result for display; the device timezone is never a source of truth.
- **Determinism**: no `Date.now()` in the calculation path — repeated calls
  with the same persisted state produce identical results.
- **Result contract**: `{success, data: {date, timezone, serviceId,
serviceDurationMinutes, slots}, reason}` — slots are `{startTime,
endTime}` "HH:mm" pairs; empty availability always carries an explicit
  reason (`BUSINESS_CLOSED` | `SERVICE_TOO_LONG` | `FULLY_BOOKED`); errors
  are typed codes with Arabic messages; no database internals leak into
  the shape.
- Repository collaborators are injectable (defaulting to the app
  singletons) so the workflow logic can be verified without a live
  database.

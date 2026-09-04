# Feature: appointments

Booking lifecycle: creation, confirmation, rescheduling, cancellation, reminders,
and deterministic availability (PROMPT-10).

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
  `"use server"` read hook for the availability service (the integration
  point for the future Smart Create flow).
- `schemas/appointment-schema.ts` — form-level Zod inputs for the agenda
  actions.
- `schemas/availability-schema.ts` — availability request input
  (`{date, serviceId}` ONLY; the Business is never client-controlled —
  Zod strips every other key).
- `server/appointment-queries.ts` — agenda/detail/form-options reads.
- `server/availability-service.ts` — deterministic availability
  calculation (see Semantics below).
- `types.ts` — agenda/detail/option types plus the availability result
  contract.

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

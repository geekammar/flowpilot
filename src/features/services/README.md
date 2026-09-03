# Feature: services

Catalog of bookable service offerings (generic, no vertical-specific terminology).

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/lib/*`, `@/server/db`,
  `@/types`, and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not here.
- No circular dependencies. If two features need shared logic, promote it to
  `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.

## Structure

- `schemas/service-schema.ts` — form-level Zod input (name, optional
  description, duration minutes) derived from the shared
  `@/lib/validation` service contract; the client NEVER sends a
  `businessId`.
- `server/service-service.ts` — management workflow (list / create /
  update / activate / deactivate) with the authorization rules inside:
  ADMIN-only, tenant-scoped to the actor's Business, cross-Business
  service ids rejected as not-found. Repository collaborators are
  injectable so the logic is verifiable without a live database.
- `actions/service-actions.ts` — thin `"use server"` wrappers: build the
  actor from the authenticated session + DB user, run the service
  operation, revalidate `/services` and `/appointments/new`.
- `components/services-screen.tsx` — list screen (cards with name,
  description, duration, active badge), empty state, primary action
  (إضافة خدمة), optimistic activate/deactivate with rollback.
- `components/service-form-dialog.tsx` — small create/edit dialog
  (same form, prefilled for edit).

## Semantics

- Active/inactive is `Service.isActive`; inactive services are excluded
  from booking selection paths (the appointment form options list
  active services only, and `createAppointment` re-checks `isActive`).
- Soft delete (`deletedAt`) is honored by the repository; this feature
  does not expose deletion.
- No pricing, packages, staff assignment, or vertical metadata — Spec A
  scope.

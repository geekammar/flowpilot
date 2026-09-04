# Feature: customers

Customer directory, contact details, and booking history per customer.

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

- `schemas/customer-schema.ts` — form-level Zod input (name, phone,
  optional notes) derived from the shared `@/lib/validation` customer
  contract; the client NEVER sends a `businessId`. Also the directory
  search input (`{query}` ONLY — hostile keys stripped).
- `server/customer-service.ts` — THE single customer-creation path
  (PROMPT-15): tenant-scoped to the actor's Business (derived from the
  authenticated session), duplicate phone → typed `DUPLICATE_PHONE`
  (the DB unique-per-business constraint is the final guard), plus the
  directory list/search (reuses the existing
  `CustomerRepository.listByBusiness` primitive — name OR phone,
  soft-deletes excluded). Repository collaborators are injectable so
  the logic is verifiable without a live database.
- `server/customer-queries.ts` — tenant-scoped detail read: customer
  - appointment history (`listRecentByCustomer`, up to 50) +
    conversation history (`listByCustomer`); a cross-Business customer
    is indistinguishable from a missing one.
- `actions/customer-actions.ts` — thin `"use server"` wrappers:
  `searchCustomersAction` (directory search), `createCustomerAction`
  (canonical create; revalidates `/customers`, the created detail, and
  `/appointments/new`).
- `components/customers-directory.tsx` — directory screen: debounced
  server-backed search, rows with name/phone/last conversation/last
  appointment, honest empty/loading/error states, one primary action
  (إضافة عميل).
- `components/customer-form-dialog.tsx` — the ONE create surface;
  rendered by the directory AND composed into Smart Create Step 1 by
  the route (`/appointments/new` passes it as `CustomerCreateDialog`).
- `components/customer-detail-screen.tsx` — server-rendered detail:
  identity card + notes, appointment history, conversation history —
  each row links to the existing appointment/conversation pages.

## Semantics

- Unique per Business by phone (`@@unique([businessId, phone])`);
  creation checks first, and the constraint error is caught as
  `DUPLICATE_PHONE`.
- Soft delete (`deletedAt`) is honored by the repository reads; this
  feature does not expose deletion.
- `lastConversationAt` / `lastAppointmentAt` are maintained by the
  existing conversation/appointment write paths — the directory only
  reads them.
- Not a CRM: no leads, pipelines, tags, campaigns, tasks, scoring, or
  import/export — Spec A scope.

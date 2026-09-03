# Feature: invitations

Invitation workflow foundation (DECISIONS #22): secure creation (token
generation + hash-only persistence), business-scoped listing,
revocation, one-time token-based acceptance, and ADMIN account
activation (PROMPT-05) — connecting an accepted ADMIN invitation to a
Better Auth identity with Business ADMIN membership. Delivery and all
UI are later prompts. No UI here yet — the future Team management
screen composes the creation side of this feature at the route layer,
and the future activation flow composes `acceptInvitation` +
`activateAdminAccount`.

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/lib/*`, `@/server/db`,
  `@/types`, and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not here.
- No circular dependencies. If two features need shared logic, promote it to
  `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.

## Security rules (binding)

- Raw invitation tokens are credentials: returned from creation exactly
  once, never persisted, never logged (see `@/server/security/invitation-token`).
- Only the SHA-256 `tokenHash` is persisted; lookups are hash-only.
- Acceptance is one-time and atomic: a token can produce exactly one
  successful acceptance; every later or concurrent attempt fails with
  a typed invalid-state error.
- Acceptance results exclude both the raw token and the token hash.
- Activation is ADMIN-only, requires prior acceptance, and is one-time:
  the conditional `activatedAt` guard makes repeated and concurrent
  attempts fail with `ACCOUNT_ALREADY_ACTIVATED`.
- Activation never creates a second identity for an email, never resets
  an existing password, and never silently changes a role; conflicting
  identities (other Business, same-Business STAFF) are rejected with
  `ACCOUNT_CONFLICT`.
- Passwords belong to Better Auth (`auth.api.signUpEmail` via the
  injectable identity creator); they are never hashed, stored, logged,
  or returned by this feature. Activation results carry safe data only
  (no raw token, no hash, no password, no session token).

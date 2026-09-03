# Feature: invitations

Invitation workflow foundation (DECISIONS #22): secure creation (token
generation + hash-only persistence), business-scoped listing,
revocation, and one-time token-based acceptance. Account activation,
password setup, and delivery are later prompts. No UI here yet — the
future Team management screen composes the creation side of this
feature at the route layer, and the future acceptance/activation flow
composes `acceptInvitation`.

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

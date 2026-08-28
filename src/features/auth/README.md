# Feature: auth

Authentication flows (sign-up, sign-in, sign-out, session) built on Better Auth.

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/lib/*`, `@/server/db`,
  `@/types`, and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not here.
- No circular dependencies. If two features need shared logic, promote it to
  `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.

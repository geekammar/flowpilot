# Feature: staff

Team management (PROMPT-16): the business's people — the team
directory (members with role + active state), open STAFF invitations,
and member activation/deactivation. Composed with the invitations
feature at the route layer (`/admin/team`): this feature owns the
directory + membership-state changes; the invitations feature owns
invitation creation (its `StaffInviteDialog` is injected into
`TeamScreen` as a component prop — feature isolation preserved).

Deliberately NOT here (Spec A keeps it small): scheduling, agendas,
staff dashboards, granular permissions, custom roles. The Staff
workspace (own agenda, assigned conversations) is a later, separate
prompt.

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`, `@/components/shared`,
  `@/lib/*`, `@/server/repositories`, `@/types`, and its own files —
  never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not here.
- No circular dependencies. If two features need shared logic, promote it to
  `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.

## Security rules

- Team reads/writes are ADMIN-only and tenant-scoped: the Business is
  ALWAYS the authenticated actor's own (session-derived, never client
  input); a cross-tenant member id fails safely as not-found.
- Only STAFF members may be deactivated/reactivated
  (`User.isActive` — no second status field, no membership state
  machine). ADMIN members — including the acting ADMIN themselves —
  can never be deactivated through this path, so no ADMIN can
  accidentally lock the Business out.
- UI hiding is not authorization: the service layer rejects non-admin
  actors with typed failures regardless of what the client renders.

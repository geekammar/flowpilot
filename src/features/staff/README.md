# Feature: staff

The staff area of the business: the human-handoff workspace (PROMPT-17)
plus team management (PROMPT-16).

- **Staff workspace** (`/staff`, `(staff)` route group — STAFF-only):
  the NEED_HUMAN handoff queue (unassigned first, then the actor's,
  then other people's — each row shows the customer, latest message,
  activity time, canonical status, assignment state, and the latest
  appointment when present) and the actor's own assigned
  (non-handoff) conversations. The unassigned rows expose the takeover
  action; everything else links into the EXISTING conversation detail
  (`/conversations/[id]`) — no second conversation UI. The takeover
  action is the conversations feature's existing `transitionConversation`
  (TAKE_OVER), injected as a prop at the route layer (structural
  contract in `types.ts` — feature isolation preserved; one assignment
  system).
- **Team management** (PROMPT-16, composed at `/admin/team` in the
  `(admin)` route group): the team directory (members with role +
  active state), open STAFF invitations, and member
  activation/deactivation. The invitations feature's
  `StaffInviteDialog` is injected into `TeamScreen` as a component
  prop (feature isolation preserved).

Deliberately NOT here (Spec A keeps it small): scheduling, agendas,
staff dashboards, granular permissions, custom roles, vanity
statistics, a second conversation/assignment system, or CRM behavior.

## Isolation rules

- Everything feature-specific lives in this folder: components, hooks,
  schemas, server actions/queries, and API clients.
- This feature may import from `@/components/ui`,
  `@/components/shared`, `@/lib/*`, `@/server/repositories`, `@/types`,
  and its own files — never from another feature folder.
- Cross-feature composition happens at the route layer (`src/app`), not
  here. The workspace's takeover action is route-injected; team
  management's invite dialog is route-injected.
- No circular dependencies. If two features need shared logic, promote
  it to `@/lib` or `@/server` deliberately.
- Keep files small and single-purpose; no giant shared barrels.

## Security rules

- The workspace is STAFF-only and tenant-scoped: reads use the
  authenticated actor's own Business (session-derived — there is NO
  client-suppliable businessId in any input); ADMIN actors get a typed
  failure from the workspace service (the `(staff)` layout guard is
  the first tier, the service the authoritative one).
- Team reads/writes are ADMIN-only and tenant-scoped: the Business is
  ALWAYS the authenticated actor's own (session-derived, never client
  input); a cross-tenant member id fails safely as not-found.
- Only STAFF members may be deactivated/reactivated
  (`User.isActive` — no second status field, no membership state
  machine). ADMIN members — including the acting ADMIN themselves —
  can never be deactivated through this path, so no ADMIN can
  accidentally lock the Business out.
- Takeover/assignment changes ownership only through the conversations
  feature's EXPLICIT actions (`transitionConversation`, assignment
  select). A staff reply takes ownership only when the thread is
  unowned — an assigned conversation is never silently stolen.
- UI hiding is not authorization: the service layers reject wrong-role
  actors with typed failures regardless of what the client renders.

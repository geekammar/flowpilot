# Feature: invitations

Invitation workflow foundation (DECISIONS #22): secure creation (token
generation + hash-only persistence), business-scoped listing,
revocation, one-time token-based acceptance, and invited-account
activation (PROMPT-05 ADMIN; generalized to both Business roles in
PROMPT-16 — the persisted invitation's own role drives the attached
membership) — connecting an accepted invitation to a Better Auth
identity with its Business membership. The activation UI is the
public, read-only pre-screened route (`/invite/[token]`) whose server
action composes acceptance + activation, then hands the activated user
off to a role-aware sign-in redirect (ADMIN → onboarding; STAFF → the
authenticated app). PROMPT-16 adds the creation side for team
management: `createStaffInvitation` (email-only input, ADMIN-only,
tenant-scoped, fixed STAFF role) and the `StaffInviteDialog` that
surfaces the raw invitation link exactly once for manual delivery —
the Team screen composes them at the route layer. Email/WhatsApp
delivery infrastructure remains out of scope (manual delivery only).

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
  successful acceptance; every later or concurrent attempt fails with a
  typed invalid-state error.
- Acceptance results exclude both the raw token and the token hash.
- Activation requires prior acceptance and is one-time: the conditional
  `activatedAt` guard makes repeated and concurrent attempts fail with
  `ACCOUNT_ALREADY_ACTIVATED`.
- Activation never creates a second identity for an email, never resets
  an existing password, and never silently changes a role; conflicting
  identities (other Business, same-Business different role) are rejected
  with `ACCOUNT_CONFLICT`. The persisted invitation is the sole role
  authority — a caller can never escalate to a role the invitation does
  not carry.
- STAFF invitation creation (`createStaffInvitation`) accepts ONLY the
  invitee email; the Business comes from the authenticated actor's
  session, the target role is fixed to STAFF, and only Business ADMIN
  may invite.
- Passwords belong to Better Auth (`auth.api.signUpEmail` via the
  injectable identity creator); they are never hashed, stored, logged,
  or returned by this feature. Activation results carry safe data only
  (no raw token, no hash, no password, no session token).

## Activation UI (PROMPT-06; STAFF-generalized in PROMPT-16)

- Route `src/app/(auth)/invite/[token]/page.tsx` is PUBLIC (the invitee
  is unauthenticated — the token in the path is the credential). It
  pre-screens via `getInvitationByToken` (read-only: hash-only lookup,
  derived status, business display name; NO mutation on GET) and
  renders the role-aware activation form or a terminal notice
  (invalid / expired / revoked / already-activated / conflict).
- `activateInvitedAccountAction` (thin `"use server"` wrapper) delegates
  to `completeInvitedActivation` (`server/activation-flow.ts`), which
  composes the EXISTING `acceptInvitation` + `activateInvitedAccount`
  services: acceptance first (`INVITATION_ALREADY_ACCEPTED` is the
  resume path of an accepted-but-unactivated invitation, including
  interrupted activations), then activation, then typed-error mapping
  to safe Arabic UI states. Both collaborators are injectable, so the
  composition is verifiable without a live database.
- Client input accepts ONLY `{ token, name, password }` (existing
  `activateAdminAccountInputSchema`); Zod strips everything else, and
  the persisted invitation stays the sole authority for
  businessId/email/role.
- On success the screen shows the role-aware safe sign-in handoff:
  ADMIN → `ACTIVATION_SIGNIN_HANDOFF` (`/sign-in?redirect=/onboarding`,
  landing in the onboarding wizard, DECISIONS #25); STAFF →
  `STAFF_ACTIVATION_SIGNIN_HANDOFF` (plain `/sign-in` — onboarding is
  ADMIN-only and must never be a staff target). The activation service
  intentionally discards the auto-created session; the sign-in form
  only honors safe internal redirect paths.
- The raw token never appears in the visible UI: it travels only
  through the route path (the invitation link) and the hidden form
  field into the action. No module in this feature logs it.

## STAFF invitation creation (PROMPT-16, team management)

- `createStaffInvitation` (`server/staff-invitation-flow.ts`) is THE
  add-staff path composed by the Team screen at the route layer
  (`/admin/team`). It composes the EXISTING `createInvitation` service
  — there is no second invitation system.
- `createStaffInvitationAction` (thin `"use server"` wrapper) builds
  the actor from the authenticated session + database-backed user
  record (least-privilege fallback), enforces ADMIN-only + tenant
  scoping inside the flow, and revalidates `/admin/team` on success.
- `StaffInviteDialog` collects the invitee email only (the client
  schema is email-only); after a server-confirmed creation it renders
  the one-time invitation link (`{origin}/invite/{rawToken}`) with a
  copy affordance, an explicit "never shown again" warning, and the
  derived expiry date — then hands the created invitation back to the
  composing screen. No success state renders before the server result.

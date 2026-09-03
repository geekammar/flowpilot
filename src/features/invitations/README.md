# Feature: invitations

Invitation workflow foundation (DECISIONS #22): secure creation (token
generation + hash-only persistence), business-scoped listing,
revocation, one-time token-based acceptance, and ADMIN account
activation (PROMPT-05) — connecting an accepted ADMIN invitation to a
Better Auth identity with Business ADMIN membership. PROMPT-06 adds
the activation UI: a public, read-only pre-screened activation route
(`/invite/[token]`) and a server action that composes acceptance +
activation, then hands the activated ADMIN off to the existing
onboarding wizard via the safe sign-in redirect. Delivery remains a
later prompt; the Team management screen will compose the creation
side of this feature at the route layer.

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

## Activation UI (PROMPT-06)

- Route `src/app/(auth)/invite/[token]/page.tsx` is PUBLIC (the invitee
  is unauthenticated — the token in the path is the credential). It
  pre-screens via `getInvitationByToken` (read-only: hash-only lookup,
  derived status, business display name; NO mutation on GET) and
  renders the activation form or a terminal notice (invalid / expired /
  revoked / already-activated / staff-not-supported).
- `activateInvitedAdminAction` (thin `"use server"` wrapper) delegates
  to `completeAdminActivation` (`server/admin-activation-flow.ts`),
  which composes the EXISTING `acceptInvitation` + `activateAdminAccount`
  services: acceptance first (`INVITATION_ALREADY_ACCEPTED` is the
  resume path of an accepted-but-unactivated invitation, including
  interrupted activations), then activation, then typed-error mapping
  to safe Arabic UI states. Both collaborators are injectable, so the
  composition is verifiable without a live database.
- Client input accepts ONLY `{ token, name, password }` (existing
  `activateAdminAccountInputSchema`); Zod strips everything else, and
  the persisted invitation stays the sole authority for
  businessId/email/role.
- On success the screen shows the safe sign-in handoff
  (`ACTIVATION_SIGNIN_HANDOFF` = `/sign-in?redirect=/onboarding`): the
  activation service intentionally discards the auto-created session,
  so the ADMIN signs in with the password they just chose and lands in
  the existing onboarding wizard (DECISIONS #25). The sign-in form only
  honors safe internal redirect paths; `/onboarding` itself is
  ADMIN-guarded (`requireRole("ADMIN")` in the `(onboarding)` layout).
- The raw token never appears in the visible UI: it travels only
  through the route path (the invitation link) and the hidden form
  field into the action. No module in this feature logs it.

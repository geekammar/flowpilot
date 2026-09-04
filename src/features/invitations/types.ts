import type { UserRole } from "@/types/domain";

/**
 * Invitation workflow types. Feature-specific by convention — cross-feature
 * shapes live in `@/types`. All shapes exclude `tokenHash`: the hash is a
 * storage/lookup concern and must not travel into feature results or UI.
 */

/** Derived lifecycle (DATABASE.md) — no persisted status enum exists. */
export type InvitationLifecycleStatus =
  "PENDING" | "ACCEPTED" | "ACTIVATED" | "REVOKED" | "EXPIRED";

/** Invitation metadata safe for feature/UI consumption (never the hash). */
export type InvitationView = {
  id: string;
  businessId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  activatedAt: Date | null;
  invitedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvitationListItem = InvitationView & {
  status: InvitationLifecycleStatus;
};

/**
 * Creation succeeds exactly once per call: `rawToken` is the deliverable
 * credential — the caller sends it to the invitee and must never persist
 * or log it. `invitation` is the persisted metadata (hash excluded).
 */
export type CreateInvitationSuccess = {
  invitation: InvitationView;
  rawToken: string;
};

export type ListInvitationsSuccess = {
  items: InvitationListItem[];
};

export type RevokeInvitationSuccess = {
  invitation: InvitationView;
};

/**
 * Acceptance returns only the safe persisted context the activation
 * step needs (email, businessId, role, acceptedAt). Never the raw
 * token, never the hash.
 */
export type AcceptInvitationSuccess = {
  invitation: InvitationView;
};

/**
 * Read-only invitation context for the activation screen (PROMPT-06):
 * what the page may render before any mutation — the safe view, the
 * derived lifecycle status, and the inviting Business display name.
 * Never the raw token, never the hash.
 */
export type GetInvitationByTokenSuccess = {
  invitation: InvitationView;
  status: InvitationLifecycleStatus;
  businessName: string | null;
};

/**
 * Safe activation result (PROMPT-05; STAFF generalized in PROMPT-16):
 * the activated membership context only. `identityCreated`
 * distinguishes a freshly created Better Auth identity from linking an
 * existing one (interrupted-activation resume / never-assigned
 * identity) — never a session token, never the raw token, never the
 * hash, never the password.
 */
export type ActivateInvitedAccountSuccess = {
  invitation: InvitationView;
  userId: string;
  identityCreated: boolean;
};

export type InvitationErrorCode =
  | "INVALID_INPUT"
  | "BUSINESS_NOT_FOUND"
  | "INVITATION_ALREADY_OPEN"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_ALREADY_ACCEPTED"
  | "INVITATION_REVOKED"
  | "INVITATION_EXPIRED"
  | "INVITATION_NOT_ACCEPTED"
  | "INVALID_INVITATION_STATE"
  | "ACCOUNT_ALREADY_ACTIVATED"
  | "ACCOUNT_CONFLICT"
  | "IDENTITY_CREATION_FAILED"
  | "PERSISTENCE_FAILED";

/**
 * Mirrors the cross-feature `ApiResponse` shape with a tightened error code,
 * so future server actions can return these results directly.
 */
export type InvitationServiceResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: { code: InvitationErrorCode; message: string } };

/**
 * Safe post-submission handoff target after successful ADMIN
 * activation (PROMPT-06): the service intentionally discards the
 * auto-created session, so the activated ADMIN signs in with the
 * password they just chose and lands directly in the existing
 * onboarding wizard. The sign-in form only honors safe internal
 * redirect paths.
 */
export const ACTIVATION_SIGNIN_HANDOFF = "/sign-in?redirect=/onboarding";

/**
 * Safe post-submission handoff target after successful STAFF
 * activation (PROMPT-16): the staff member signs in with the password
 * they just chose and lands in the authenticated app. Onboarding is
 * ADMIN-only — a staff handoff must never target it.
 */
export const STAFF_ACTIVATION_SIGNIN_HANDOFF = "/sign-in";

/**
 * Terminal UI states for the activation screen. Each maps to one safe
 * Arabic panel; none exposes internals (token state is only
 * distinguishable because the caller presented the token itself).
 */
export type ActivationNoticeState =
  | "INVALID_TOKEN"
  | "EXPIRED"
  | "REVOKED"
  | "ALREADY_ACTIVATED"
  | "CONFLICT"
  | "FAILED";

/**
 * Result of the activation server action. `VALIDATION_ERROR` keeps the
 * form on screen with an inline message; `NOTICE` replaces it with a
 * terminal panel; `SUCCESS` shows the role-aware sign-in handoff.
 * Never carries the raw token, the hash, or the password.
 */
export type ActivationActionResult =
  | { status: "SUCCESS"; email: string; role: UserRole }
  | { status: "VALIDATION_ERROR"; message: string }
  | { status: "NOTICE"; state: ActivationNoticeState; message: string };

/**
 * Typed failure codes for the STAFF invitation creation flow (the
 * team-management add-staff path). Codes mirror the underlying
 * invitation-service errors; FORBIDDEN/NO_BUSINESS come from the
 * actor guard (ADMIN-only, session-derived Business).
 */
export type CreateStaffInvitationErrorCode =
  | "FORBIDDEN"
  | "NO_BUSINESS"
  | "INVALID_INPUT"
  | "INVITATION_ALREADY_OPEN"
  | "BUSINESS_NOT_FOUND"
  | "PERSISTENCE_FAILED";

export type CreateStaffInvitationResult =
  | {
      success: true;
      invitation: InvitationView;
      /** The deliverable credential — returned exactly once, never persisted. */
      rawToken: string;
    }
  | {
      success: false;
      error: {
        code: CreateStaffInvitationErrorCode;
        message: string;
      };
    };

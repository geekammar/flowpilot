import type { UserRole } from "@/types/domain";

/**
 * Invitation workflow types. Feature-specific by convention — cross-feature
 * shapes live in `@/types`. All shapes exclude `tokenHash`: the hash is a
 * storage/lookup concern and must not travel into feature results or UI.
 */

/** Derived lifecycle (DATABASE.md) — no persisted status enum exists. */
export type InvitationLifecycleStatus =
  "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

/** Invitation metadata safe for feature/UI consumption (never the hash). */
export type InvitationView = {
  id: string;
  businessId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
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

export type InvitationErrorCode =
  | "INVALID_INPUT"
  | "BUSINESS_NOT_FOUND"
  | "INVITATION_ALREADY_OPEN"
  | "INVITATION_NOT_FOUND"
  | "INVALID_INVITATION_STATE"
  | "PERSISTENCE_FAILED";

/**
 * Mirrors the cross-feature `ApiResponse` shape with a tightened error code,
 * so future server actions can return these results directly.
 */
export type InvitationServiceResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: { code: InvitationErrorCode; message: string } };

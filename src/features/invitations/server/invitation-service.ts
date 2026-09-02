import type { Invitation } from "@/generated/prisma/client";

import {
  createInvitationInputSchema,
  listInvitationsInputSchema,
  revokeInvitationInputSchema,
} from "@/features/invitations/schemas/invitation-schema";
import type {
  CreateInvitationSuccess,
  InvitationErrorCode,
  InvitationListItem,
  InvitationServiceResult,
  InvitationView,
  ListInvitationsSuccess,
  RevokeInvitationSuccess,
} from "@/features/invitations/types";
import {
  businessRepository,
  invitationRepository,
} from "@/server/repositories";
import type { BusinessRepository } from "@/server/repositories/business.repository";
import type { InvitationRepository } from "@/server/repositories/invitation.repository";
import { generateInvitationToken } from "@/server/security/invitation-token";

/**
 * Invitation creation foundation (DECISIONS #22): secure token creation
 * (hash-only persistence), business-scoped listing, and revocation.
 * Acceptance, account activation, and delivery are later prompts —
 * `revoke` never accepts, and nothing here activates accounts.
 *
 * Security invariants:
 * - The raw token is generated here and returned ONCE in the creation
 *   result. It is never persisted, logged, or included in errors.
 * - Everything returned to callers excludes `tokenHash`.
 * - Every operation is business-scoped; there is no global path.
 *
 * Repository collaborators are injectable (defaulting to the app
 * singletons) so the workflow logic can be verified without a live
 * database — the database-backed guarantees remain the repository's
 * responsibility and are verified against a real database at
 * integration/deploy time.
 */

/** Centralized expiry policy: expiresAt = createdAt + TTL. */
export const INVITATION_EXPIRY_DAYS = 7;

export function invitationExpiresAt(from: Date = new Date()): Date {
  return new Date(
    from.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );
}

/**
 * Derived lifecycle status (no persisted enum). Precedence:
 * accepted > revoked > expired > pending. `expiresAt <= now` means
 * expired; "open" invitations are exactly the PENDING ones.
 */
export function deriveInvitationStatus(
  invitation: Pick<Invitation, "acceptedAt" | "revokedAt" | "expiresAt">,
  now: Date = new Date(),
): InvitationListItem["status"] {
  if (invitation.acceptedAt) return "ACCEPTED";
  if (invitation.revokedAt) return "REVOKED";
  if (invitation.expiresAt.getTime() <= now.getTime()) return "EXPIRED";
  return "PENDING";
}

function toView(invitation: Invitation): InvitationView {
  return {
    id: invitation.id,
    businessId: invitation.businessId,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    revokedAt: invitation.revokedAt,
    invitedById: invitation.invitedById,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

function toListItem(invitation: Invitation, now: Date): InvitationListItem {
  return {
    ...toView(invitation),
    status: deriveInvitationStatus(invitation, now),
  };
}

function invalidInput(issues: { message: string }[]) {
  return {
    success: false as const,
    error: {
      code: "INVALID_INPUT" as const,
      message: issues[0]?.message ?? "بيانات الدعوة غير صالحة",
    },
  };
}

function failure(code: InvitationErrorCode, message: string) {
  return { success: false as const, error: { code, message } };
}

/** Narrow repository surface the service depends on (injectable). */
export type InvitationServiceDeps = Readonly<{
  invitations: Pick<
    InvitationRepository,
    | "createIfNoOpenInvitation"
    | "findByIdWithinBusiness"
    | "listByBusiness"
    | "revoke"
  >;
  businesses: Pick<BusinessRepository, "findById">;
}>;

const defaultDeps: InvitationServiceDeps = {
  invitations: invitationRepository,
  businesses: businessRepository,
};

/**
 * Creates an invitation for one Business. Duplicate OPEN invitations
 * (same Business + normalized email, not accepted/revoked/expired) are
 * rejected; expired, revoked, and accepted invitations never block a
 * new one. On success the raw token is returned exactly once — the
 * caller delivers it; only its hash was persisted.
 */
export async function createInvitation(
  input: unknown,
  deps: InvitationServiceDeps = defaultDeps,
): Promise<InvitationServiceResult<CreateInvitationSuccess>> {
  const parsed = createInvitationInputSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);

  const business = await deps.businesses.findById(parsed.data.businessId);
  if (!business) {
    return failure("BUSINESS_NOT_FOUND", "المنشأة غير موجودة");
  }

  const { rawToken, tokenHash } = generateInvitationToken();

  let invitation: Invitation | null;
  try {
    invitation = await deps.invitations.createIfNoOpenInvitation({
      businessId: parsed.data.businessId,
      email: parsed.data.email,
      role: parsed.data.role,
      tokenHash,
      expiresAt: invitationExpiresAt(),
      ...(parsed.data.invitedById !== undefined
        ? { invitedById: parsed.data.invitedById }
        : {}),
    });
  } catch {
    return failure("PERSISTENCE_FAILED", "تعذر إنشاء الدعوة الآن");
  }
  if (!invitation) {
    return failure(
      "INVITATION_ALREADY_OPEN",
      "توجد دعوة فعالة لهذا البريد بالفعل",
    );
  }

  return { success: true, data: { invitation: toView(invitation), rawToken } };
}

/**
 * Business-scoped listing (newest first, paginated). There is no global
 * invitation listing. Items carry the derived lifecycle status and never
 * include the token hash.
 */
export async function listInvitations(
  input: unknown,
  deps: InvitationServiceDeps = defaultDeps,
): Promise<InvitationServiceResult<ListInvitationsSuccess>> {
  const parsed = listInvitationsInputSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);

  let invitations: Invitation[];
  try {
    invitations = await deps.invitations.listByBusiness(
      parsed.data.businessId,
      {
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
      },
    );
  } catch {
    return failure("PERSISTENCE_FAILED", "تعذر تحميل الدعوات الآن");
  }

  const now = new Date();
  return {
    success: true,
    data: { items: invitations.map((i) => toListItem(i, now)) },
  };
}

/**
 * Revokes an invitation within the Business scope.
 * - unknown id / other Business → not found
 * - accepted → invalid state (acceptance is terminal)
 * - already revoked → idempotent success (no destructive repeat)
 * - pending (including expired-pending) → revoked
 * Acceptance is NOT implemented here.
 */
export async function revokeInvitation(
  input: unknown,
  deps: InvitationServiceDeps = defaultDeps,
): Promise<InvitationServiceResult<RevokeInvitationSuccess>> {
  const parsed = revokeInvitationInputSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);

  const invitation = await deps.invitations.findByIdWithinBusiness(
    parsed.data.invitationId,
    parsed.data.businessId,
  );
  if (!invitation) {
    return failure("INVITATION_NOT_FOUND", "الدعوة غير موجودة");
  }
  if (invitation.acceptedAt) {
    return failure("INVALID_INVITATION_STATE", "لا يمكن إلغاء دعوة تم قبولها");
  }
  if (invitation.revokedAt) {
    return { success: true, data: { invitation: toView(invitation) } };
  }

  let revoked: Invitation | null;
  try {
    revoked = await deps.invitations.revoke(
      parsed.data.invitationId,
      parsed.data.businessId,
    );
  } catch {
    return failure("PERSISTENCE_FAILED", "تعذر إلغاء الدعوة الآن");
  }
  if (!revoked) {
    return failure("INVITATION_NOT_FOUND", "الدعوة غير موجودة");
  }

  return { success: true, data: { invitation: toView(revoked) } };
}

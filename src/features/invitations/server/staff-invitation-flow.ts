import { createStaffInvitationInputSchema } from "@/features/invitations/schemas/invitation-schema";
import { createInvitation } from "@/features/invitations/server/invitation-service";
import type {
  CreateInvitationSuccess,
  CreateStaffInvitationResult,
  InvitationServiceResult,
} from "@/features/invitations/types";
import type { UserRole } from "@/types/domain";

/**
 * STAFF invitation creation flow (PROMPT-16, team management): THE
 * canonical add-staff path for the Team screen. Composes the EXISTING
 * `createInvitation` service — there is no second invitation system.
 *
 * Rules:
 * - The client may supply ONLY the invitee email (Zod strips every
 *   other key). The Business comes from the actor's session-derived
 *   context, the target role is always STAFF (DECISIONS #02 — no open
 *   role selection), and `invitedById` is the inviting ADMIN.
 * - Only Business ADMIN may invite STAFF; every write is scoped to the
 *   actor's own Business, so a hostile businessId can never reach the
 *   invitation.
 * - On success the raw invitation token is returned exactly once (the
 *   established creation contract — DECISIONS #23); the caller
 *   surfaces it to the ADMIN for manual delivery and must never
 *   persist or log it.
 *
 * The underlying service call is injectable (established
 * invitations-feature pattern) so the flow logic can be verified
 * without a live database.
 */

/** Authorization context derived from the authenticated session. */
export type StaffInvitationActor = {
  userId: string;
  role: UserRole;
  businessId: string | null;
};

/** Narrow service surface the flow depends on (injectable). */
export type StaffInvitationFlowDeps = Readonly<{
  createInvitation: (
    input: unknown,
  ) => Promise<InvitationServiceResult<CreateInvitationSuccess>>;
}>;

const defaultDeps: StaffInvitationFlowDeps = {
  createInvitation,
};

const FORBIDDEN_MESSAGE = "إدارة الفريق متاحة للمدير فقط";
const NO_BUSINESS_MESSAGE = "أكمل إعداد المنشأة أولاً";

function failure(
  code: Exclude<
    CreateStaffInvitationResult,
    { success: true }
  >["error"]["code"],
  message: string,
): CreateStaffInvitationResult {
  return { success: false, error: { code, message } };
}

/**
 * Creates a STAFF invitation for the actor's Business. Duplicate OPEN
 * invitations (same Business + email) surface as the typed
 * `INVITATION_ALREADY_OPEN` failure with an actionable Arabic message;
 * expired, revoked, and accepted invitations never block a new one.
 */
export async function createStaffInvitation(
  actor: StaffInvitationActor,
  input: unknown,
  deps: StaffInvitationFlowDeps = defaultDeps,
): Promise<CreateStaffInvitationResult> {
  if (actor.role !== "ADMIN") {
    return failure("FORBIDDEN", FORBIDDEN_MESSAGE);
  }
  if (!actor.businessId) {
    return failure("NO_BUSINESS", NO_BUSINESS_MESSAGE);
  }

  const parsed = createStaffInvitationInputSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "بريد الموظف غير صالح",
    );
  }

  // Server-derived authority: businessId from the actor's session
  // context, role fixed to STAFF, invitedById = the inviting ADMIN.
  // Nothing from the client input survives into the invitation.
  const result = await deps.createInvitation({
    businessId: actor.businessId,
    email: parsed.data.email,
    role: "STAFF",
    invitedById: actor.userId,
  });

  if (!result.success) {
    switch (result.error.code) {
      case "INVITATION_ALREADY_OPEN":
        return failure(result.error.code, result.error.message);
      case "BUSINESS_NOT_FOUND":
        return failure(result.error.code, result.error.message);
      case "PERSISTENCE_FAILED":
        return failure(result.error.code, result.error.message);
      default:
        return failure("INVALID_INPUT", result.error.message);
    }
  }

  return {
    success: true,
    invitation: result.data.invitation,
    rawToken: result.data.rawToken,
  };
}

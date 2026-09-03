import { activateAdminAccountInputSchema } from "@/features/invitations/schemas/invitation-schema";
import {
  acceptInvitation,
  activateAdminAccount,
} from "@/features/invitations/server/invitation-service";
import type {
  AcceptInvitationSuccess,
  ActivateAdminAccountSuccess,
  ActivationActionResult,
  InvitationErrorCode,
  InvitationServiceResult,
} from "@/features/invitations/types";

/**
 * Route-layer composition for the ADMIN activation screen (PROMPT-06):
 * composes the EXISTING acceptance and activation service operations —
 * no invitation lifecycle logic is duplicated here.
 *
 * Flow: validate with the existing activation schema → accept the
 * invitation (a `INVITATION_ALREADY_ACCEPTED` result is not an error
 * here: it is the resume path of an accepted-but-unactivated
 * invitation, including interrupted activations) → activate the ADMIN
 * account → map the typed service errors to safe Arabic UI states.
 *
 * Security properties (inherited from the services):
 * - Token-scoped: the persisted invitation is the sole authority for
 *   businessId/email/role — Zod strips every other key, so callers
 *   cannot override them.
 * - Results carry safe data only: never the raw token, the hash, the
 *   password, or any session token.
 */

/** Narrow service surface the composition depends on (injectable). */
export type AdminActivationFlowDeps = Readonly<{
  accept: (
    input: unknown,
  ) => Promise<InvitationServiceResult<AcceptInvitationSuccess>>;
  activate: (
    input: unknown,
  ) => Promise<InvitationServiceResult<ActivateAdminAccountSuccess>>;
}>;

const defaultDeps: AdminActivationFlowDeps = {
  accept: acceptInvitation,
  activate: activateAdminAccount,
};

/**
 * Maps a typed service error to the safe activation UI state. Service
 * messages are already safe Arabic strings without internals; the UI
 * state decides which terminal panel (and recovery action) renders.
 */
function toNotice(error: {
  code: InvitationErrorCode;
  message: string;
}): ActivationActionResult {
  switch (error.code) {
    case "INVALID_INPUT":
      return { status: "VALIDATION_ERROR", message: error.message };
    case "INVITATION_NOT_FOUND":
      return {
        status: "NOTICE",
        state: "INVALID_TOKEN",
        message: error.message,
      };
    case "INVITATION_EXPIRED":
      return { status: "NOTICE", state: "EXPIRED", message: error.message };
    case "INVITATION_REVOKED":
      return { status: "NOTICE", state: "REVOKED", message: error.message };
    case "ACCOUNT_ALREADY_ACTIVATED":
    case "INVITATION_ALREADY_ACCEPTED":
      // Only reachable as a terminal state when the invitation was
      // already activated — the accepted-but-unactivated resume path
      // is handled before this mapping.
      return {
        status: "NOTICE",
        state: "ALREADY_ACTIVATED",
        message: "تم تفعيل هذا الحساب بالفعل",
      };
    case "ROLE_NOT_ALLOWED":
      return {
        status: "NOTICE",
        state: "ROLE_NOT_ALLOWED",
        message: error.message,
      };
    case "ACCOUNT_CONFLICT":
      return { status: "NOTICE", state: "CONFLICT", message: error.message };
    default:
      return { status: "NOTICE", state: "FAILED", message: error.message };
  }
}

/**
 * Completes ADMIN activation in one submission: accept (resumable) →
 * activate. Returns the safe UI result consumed by the activation
 * screen — `SUCCESS` hands off to the sign-in → onboarding flow.
 */
export async function completeAdminActivation(
  input: unknown,
  deps: AdminActivationFlowDeps = defaultDeps,
): Promise<ActivationActionResult> {
  const parsed = activateAdminAccountInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message ?? "بيانات التفعيل غير صالحة",
    };
  }

  const accepted = await deps.accept({ token: parsed.data.token });
  if (
    !accepted.success &&
    accepted.error.code !== "INVITATION_ALREADY_ACCEPTED"
  ) {
    return toNotice(accepted.error);
  }

  const activated = await deps.activate({
    token: parsed.data.token,
    name: parsed.data.name,
    password: parsed.data.password,
  });
  if (!activated.success) {
    return toNotice(activated.error);
  }

  return { status: "SUCCESS", email: activated.data.invitation.email };
}

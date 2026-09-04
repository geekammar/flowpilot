"use server";

import { completeInvitedActivation } from "@/features/invitations/server/activation-flow";
import type { ActivationActionResult } from "@/features/invitations/types";

/**
 * Public server action behind the account activation screen (ADMIN
 * since PROMPT-06; both Business roles since PROMPT-16). The invitee
 * is not authenticated yet — the invitation token itself is the
 * credential, and the composed services enforce its lifecycle
 * server-side (hash-only lookup; the persisted invitation is the sole
 * authority for businessId/email/role). Input validation, error
 * mapping, and all security properties live in
 * `completeInvitedActivation` and the invitation service.
 */
export async function activateInvitedAccountAction(
  input: unknown,
): Promise<ActivationActionResult> {
  return completeInvitedActivation(input);
}

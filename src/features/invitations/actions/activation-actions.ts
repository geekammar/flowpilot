"use server";

import { completeAdminActivation } from "@/features/invitations/server/admin-activation-flow";
import type { ActivationActionResult } from "@/features/invitations/types";

/**
 * Public server action behind the ADMIN activation screen. The invitee
 * is not authenticated yet — the invitation token itself is the
 * credential, and the composed services enforce its lifecycle
 * server-side (hash-only lookup; the persisted invitation is the sole
 * authority for businessId/email/role). Input validation, error
 * mapping, and all security properties live in
 * `completeAdminActivation` and the invitation service.
 */
export async function activateInvitedAdminAction(
  input: unknown,
): Promise<ActivationActionResult> {
  return completeAdminActivation(input);
}

"use server";

import {
  createStaffInvitation,
  type StaffInvitationActor,
} from "@/features/invitations/server/staff-invitation-flow";
import type { CreateStaffInvitationResult } from "@/features/invitations/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

/**
 * Builds the authorization context from the authenticated session +
 * the database-backed user record. The Business is ALWAYS derived
 * server-side — a client-provided businessId can never override it.
 */
async function currentActor(): Promise<StaffInvitationActor> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  return {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: STAFF
    // with no Business can never invite anyone.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
}

/**
 * THE canonical STAFF-invitation action behind the Team screen's
 * invite dialog. Thin session wrapper only; every rule (ADMIN-only,
 * tenant scoping, email-only input, fixed STAFF role) lives in
 * `createStaffInvitation` and the underlying invitation service.
 */
export async function createStaffInvitationAction(
  input: unknown,
): Promise<CreateStaffInvitationResult> {
  const result = await createStaffInvitation(await currentActor(), input);
  if (result.success) {
    // The team screen lists pending invitations; a created one must
    // appear after the dialog closes (server data refresh).
    revalidatePath("/admin/team");
  }
  return result;
}

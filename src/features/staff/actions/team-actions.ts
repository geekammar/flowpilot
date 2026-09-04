"use server";

import {
  defaultTeamServiceDeps,
  setTeamMemberActive,
  type TeamActor,
} from "@/features/staff/server/team-service";
import type { SetTeamMemberActiveResult } from "@/features/staff/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

/**
 * Builds the authorization context from the authenticated session +
 * the database-backed user record. The Business is ALWAYS derived
 * server-side — a client-provided businessId can never override it.
 */
async function currentActor(): Promise<TeamActor> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  return {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: STAFF
    // with no Business can never manage the team.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
}

/**
 * Deactivate/reactivate a STAFF team member. Thin session wrapper
 * only; every rule (ADMIN-only, tenant scoping, STAFF-targets-only)
 * lives in the team service.
 */
export async function setTeamMemberActiveAction(
  input: unknown,
): Promise<SetTeamMemberActiveResult> {
  const result = await setTeamMemberActive(
    defaultTeamServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) {
    revalidatePath("/admin/team");
  }
  return result;
}

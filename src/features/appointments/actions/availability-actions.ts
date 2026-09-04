"use server";

import {
  defaultAvailabilityServiceDeps,
  getAvailability,
  type AvailabilityActor,
} from "@/features/appointments/server/availability-service";
import type { AvailabilityResult } from "@/features/appointments/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

/**
 * Availability read action (PROMPT-10) — the integration hook for the
 * future Smart Create Appointment flow (PROMPT-11). Thin wrapper only:
 * the actor is built from the authenticated session + DB user (the
 * Business is ALWAYS derived server-side; a client-provided
 * businessId can never override it), and all rules live in the
 * availability service.
 */
export async function getAvailabilityAction(
  input: unknown,
): Promise<AvailabilityResult> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  const actor: AvailabilityActor = {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: no
    // Business can never read availability.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
  return getAvailability(defaultAvailabilityServiceDeps, actor, input);
}

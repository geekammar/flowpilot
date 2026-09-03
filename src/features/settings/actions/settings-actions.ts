"use server";

import {
  defaultSettingsServiceDeps,
  updateBusinessSettings,
  type SettingsActor,
} from "@/features/settings/server/settings-service";
import type { SettingsActionResult } from "@/features/settings/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

/**
 * Builds the authorization context from the authenticated session +
 * the database-backed user record. The Business is ALWAYS derived
 * server-side — a client-provided businessId can never override it.
 */
async function currentActor(): Promise<SettingsActor> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  return {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: STAFF
    // with no Business can never touch Business settings.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
}

function revalidateSettings() {
  revalidatePath("/settings");
  // The dashboard and review surfaces read business identity fields;
  // the appointments surface reads booking behavior.
  revalidatePath("/");
  revalidatePath("/appointments");
}

export async function updateBusinessSettingsAction(
  input: unknown,
): Promise<SettingsActionResult> {
  const result = await updateBusinessSettings(
    defaultSettingsServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) revalidateSettings();
  return result;
}

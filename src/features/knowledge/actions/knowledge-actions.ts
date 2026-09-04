"use server";

import {
  createKnowledgeEntry,
  defaultKnowledgeServiceDeps,
  removeKnowledgeEntry,
  updateKnowledgeEntry,
  type KnowledgeActor,
} from "@/features/knowledge/server/knowledge-service";
import type { KnowledgeActionResult } from "@/features/knowledge/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

/**
 * Builds the authorization context from the authenticated session +
 * the database-backed user record. The Business is ALWAYS derived
 * server-side — a client-provided businessId can never override it.
 */
async function currentActor(): Promise<KnowledgeActor> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  return {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: STAFF
    // with no Business can never manage knowledge.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
}

function revalidateKnowledge() {
  revalidatePath("/settings/knowledge");
}

export async function createKnowledgeEntryAction(
  input: unknown,
): Promise<KnowledgeActionResult> {
  const result = await createKnowledgeEntry(
    defaultKnowledgeServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) revalidateKnowledge();
  return result;
}

export async function updateKnowledgeEntryAction(
  input: unknown,
): Promise<KnowledgeActionResult> {
  const result = await updateKnowledgeEntry(
    defaultKnowledgeServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) revalidateKnowledge();
  return result;
}

export async function removeKnowledgeEntryAction(
  input: unknown,
): Promise<KnowledgeActionResult> {
  const result = await removeKnowledgeEntry(
    defaultKnowledgeServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) revalidateKnowledge();
  return result;
}

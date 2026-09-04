import { faqEntrySchema } from "@/lib/validation";

import { z } from "zod";

/**
 * Form-level input for create/edit — the shared `faqEntrySchema`
 * contract (Arabic messages, question 1–500 chars, answer 1–2000
 * chars, both trimmed). The client NEVER sends a `businessId`, a role,
 * or any other tenant field — Zod strips every unknown key.
 */
export const knowledgeFormSchema = faqEntrySchema;

/**
 * Edit is addressed by the entry's CURRENT question — the natural key
 * of the JSON entries (the workflow enforces one entry per distinct
 * question). A stale/removed key fails honestly server-side.
 */
export const updateKnowledgeSchema = z.object({
  currentQuestion: z.string().trim().min(1),
  entry: faqEntrySchema,
});

/** Removal is addressed the same way — by the current question. */
export const removeKnowledgeSchema = z.object({
  question: z.string().trim().min(1),
});

export type KnowledgeFormInput = z.infer<typeof knowledgeFormSchema>;

import { customerValidation } from "@/lib/validation";

import { z } from "zod";

/**
 * Form-level input for create — the businessId is NEVER accepted from
 * the client; the server derives it from the authenticated session's
 * business membership. Field constraints (Arabic messages, name 2–120,
 * phone, optional notes ≤ 2000) come from the shared customer
 * validation contract.
 */
export const customerFormSchema = customerValidation.create.omit({
  businessId: true,
});

/** Directory search input — the free-text query ONLY (hostile keys stripped). */
export const customerSearchSchema = z.object({
  query: z
    .string({ error: "نص البحث غير صالح" })
    .trim()
    .max(100, "نص البحث طويل جداً"),
});

export type CustomerFormInput = z.infer<typeof customerFormSchema>;

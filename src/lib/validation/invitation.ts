import { emailSchema, uuidSchema } from "./common";
import { userRoleValues } from "./user";
import { z } from "zod";

/**
 * Invitation — FlowPilot domain concept (DECISIONS #22), separate from
 * Better Auth. These schemas are the repository input contract only;
 * HTTP request DTOs (creation/acceptance/sending) belong to later
 * prompts. Token generation + delivery are NOT part of this layer.
 */

const createInvitationSchema = z.object({
  businessId: uuidSchema,
  email: emailSchema,
  /** Reuses the Business role system (ADMIN/STAFF only — DECISIONS #02). */
  role: z.enum(userRoleValues),
  /** Secure hash of the invitation token — the raw token is never stored. */
  tokenHash: z
    .string()
    .min(32, "تجزئة الرمز قصيرة جداً")
    .max(256, "تجزئة الرمز طويلة جداً"),
  /** Server-computed expiry (e.g. now + TTL) — not user input. */
  expiresAt: z.date(),
  invitedById: uuidSchema.optional(),
});

export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;

export const invitationValidation = {
  create: createInvitationSchema,
} as const;

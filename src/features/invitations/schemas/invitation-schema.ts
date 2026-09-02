import {
  emailSchema,
  paginationSchema,
  userRoleValues,
  uuidSchema,
} from "@/lib/validation";

import { z } from "zod";

/**
 * Invitation workflow input schemas (server-side operations).
 * The repository input contract (`@/lib/validation/invitation`) stays
 * unchanged; these govern what callers may send to the service.
 *
 * Email normalization (trim + lowercase) happens here — the single place
 * for the invitation scope — so duplicate detection, persistence, and
 * filtering all use one canonical form. Global email behavior elsewhere
 * is untouched.
 */

export const createInvitationInputSchema = z.object({
  businessId: uuidSchema,
  email: z.string().trim().toLowerCase().pipe(emailSchema),
  role: z.enum(userRoleValues, "الدور غير صالح"),
  invitedById: uuidSchema.optional(),
});

export const listInvitationsInputSchema = paginationSchema.extend({
  businessId: uuidSchema,
});

export const revokeInvitationInputSchema = z.object({
  businessId: uuidSchema,
  invitationId: uuidSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;
export type ListInvitationsInput = z.infer<typeof listInvitationsInputSchema>;
export type RevokeInvitationInput = z.infer<typeof revokeInvitationInputSchema>;

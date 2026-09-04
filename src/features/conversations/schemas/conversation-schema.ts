import {
  conversationStatusValues,
  phoneSchema,
  uuidSchema,
} from "@/lib/validation";

import { z } from "zod";

export const conversationIdSchema = z.object({ id: uuidSchema });

export const assignConversationSchema = z.object({
  id: uuidSchema,
  assignedUserId: uuidSchema.nullable(),
});

export const transitionConversationSchema = z.object({
  id: uuidSchema,
  transition: z.enum(["TAKE_OVER", "RETURN_TO_AI", "MARK_BOOKED", "HANDOFF"]),
});

export const replySchema = z.object({
  id: uuidSchema,
  content: z.string().trim().min(1, "اكتب رسالة أولاً").max(4096),
});

export const summarySchema = z.object({
  id: uuidSchema,
  aiSummary: z.string().trim().max(4000, "الملخص طويل جداً"),
});

export const inboxStatusSchema = z.enum(conversationStatusValues);

/**
 * Canonical INBOUND WhatsApp-style message contract (PROMPT-19).
 *
 * Only what the transport legitimately owns may appear here. The payload
 * can NEVER control authority: `businessId`, `role`, internal customer or
 * conversation ids, assignment, or tenant identity are not part of the
 * contract — unknown keys are stripped by Zod, and the Business is always
 * resolved server-side from the receiving WhatsApp number (`to`) through
 * the established `BusinessRepository.findByWhatsappNumber` mapping.
 */
export const inboundMessageSchema = z.object({
  /** The business WhatsApp number the customer messaged. */
  to: phoneSchema,
  /** The customer's phone number. */
  from: phoneSchema,
  /** Message text. */
  text: z
    .string()
    .trim()
    .min(1, "نص الرسالة فارغ")
    .max(4096, "الرسالة طويلة جداً"),
  /** When the message arrived on the transport. */
  receivedAt: z.iso.datetime(),
  /** Provider message id when available — accepted, not yet persisted. */
  externalId: z.string().trim().min(1).max(256).optional(),
});

export type InboundMessageInput = z.infer<typeof inboundMessageSchema>;

export type ReplyInput = z.infer<typeof replySchema>;
export type SummaryInput = z.infer<typeof summarySchema>;

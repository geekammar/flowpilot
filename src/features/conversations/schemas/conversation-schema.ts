import { conversationStatusValues, uuidSchema } from "@/lib/validation";

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

export type ReplyInput = z.infer<typeof replySchema>;
export type SummaryInput = z.infer<typeof summarySchema>;

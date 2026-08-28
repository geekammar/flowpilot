"use server";

import {
  assignConversationSchema,
  replySchema,
  summarySchema,
  transitionConversationSchema,
} from "@/features/conversations/schemas/conversation-schema";
import type { ConversationActionResult } from "@/features/conversations/types";
import { requireUser } from "@/server/auth/guards";
import { conversationRepository, userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

async function actionContext(conversationId: string) {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  if (!user?.businessId) return null;
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation || conversation.businessId !== user.businessId) return null;
  return { user, conversation };
}

function failure(message: string): ConversationActionResult {
  return { success: false, message };
}

function refreshConversation(id: string) {
  revalidatePath("/conversations");
  revalidatePath(`/conversations/${id}`);
  revalidatePath("/");
}

export async function assignConversation(
  input: unknown,
): Promise<ConversationActionResult> {
  const parsed = assignConversationSchema.safeParse(input);
  if (!parsed.success) return failure("تعذر تعيين المحادثة");
  const context = await actionContext(parsed.data.id);
  if (!context) return failure("المحادثة غير موجودة");

  if (parsed.data.assignedUserId) {
    const assignee = await userRepository.findById(parsed.data.assignedUserId);
    if (
      !assignee?.isActive ||
      assignee.businessId !== context.user.businessId
    ) {
      return failure("عضو الفريق غير متاح");
    }
  }

  try {
    await conversationRepository.updateWorkflow(parsed.data.id, {
      assignedUserId: parsed.data.assignedUserId,
      ...(parsed.data.assignedUserId ? { status: "NEED_HUMAN" } : {}),
    });
    refreshConversation(parsed.data.id);
    return { success: true };
  } catch {
    return failure("تعذر تعيين المحادثة الآن");
  }
}

export async function transitionConversation(
  input: unknown,
): Promise<ConversationActionResult> {
  const parsed = transitionConversationSchema.safeParse(input);
  if (!parsed.success) return failure("الإجراء غير صالح");
  const context = await actionContext(parsed.data.id);
  if (!context) return failure("المحادثة غير موجودة");

  const transitions = {
    TAKE_OVER: {
      status: "NEED_HUMAN" as const,
      assignedUserId: context.user.id,
    },
    RETURN_TO_AI: {
      status: "AI_ACTIVE" as const,
      assignedUserId: null,
    },
    MARK_BOOKED: { status: "BOOKED" as const },
    HANDOFF: { status: "NEED_HUMAN" as const, assignedUserId: null },
  };

  try {
    await conversationRepository.updateWorkflow(
      parsed.data.id,
      transitions[parsed.data.transition],
    );
    refreshConversation(parsed.data.id);
    return { success: true };
  } catch {
    return failure("تعذر تحديث حالة المحادثة");
  }
}

export async function sendStaffReply(
  input: unknown,
): Promise<ConversationActionResult> {
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "الرسالة غير صالحة");
  }
  const context = await actionContext(parsed.data.id);
  if (!context) return failure("المحادثة غير موجودة");

  try {
    await conversationRepository.addMessage(
      {
        conversationId: parsed.data.id,
        senderType: "STAFF",
        content: parsed.data.content,
      },
      {
        assignedUserId: context.user.id,
        status: "NEED_HUMAN",
      },
    );
    refreshConversation(parsed.data.id);
    return { success: true };
  } catch {
    return failure("تعذر إرسال الرد الآن");
  }
}

export async function updateAiSummary(
  input: unknown,
): Promise<ConversationActionResult> {
  const parsed = summarySchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "الملخص غير صالح");
  }
  const context = await actionContext(parsed.data.id);
  if (!context) return failure("المحادثة غير موجودة");

  try {
    await conversationRepository.update(parsed.data.id, {
      aiSummary: parsed.data.aiSummary || null,
    });
    refreshConversation(parsed.data.id);
    return { success: true };
  } catch {
    return failure("تعذر حفظ الملخص الآن");
  }
}

import type {
  ConversationDetailData,
  InboxConversation,
  InboxUser,
} from "@/features/conversations/types";
import {
  appointmentRepository,
  conversationRepository,
  userRepository,
} from "@/server/repositories";

export async function getConversationInbox(businessId: string) {
  const [conversations, users] = await Promise.all([
    conversationRepository.listInbox(businessId),
    userRepository.listByBusiness({ businessId }, { pageSize: 100 }),
  ]);

  const team: InboxUser[] = users
    .filter((user) => user.isActive)
    .map((user) => ({ id: user.id, name: user.name, image: user.image }));
  const items: InboxConversation[] = conversations.map((conversation) => {
    const lastMessage = conversation.messages[0];
    return {
      id: conversation.id,
      status: conversation.status,
      customer: conversation.customer,
      assignedUser: conversation.assignedTo,
      lastMessage: lastMessage
        ? {
            ...lastMessage,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
      lastActivityAt: (
        conversation.lastMessageAt ?? conversation.createdAt
      ).toISOString(),
    };
  });

  return { items, team };
}

export async function getConversationDetail(
  businessId: string,
  conversationId: string,
  currentUserId: string,
): Promise<ConversationDetailData | null> {
  const conversation = await conversationRepository.findDetailByBusiness(
    conversationId,
    businessId,
  );
  if (!conversation) return null;

  const [appointments, users] = await Promise.all([
    appointmentRepository.listRecentByCustomer(
      businessId,
      conversation.customerId,
    ),
    userRepository.listByBusiness({ businessId }, { pageSize: 100 }),
  ]);

  return {
    id: conversation.id,
    status: conversation.status,
    aiSummary: conversation.aiSummary ?? "",
    customer: {
      id: conversation.customer.id,
      name: conversation.customer.name,
      phone: conversation.customer.phone,
      notes: conversation.customer.notes,
    },
    assignedUser: conversation.assignedTo,
    currentUserId,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      senderType: message.senderType,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString().slice(0, 10),
      startTime: appointment.startTime.toISOString(),
      status: appointment.status,
      notes: appointment.notes,
      service: appointment.service,
    })),
    team: users
      .filter((user) => user.isActive)
      .map((user) => ({ id: user.id, name: user.name, image: user.image })),
  };
}

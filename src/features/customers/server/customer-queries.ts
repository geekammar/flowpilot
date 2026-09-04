import type { CustomerDetailData } from "@/features/customers/types";
import type {
  AppointmentRepository,
  ConversationRepository,
  CustomerRepository,
} from "@/server/repositories";
import {
  appointmentRepository,
  conversationRepository,
  customerRepository,
} from "@/server/repositories";

/**
 * Customer detail read (PROMPT-15): identity + the customer's full
 * history inside ONE Business. Tenant-scoped like every detail read:
 * a customer from another Business is indistinguishable from a
 * missing one (fetch, then verify ownership — the established
 * detail-read pattern). Repository collaborators are injectable
 * (defaulting to the app singletons) so the read stays verifiable
 * without a live database — the established injectable-deps pattern.
 */
export type CustomerQueryDeps = {
  customerRepository: Pick<CustomerRepository, "findById">;
  appointmentRepository: Pick<AppointmentRepository, "listRecentByCustomer">;
  conversationRepository: Pick<ConversationRepository, "listByCustomer">;
};

export const defaultCustomerQueryDeps: CustomerQueryDeps = {
  customerRepository,
  appointmentRepository,
  conversationRepository,
};

export async function getCustomerDetail(
  businessId: string,
  customerId: string,
  deps: CustomerQueryDeps = defaultCustomerQueryDeps,
): Promise<CustomerDetailData | null> {
  const customer = await deps.customerRepository.findById(customerId);
  if (!customer || customer.businessId !== businessId) return null;

  const [appointments, conversations] = await Promise.all([
    deps.appointmentRepository.listRecentByCustomer(
      businessId,
      customer.id,
      50,
    ),
    deps.conversationRepository.listByCustomer(businessId, customer.id),
  ]);

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    notes: customer.notes,
    createdAt: customer.createdAt.toISOString(),
    lastConversationAt: customer.lastConversationAt?.toISOString() ?? null,
    lastAppointmentAt: customer.lastAppointmentAt?.toISOString() ?? null,
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString().slice(0, 10),
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      service: appointment.service,
    })),
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      status: conversation.status,
      lastActivityAt: (
        conversation.lastMessageAt ?? conversation.createdAt
      ).toISOString(),
    })),
  };
}

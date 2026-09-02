/**
 * Repository layer — the only place that talks to Prisma directly.
 *
 * Rules:
 * - Repositories accept validated DTOs (from `@/lib/validation`) and
 *   return typed models (`@/types/domain`).
 * - Soft deletes: reads always filter `deletedAt: null`; writes flag
 *   `deletedAt` instead of removing rows.
 * - Features depend on these repositories, never on `db` directly.
 */

import { AppointmentRepository } from "./appointment.repository";
import { BusinessRepository } from "./business.repository";
import { ConversationRepository } from "./conversation.repository";
import { CustomerRepository } from "./customer.repository";
import { InvitationRepository } from "./invitation.repository";
import { ServiceRepository } from "./service.repository";
import { UserRepository } from "./user.repository";

export const businessRepository = new BusinessRepository();
export const userRepository = new UserRepository();
export const serviceRepository = new ServiceRepository();
export const customerRepository = new CustomerRepository();
export const conversationRepository = new ConversationRepository();
export const appointmentRepository = new AppointmentRepository();
export const invitationRepository = new InvitationRepository();

export {
  AppointmentRepository,
  BusinessRepository,
  ConversationRepository,
  CustomerRepository,
  InvitationRepository,
  ServiceRepository,
  UserRepository,
};

/**
 * Smart Create Appointment flow reads (PROMPT-11 — Steps 1–3).
 *
 * Focused, tenant-scoped reads for the booking wizard:
 * - `searchBookingCustomers` — Step 1 (العميل): search by name or phone
 *   through the EXISTING `CustomerRepository.listByBusiness` search
 *   primitive (name OR phone substring, soft-deletes excluded). An
 *   empty query returns the most recent customers instead of searching.
 * - `listBookingServices` — Step 2 (الخدمة): active services only —
 *   the same rule every booking path enforces (inactive services are
 *   not selectable).
 *
 * The Business is ALWAYS the actor's own, derived from the
 * authenticated session — client input never carries or overrides it.
 * Repository collaborators are injectable (defaulting to the app
 * singletons) so the workflow logic can be verified without a live
 * database — the established invitations/services/availability pattern.
 */

import { bookingCustomerSearchSchema } from "@/features/appointments/schemas/booking-flow-schema";
import type {
  BookingCustomerOption,
  BookingCustomerSearchResult,
  BookingServiceOption,
} from "@/features/appointments/types";
import type {
  CustomerRepository,
  ServiceRepository,
} from "@/server/repositories";
import { customerRepository, serviceRepository } from "@/server/repositories";
import type { UserRole } from "@/types/domain";

/** Authorization context derived from the authenticated session. */
export type BookingFlowActor = {
  userId: string;
  role: UserRole;
  businessId: string | null;
};

export type BookingFlowServiceDeps = {
  customerRepository: Pick<CustomerRepository, "listByBusiness">;
  serviceRepository: Pick<ServiceRepository, "listByBusiness">;
};

/** Production dependencies (app singletons). */
export const defaultBookingFlowServiceDeps: BookingFlowServiceDeps = {
  customerRepository,
  serviceRepository,
};

const NO_BUSINESS_MESSAGE = "أكمل إعداد المنشأة أولاً";
const SEARCH_FAILED_MESSAGE = "تعذر البحث الآن، حاول مرة أخرى";

/** How many customers one search result page carries. */
const CUSTOMER_PAGE_SIZE = 20;

function toCustomerOption(customer: {
  id: string;
  name: string;
  phone: string;
}): BookingCustomerOption {
  return { id: customer.id, name: customer.name, phone: customer.phone };
}

function toServiceOption(service: {
  id: string;
  name: string;
  durationMinutes: number;
}): BookingServiceOption {
  return {
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
  };
}

/**
 * Step 1 — search the actor's Business customers by name or phone.
 * An empty (or whitespace-only) query lists the most recent customers.
 * Both ADMIN and STAFF may read (booking is a business operation).
 */
export async function searchBookingCustomers(
  deps: BookingFlowServiceDeps,
  actor: BookingFlowActor,
  input: unknown,
): Promise<BookingCustomerSearchResult> {
  const parsed = bookingCustomerSearchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "نص البحث غير صالح",
    };
  }

  if (!actor.businessId) {
    return { success: false, message: NO_BUSINESS_MESSAGE };
  }

  try {
    const customers = await deps.customerRepository.listByBusiness(
      actor.businessId,
      {
        search: parsed.data.query || undefined,
        rawPagination: { pageSize: CUSTOMER_PAGE_SIZE },
      },
    );
    return { success: true, customers: customers.map(toCustomerOption) };
  } catch {
    return { success: false, message: SEARCH_FAILED_MESSAGE };
  }
}

/**
 * Step 2 — the actor's Business bookable services. Active services
 * only: inactive services are never selectable in a booking flow.
 */
export async function listBookingServices(
  deps: BookingFlowServiceDeps,
  actor: BookingFlowActor,
): Promise<BookingServiceOption[] | { message: string }> {
  if (!actor.businessId) return { message: NO_BUSINESS_MESSAGE };
  try {
    const services = await deps.serviceRepository.listByBusiness(
      actor.businessId,
      { rawPagination: { pageSize: 100 } },
    );
    return services.map(toServiceOption);
  } catch {
    return { message: "تعذر تحميل الخدمات الآن، حاول مرة أخرى" };
  }
}

/**
 * Customers management workflow (PROMPT-15).
 *
 * THE single customer-creation path: every UI (the customers
 * directory, the Smart Create flow's Step 1) creates customers through
 * `createCustomer` — there is no second persistence path. Rules:
 *
 * - Zod validation at the server boundary (the shared
 *   `@/lib/validation` customer contract): a client can never supply
 *   `businessId` — the Business is ALWAYS the actor's own, derived
 *   from the authenticated session, so a hostile businessId is
 *   stripped and cross-tenant writes are impossible.
 * - Duplicate handling honors the unique-per-business phone
 *   constraint: an existing customer with the same phone surfaces as
 *   the typed `DUPLICATE_PHONE` failure with an actionable Arabic
 *   message (the DB unique-constraint error is caught as a fallback).
 * - The directory search reuses the EXISTING
 *   `CustomerRepository.listByBusiness` primitive (name OR phone
 *   substring, soft-deletes excluded) — the same primitive the
 *   booking-flow search reads through.
 *
 * Repository collaborators are injectable (defaulting to the app
 * singletons) so the workflow logic can be verified without a live
 * database — the established invitations/services/availability
 * pattern.
 */

import {
  customerFormSchema,
  customerSearchSchema,
} from "@/features/customers/schemas/customer-schema";
import type {
  CreateCustomerActionResult,
  CustomerListItem,
  CustomerSearchResult,
} from "@/features/customers/types";
import type { CustomerRepository } from "@/server/repositories";
import { customerRepository } from "@/server/repositories";
import type { Customer, UserRole } from "@/types/domain";

/** Authorization context derived from the authenticated session. */
export type CustomerActor = {
  userId: string;
  role: UserRole;
  businessId: string | null;
};

export type CustomerServiceDeps = {
  customerRepository: Pick<
    CustomerRepository,
    "listByBusiness" | "findByPhone" | "create"
  >;
};

/** Production dependencies (app singletons). */
export const defaultCustomerServiceDeps: CustomerServiceDeps = {
  customerRepository,
};

const NO_BUSINESS_MESSAGE = "أكمل إعداد المنشأة أولاً";
const SEARCH_FAILED_MESSAGE = "تعذر البحث الآن، حاول مرة أخرى";
const DUPLICATE_PHONE_MESSAGE =
  "هذا الرقم مسجّل بالفعل لعميل آخر — ابحث به أولاً أو استخدم رقماً مختلفاً";
const CREATE_FAILED_MESSAGE = "تعذر حفظ العميل الآن";

/** How many customers one directory result page carries. */
const CUSTOMER_PAGE_SIZE = 20;

function toListItem(customer: Customer): CustomerListItem {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    lastConversationAt: customer.lastConversationAt?.toISOString() ?? null,
    lastAppointmentAt: customer.lastAppointmentAt?.toISOString() ?? null,
  };
}

/**
 * Search the actor's Business customers by name or phone (directory
 * view). An empty (or whitespace-only) query lists the most recent
 * customers. Both ADMIN and STAFF may read — the directory is a
 * business operation surface.
 */
export async function listCustomers(
  deps: CustomerServiceDeps,
  actor: CustomerActor,
  input: unknown,
): Promise<CustomerSearchResult> {
  const parsed = customerSearchSchema.safeParse(input);
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
    return { success: true, customers: customers.map(toListItem) };
  } catch {
    return { success: false, message: SEARCH_FAILED_MESSAGE };
  }
}

/**
 * Create a customer in the actor's Business — the ONE canonical
 * creation path. The phone must be unique within the Business
 * (existing active customer → typed `DUPLICATE_PHONE`); validation
 * failures and transport failures carry typed codes with Arabic
 * messages.
 */
export async function createCustomer(
  deps: CustomerServiceDeps,
  actor: CustomerActor,
  input: unknown,
): Promise<CreateCustomerActionResult> {
  const parsed = customerFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION",
      message: parsed.error.issues[0]?.message ?? "بيانات العميل غير صالحة",
    };
  }

  if (!actor.businessId) {
    return {
      success: false,
      code: "NO_BUSINESS",
      message: NO_BUSINESS_MESSAGE,
    };
  }

  const existing = await deps.customerRepository.findByPhone(
    actor.businessId,
    parsed.data.phone,
  );
  if (existing) {
    return {
      success: false,
      code: "DUPLICATE_PHONE",
      message: DUPLICATE_PHONE_MESSAGE,
    };
  }

  try {
    const customer = await deps.customerRepository.create({
      businessId: actor.businessId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
    });
    return { success: true, customer: toListItem(customer) };
  } catch (error) {
    // The DB unique-per-business phone constraint is the final guard
    // (e.g. a soft-deleted customer still occupies the phone).
    if ((error as { code?: string }).code === "P2002") {
      return {
        success: false,
        code: "DUPLICATE_PHONE",
        message: DUPLICATE_PHONE_MESSAGE,
      };
    }
    return {
      success: false,
      code: "CREATE_FAILED",
      message: CREATE_FAILED_MESSAGE,
    };
  }
}

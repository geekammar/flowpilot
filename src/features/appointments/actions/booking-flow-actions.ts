"use server";

import {
  defaultBookingFlowServiceDeps,
  searchBookingCustomers,
  type BookingFlowActor,
} from "@/features/appointments/server/booking-flow-service";
import type { BookingCustomerSearchResult } from "@/features/appointments/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

/**
 * Booking-flow customer search action (PROMPT-11, Step 1) — thin
 * wrapper only: the actor is built from the authenticated session +
 * DB user (the Business is ALWAYS derived server-side; a
 * client-provided businessId can never override it), and all rules
 * live in the booking-flow service.
 */
export async function searchBookingCustomersAction(
  input: unknown,
): Promise<BookingCustomerSearchResult> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  const actor: BookingFlowActor = {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: no
    // Business means the search can never read another tenant.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
  return searchBookingCustomers(defaultBookingFlowServiceDeps, actor, input);
}

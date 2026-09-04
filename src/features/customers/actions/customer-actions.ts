"use server";

import {
  createCustomer,
  defaultCustomerServiceDeps,
  listCustomers,
  type CustomerActor,
} from "@/features/customers/server/customer-service";
import type {
  CreateCustomerActionResult,
  CustomerSearchResult,
} from "@/features/customers/types";
import { requireUser } from "@/server/auth/guards";
import { userRepository } from "@/server/repositories";

import { revalidatePath } from "next/cache";

/**
 * Builds the authorization context from the authenticated session +
 * the database-backed user record. The Business is ALWAYS derived
 * server-side — a client-provided businessId can never override it.
 */
async function currentActor(): Promise<CustomerActor> {
  const session = await requireUser();
  const user = await userRepository.findById(session.user.id);
  return {
    userId: session.user.id,
    // No user record (deleted mid-session) → least privilege: STAFF
    // with no Business can never read or write another tenant.
    role: user?.role ?? "STAFF",
    businessId: user?.businessId ?? null,
  };
}

/** Directory search (name/phone) — tenant-scoped through the service. */
export async function searchCustomersAction(
  input: unknown,
): Promise<CustomerSearchResult> {
  return listCustomers(defaultCustomerServiceDeps, await currentActor(), input);
}

/**
 * THE canonical customer-creation action (directory + Smart Create
 * Step 1 both submit here). Thin session wrapper only; every rule
 * lives in the customers service.
 */
export async function createCustomerAction(
  input: unknown,
): Promise<CreateCustomerActionResult> {
  const result = await createCustomer(
    defaultCustomerServiceDeps,
    await currentActor(),
    input,
  );
  if (result.success) {
    revalidatePath("/customers");
    revalidatePath(`/customers/${result.customer.id}`);
    // The Smart Create Step 1 initial customer list reads customers.
    revalidatePath("/appointments/new");
  }
  return result;
}

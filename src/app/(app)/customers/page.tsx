import { CustomersDirectory } from "@/features/customers/components/customers-directory";
import {
  defaultCustomerServiceDeps,
  listCustomers,
  type CustomerActor,
} from "@/features/customers/server/customer-service";
import { requireUser } from "@/server/auth/guards";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "العملاء",
};

/**
 * Customers directory (PROMPT-15). The Business is derived from the
 * authenticated session (never client input), and the initial
 * customer list is read through the customers service
 * (tenant-scoped); live search runs through the same service via the
 * debounced server action.
 */
export default async function CustomersPage() {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding");

  // Session role normalization: anything non-ADMIN behaves as STAFF
  // (least privilege — same fallback as the other app pages).
  const actor: CustomerActor = {
    userId: session.user.id,
    role: session.user.role === "ADMIN" ? "ADMIN" : "STAFF",
    businessId: session.user.businessId,
  };
  const result = await listCustomers(defaultCustomerServiceDeps, actor, {
    query: "",
  });

  return (
    <CustomersDirectory
      initialCustomers={result.success ? result.customers : []}
    />
  );
}

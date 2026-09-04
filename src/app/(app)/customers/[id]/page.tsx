import { CustomerDetailScreen } from "@/features/customers/components/customer-detail-screen";
import { getCustomerDetail } from "@/features/customers/server/customer-queries";
import { requireUser } from "@/server/auth/guards";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "بيانات العميل",
};

/**
 * Customer detail (PROMPT-15): identity + appointment history +
 * conversation history. Tenant-scoped read — a customer from another
 * Business is indistinguishable from a missing one.
 */
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding");
  const { id } = await params;
  const customer = await getCustomerDetail(session.user.businessId, id);
  if (!customer) notFound();

  return <CustomerDetailScreen customer={customer} />;
}

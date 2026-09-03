import { ServicesScreen } from "@/features/services/components/services-screen";
import {
  defaultServiceServiceDeps,
  listServices,
  type ServiceActor,
} from "@/features/services/server/service-service";
import type { ServiceListItem } from "@/features/services/types";
import { requireRole } from "@/server/auth/guards";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "الخدمات",
};

/**
 * Services catalog management — ADMIN-only (STAFF is redirected).
 * The Business is derived from the authenticated session; the service
 * layer enforces the role + tenant scoping server-side.
 */
export default async function ServicesPage() {
  const session = await requireRole("ADMIN");
  if (!session.user.businessId) redirect("/onboarding");

  const actor: ServiceActor = {
    userId: session.user.id,
    role: "ADMIN", // asserted by the guard above
    businessId: session.user.businessId,
  };
  const result = await listServices(defaultServiceServiceDeps, actor);
  const services: ServiceListItem[] = Array.isArray(result) ? result : [];

  return <ServicesScreen initialServices={services} />;
}

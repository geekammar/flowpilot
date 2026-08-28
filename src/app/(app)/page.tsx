import { Dashboard } from "@/features/dashboard/components/dashboard";
import { getDashboardData } from "@/features/dashboard/server/dashboard-query";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await requireUser();
  if (session.user.role === "STAFF") redirect("/staff");
  if (!session.user.businessId) redirect("/onboarding");

  const business = await businessRepository.findById(session.user.businessId);
  if (!business || !business.onboardingCompletedAt) redirect("/onboarding");

  const data = await getDashboardData(business.id, business.timezone);

  return (
    <Dashboard
      businessName={business.name}
      timeZone={business.timezone}
      data={data}
    />
  );
}

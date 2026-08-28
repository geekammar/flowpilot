import { CompletionCard } from "@/features/onboarding/components/completion-card";
import {
  availabilitySchema,
  businessSetupSchema,
  knowledgeSchema,
} from "@/features/onboarding/schemas/onboarding-schema";
import { requireUser } from "@/server/auth/guards";
import { businessRepository, serviceRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

export default async function OnboardingCompletePage() {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding/business");

  const [business, services] = await Promise.all([
    businessRepository.findById(session.user.businessId),
    serviceRepository.listByBusiness(session.user.businessId),
  ]);
  if (!business || !businessSetupSchema.safeParse(business).success) {
    redirect("/onboarding/business");
  }
  if (services.length === 0) redirect("/onboarding/services");
  if (
    !availabilitySchema.safeParse({
      workingHours: business.workingHours,
      slotDurationMinutes: business.slotDurationMinutes,
    }).success
  ) {
    redirect("/onboarding/availability");
  }
  if (
    !knowledgeSchema.safeParse({
      about: business.about,
      faqs: business.faqs,
      cancellationPolicy: business.cancellationPolicy,
    }).success
  ) {
    redirect("/onboarding/knowledge");
  }

  return <CompletionCard />;
}

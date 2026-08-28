import { BusinessSetupForm } from "@/features/onboarding/components/business-setup-form";
import { StepHeader } from "@/features/onboarding/components/step-header";
import type { BusinessSetupInput } from "@/features/onboarding/schemas/onboarding-schema";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

export default async function OnboardingBusinessPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const defaults: BusinessSetupInput = {
    name: business?.name ?? "",
    city: business?.city ?? "",
    whatsappNumber: business?.whatsappNumber ?? "+20",
    timezone: business?.timezone ?? "Africa/Cairo",
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="لنبدأ ببيانات منشأتك"
        description="هذه المعلومات تساعد FlowPilot على تخصيص تجربة الحجز لعملائك."
      />
      <BusinessSetupForm defaultValues={defaults} />
    </div>
  );
}

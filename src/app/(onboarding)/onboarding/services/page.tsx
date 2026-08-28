import { ServicesForm } from "@/features/onboarding/components/services-form";
import { StepHeader } from "@/features/onboarding/components/step-header";
import { requireUser } from "@/server/auth/guards";
import { serviceRepository } from "@/server/repositories";

export default async function OnboardingServicesPage() {
  const session = await requireUser();
  const services = session.user.businessId
    ? await serviceRepository.listByBusiness(session.user.businessId)
    : [];

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="ما الخدمات التي تقدمها؟"
        description="أضف الخدمات التي يمكن للعملاء حجزها. يمكنك تعديلها أو حذفها لاحقاً."
      />
      <ServicesForm
        initialServices={services.map((service) => ({
          id: service.id,
          name: service.name,
          durationMinutes: service.durationMinutes,
        }))}
      />
    </div>
  );
}

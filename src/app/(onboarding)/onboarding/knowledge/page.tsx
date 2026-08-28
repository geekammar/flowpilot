import { KnowledgeForm } from "@/features/onboarding/components/knowledge-form";
import { StepHeader } from "@/features/onboarding/components/step-header";
import {
  faqSchema,
  type KnowledgeInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

export default async function OnboardingKnowledgePage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const storedFaqs = faqSchema.array().safeParse(business?.faqs);
  const defaults: KnowledgeInput = {
    about: business?.about ?? "",
    faqs: storedFaqs.success ? storedFaqs.data : [],
    cancellationPolicy: business?.cancellationPolicy ?? "",
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="عرّف العملاء بمنشأتك"
        description="أضف المعلومات التي يحتاجها المساعد ليجيب بثقة ووضوح."
      />
      <KnowledgeForm defaultValues={defaults} />
    </div>
  );
}

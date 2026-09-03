import { BookingBasicsForm } from "@/features/onboarding/components/booking-basics-form";
import { StepHeader } from "@/features/onboarding/components/step-header";
import type { BookingBasicsInput } from "@/features/onboarding/schemas/onboarding-schema";
import { getOnboardingProgress } from "@/features/onboarding/server/onboarding-progress";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

export default async function OnboardingBookingPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const progress = getOnboardingProgress(business);
  if (!progress.businessValid) redirect("/onboarding/business");
  if (!progress.hoursValid) redirect("/onboarding/hours");

  const defaults: BookingBasicsInput = {
    slotDurationMinutes: business?.slotDurationMinutes ?? 30,
    cancellationPolicy: business?.cancellationPolicy ?? "",
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="إعدادات الحجز الأساسية"
        description="أساسيات يحتاجها الحجز عند تشغيل منشأتك — يمكنك توسيعها لاحقاً."
      />
      <BookingBasicsForm defaultValues={defaults} />
    </div>
  );
}

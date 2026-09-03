import { ReviewCard } from "@/features/onboarding/components/review-card";
import { StepHeader } from "@/features/onboarding/components/step-header";
import {
  DAYS,
  TIMEZONES,
  workingHoursStepSchema,
} from "@/features/onboarding/schemas/onboarding-schema";
import { getOnboardingProgress } from "@/features/onboarding/server/onboarding-progress";
import type { ReviewSummary } from "@/features/onboarding/types";
import { VERTICAL_LABELS, verticalSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

export default async function OnboardingReviewPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const progress = getOnboardingProgress(business);
  if (progress.completed) redirect("/");
  if (!progress.businessValid) redirect("/onboarding/business");
  if (!progress.hoursValid) redirect("/onboarding/hours");
  if (!progress.bookingValid) redirect("/onboarding/booking");
  if (!business) redirect("/onboarding/business");

  const vertical = verticalSchema.parse(business.vertical);
  const storedHours = workingHoursStepSchema.shape.workingHours.parse(
    business.workingHours,
  );
  const timezone = TIMEZONES.find((tz) => tz.value === business.timezone);

  const summary: ReviewSummary = {
    businessName: business.name,
    verticalLabel: VERTICAL_LABELS[vertical],
    city: business.city ?? "",
    whatsappNumber: business.whatsappNumber,
    timezoneLabel: timezone?.label ?? business.timezone,
    about: business.about && business.about.length > 0 ? business.about : null,
    workingHours: DAYS.map(({ key, label }) => ({
      key,
      label,
      open: storedHours[key].open,
      close: storedHours[key].close,
      closed: storedHours[key].closed,
    })),
    slotDurationMinutes: business.slotDurationMinutes,
    cancellationPolicy: business.cancellationPolicy ?? "",
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="مراجعة وتشغيل"
        description="راجع بياناتك قبل الانطلاق — يمكنك تعديل أي خطوة، ثم شغّل منشأتك."
      />
      <ReviewCard summary={summary} />
    </div>
  );
}

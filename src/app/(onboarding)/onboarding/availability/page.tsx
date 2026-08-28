import { AvailabilityForm } from "@/features/onboarding/components/availability-form";
import { StepHeader } from "@/features/onboarding/components/step-header";
import {
  DAYS,
  availabilitySchema,
  type AvailabilityInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

function defaultHours(): AvailabilityInput["workingHours"] {
  return Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      { open: "09:00", close: "17:00", closed: key === "fri" },
    ]),
  ) as AvailabilityInput["workingHours"];
}

export default async function OnboardingAvailabilityPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const storedHours = availabilitySchema.shape.workingHours.safeParse(
    business?.workingHours,
  );
  const defaults: AvailabilityInput = {
    workingHours: storedHours.success ? storedHours.data : defaultHours(),
    slotDurationMinutes: business?.slotDurationMinutes ?? 30,
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="متى تستقبل المواعيد؟"
        description="حدد الأيام والساعات التي تظهر للعملاء عند اقتراح موعد."
      />
      <AvailabilityForm defaultValues={defaults} />
    </div>
  );
}

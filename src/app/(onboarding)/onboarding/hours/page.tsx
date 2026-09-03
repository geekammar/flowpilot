import { StepHeader } from "@/features/onboarding/components/step-header";
import { WorkingHoursForm } from "@/features/onboarding/components/working-hours-form";
import {
  DAYS,
  workingHoursStepSchema,
  type WorkingHoursStepInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import { getOnboardingProgress } from "@/features/onboarding/server/onboarding-progress";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

function defaultHours(): WorkingHoursStepInput["workingHours"] {
  return Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      { open: "09:00", close: "17:00", closed: key === "fri" },
    ]),
  ) as WorkingHoursStepInput["workingHours"];
}

export default async function OnboardingHoursPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;
  const progress = getOnboardingProgress(business);
  if (!progress.businessValid) redirect("/onboarding/business");

  const storedHours = workingHoursStepSchema.shape.workingHours.safeParse(
    business?.workingHours,
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      <StepHeader
        title="ساعات العمل"
        description="حدد الأيام والساعات التي تظهر للعملاء عند اقتراح موعد."
      />
      <WorkingHoursForm
        defaultValues={{
          workingHours: storedHours.success ? storedHours.data : defaultHours(),
        }}
      />
    </div>
  );
}

import type { Business } from "@/types/domain";

import {
  bookingBasicsSchema,
  businessSetupSchema,
  workingHoursStepSchema,
} from "../schemas/onboarding-schema";

/**
 * Wizard step routes, in order. The wizard is the 4-step operational
 * foundation (operator PROMPT-07); services/knowledge management arrive in
 * later prompts and are intentionally NOT onboarding requirements.
 */
export const ONBOARDING_STEPS = [
  "/onboarding/business",
  "/onboarding/hours",
  "/onboarding/booking",
  "/onboarding/review",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingProgress = {
  businessValid: boolean;
  hoursValid: boolean;
  bookingValid: boolean;
  completed: boolean;
  /** First step whose data is still missing/invalid. */
  firstInvalidStep: OnboardingStep;
  /** Where `/onboarding` should send the user: first incomplete step, or the dashboard when completed. */
  resumeStep: OnboardingStep | "/";
};

export function getOnboardingProgress(
  business: Business | null,
): OnboardingProgress {
  const businessValid = Boolean(
    business && businessSetupSchema.safeParse(business).success,
  );
  const hoursValid = Boolean(
    business &&
    workingHoursStepSchema.safeParse({
      workingHours: business.workingHours,
    }).success,
  );
  const bookingValid = Boolean(
    business &&
    bookingBasicsSchema.safeParse({
      slotDurationMinutes: business.slotDurationMinutes,
      cancellationPolicy: business.cancellationPolicy,
    }).success,
  );
  const completed = Boolean(business?.onboardingCompletedAt);

  let firstInvalidStep: OnboardingStep = "/onboarding/review";
  if (!businessValid) firstInvalidStep = "/onboarding/business";
  else if (!hoursValid) firstInvalidStep = "/onboarding/hours";
  else if (!bookingValid) firstInvalidStep = "/onboarding/booking";

  return {
    businessValid,
    hoursValid,
    bookingValid,
    completed,
    firstInvalidStep,
    resumeStep: completed ? "/" : firstInvalidStep,
  };
}

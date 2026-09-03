import { getOnboardingProgress } from "@/features/onboarding/server/onboarding-progress";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { redirect } from "next/navigation";

/**
 * Onboarding entry point — smart resume (operator PROMPT-07): sends the
 * ADMIN to the first step whose data is still missing/invalid, or straight
 * to the dashboard when onboarding is already completed. Progress is
 * server-authoritative (Business record), never client state.
 */
export default async function OnboardingRedirectPage() {
  const session = await requireUser();
  const business = session.user.businessId
    ? await businessRepository.findById(session.user.businessId)
    : null;

  redirect(getOnboardingProgress(business).resumeStep);
}

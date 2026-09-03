import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { requireRole } from "@/server/auth/guards";

/**
 * Onboarding is the ADMIN-only Business setup flow (SPEC_A §2): it
 * runs after invitation-based ADMIN account activation. Authenticated
 * STAFF users are routed to the access-denied screen instead of the
 * wizard — onboarding state and Business data must not leak to them.
 * Unauthenticated access is already blocked by the two-tier model
 * (`src/proxy.ts` + these server-side guards).
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  return <OnboardingShell>{children}</OnboardingShell>;
}

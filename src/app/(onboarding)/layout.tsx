import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { requireUser } from "@/server/auth/guards";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <OnboardingShell>{children}</OnboardingShell>;
}

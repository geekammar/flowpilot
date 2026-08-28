import { UserMenu } from "@/features/auth/components/user-menu";
import { AppShell } from "@/components/shared/layout/app-shell";
import { InstallPrompt } from "@/components/shared/pwa/install-prompt";
import { APP_NAV_ITEMS } from "@/lib/app-config";
import { requireUser } from "@/server/auth/guards";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <AppShell navItems={APP_NAV_ITEMS} header={<UserMenu />}>
      {children}
      <InstallPrompt />
    </AppShell>
  );
}

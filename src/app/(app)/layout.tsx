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
  const session = await requireUser();
  // Role-scoped visibility for nav items that are ADMIN-only (e.g.
  // services management) — the server guards remain the authorization
  // boundary; this only keeps hidden screens out of STAFF navigation.
  const navItems = APP_NAV_ITEMS.filter(
    (item) =>
      !item.roles || item.roles.some((role) => role === session.user.role),
  );

  return (
    <AppShell navItems={navItems} header={<UserMenu />}>
      {children}
      <InstallPrompt />
    </AppShell>
  );
}

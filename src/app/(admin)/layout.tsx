import { UserMenu } from "@/features/auth/components/user-menu";
import { AppShell } from "@/components/shared/layout/app-shell";
import { ADMIN_NAV_ITEMS } from "@/lib/app-config";
import { requireRole } from "@/server/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  return (
    <AppShell navItems={ADMIN_NAV_ITEMS} header={<UserMenu />}>
      {children}
    </AppShell>
  );
}

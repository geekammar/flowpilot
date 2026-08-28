import { UserMenu } from "@/features/auth/components/user-menu";
import { AppShell } from "@/components/shared/layout/app-shell";
import { STAFF_NAV_ITEMS } from "@/lib/app-config";
import { requireRole } from "@/server/auth/guards";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("STAFF");

  return (
    <AppShell navItems={STAFF_NAV_ITEMS} header={<UserMenu />}>
      {children}
    </AppShell>
  );
}

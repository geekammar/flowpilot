import { StaffInviteDialog } from "@/features/invitations/components/staff-invite-dialog";
import { listInvitations } from "@/features/invitations/server/invitation-service";
import { TeamScreen } from "@/features/staff/components/team-screen";
import {
  defaultTeamServiceDeps,
  listTeam,
  type TeamActor,
} from "@/features/staff/server/team-service";
import type { TeamInvitationItem } from "@/features/staff/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/server/auth/guards";

import { CircleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "الفريق",
};

/**
 * Team management (PROMPT-16) — ADMIN-only (STAFF is redirected by the
 * `(admin)` guard). The route composes two features: the staff
 * feature's team directory (members + activation states) and the
 * invitations feature's open-invitation listing + invite dialog
 * (feature isolation preserved — composition happens here, at the
 * route layer). The Business is ALWAYS the actor's own, derived from
 * the authenticated session; the service layers enforce role + tenant
 * scoping server-side.
 */
export default async function TeamPage() {
  const session = await requireRole("ADMIN");
  if (!session.user.businessId) redirect("/onboarding");

  const actor: TeamActor = {
    userId: session.user.id,
    role: "ADMIN", // asserted by the guard above
    businessId: session.user.businessId,
  };

  const [memberResult, invitationResult] = await Promise.all([
    listTeam(defaultTeamServiceDeps, actor),
    listInvitations({ businessId: actor.businessId }),
  ]);

  if (!memberResult.success || !invitationResult.success) {
    // Honest failure state — never an empty list pretending success.
    return (
      <div className="animate-fade-in-up space-y-6">
        <PageHeader title="الفريق" description="فريق منشأتك وأدوارهم." />
        <EmptyState
          className="bg-card min-h-72"
          icon={CircleAlertIcon}
          title="تعذر تحميل الفريق"
          description="حدث خطأ أثناء تحميل بيانات الفريق. حاول مرة أخرى."
          action={
            <Link
              href="/admin/team"
              prefetch={false}
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              إعادة المحاولة
            </Link>
          }
        />
      </div>
    );
  }

  // Only operationally relevant invitation states are displayed:
  // PENDING (waiting for the invitee) and ACCEPTED (interrupted
  // activation). Activated invitees appear as team members; revoked
  // and expired invitations are inert.
  const invitations: TeamInvitationItem[] = invitationResult.data.items.flatMap(
    (invitation) =>
      invitation.status === "PENDING" || invitation.status === "ACCEPTED"
        ? [
            {
              id: invitation.id,
              email: invitation.email,
              role: invitation.role,
              status: invitation.status,
              createdAt: invitation.createdAt.toISOString(),
              expiresAt: invitation.expiresAt.toISOString(),
            },
          ]
        : [],
  );

  return (
    <TeamScreen
      members={memberResult.members}
      invitations={invitations}
      currentUserId={session.user.id}
      InviteDialog={StaffInviteDialog}
    />
  );
}

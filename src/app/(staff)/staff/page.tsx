import { transitionConversation } from "@/features/conversations/actions/conversation-actions";
import { StaffWorkspace } from "@/features/staff/components/staff-workspace";
import {
  defaultStaffWorkspaceDeps,
  getStaffWorkspace,
  type WorkspaceActor,
} from "@/features/staff/server/workspace-service";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/server/auth/guards";

import { CircleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "مهامي",
};

/**
 * The staff workspace (PROMPT-17) — the human-handoff queue. STAFF-only
 * (the `(staff)` layout guard redirects ADMIN to the access-denied
 * screen; ADMIN keeps its own dashboard). The route composes two
 * features: this feature's workspace view and the conversations
 * feature's EXISTING takeover action, injected as a prop (feature
 * isolation preserved — one assignment system, one conversation UI).
 * The Business is ALWAYS the actor's own, derived from the
 * authenticated session.
 */
export default async function StaffPage() {
  const session = await requireRole("STAFF");
  if (!session.user.businessId) redirect("/access-denied");

  const actor: WorkspaceActor = {
    userId: session.user.id,
    role: "STAFF", // asserted by the guard above
    businessId: session.user.businessId,
  };

  const result = await getStaffWorkspace(defaultStaffWorkspaceDeps, actor);

  if (!result.success) {
    // Honest failure state — never an empty queue pretending success.
    return (
      <div className="animate-fade-in-up space-y-6">
        <PageHeader title="مهامي" description="ما الذي يحتاج منك الآن؟" />
        <EmptyState
          className="bg-card min-h-72"
          icon={CircleAlertIcon}
          title="تعذر تحميل مساحة العمل"
          description="حدث خطأ أثناء تحميل مهامك. حاول مرة أخرى."
          action={
            <Link
              href="/staff"
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

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="مهامي" description="ما الذي يحتاج منك الآن؟" />
      <StaffWorkspace
        queue={result.queue}
        assigned={result.assigned}
        takeOver={transitionConversation}
      />
    </div>
  );
}

import { KnowledgeScreen } from "@/features/knowledge/components/knowledge-screen";
import {
  defaultKnowledgeServiceDeps,
  listKnowledge,
  type KnowledgeActor,
} from "@/features/knowledge/server/knowledge-service";
import type { KnowledgeEntryView } from "@/features/knowledge/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/server/auth/guards";

import { CircleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "معلومات للمساعد",
};

/**
 * Business Knowledge (Spec A §6) — ADMIN-only (STAFF is redirected to
 * access-denied). Plain-text question/answer entries the future AI
 * assistant will use when replying to customers, stored in the
 * canonical `Business.faqs` JSON field. The Business is ALWAYS the
 * actor's own, derived from the authenticated session; the service
 * layer enforces the role + tenant scoping server-side.
 */
export default async function KnowledgePage() {
  const session = await requireRole("ADMIN");
  if (!session.user.businessId) redirect("/onboarding");

  const actor: KnowledgeActor = {
    userId: session.user.id,
    role: "ADMIN", // asserted by the guard above
    businessId: session.user.businessId,
  };

  const result = await listKnowledge(defaultKnowledgeServiceDeps, actor);
  if (!Array.isArray(result)) {
    // Honest failure state — never an empty list pretending success.
    return (
      <div className="animate-fade-in-up space-y-6">
        <PageHeader
          title="معلومات للمساعد"
          description="هذه المعلومات هي التي سيستخدمها المساعد الذكي للرد على العملاء."
        />
        <EmptyState
          className="bg-card min-h-72"
          icon={CircleAlertIcon}
          title="تعذر تحميل المعلومات"
          description="حدث خطأ أثناء تحميل معلومات المنشأة. حاول مرة أخرى."
          action={
            <Link
              href="/settings/knowledge"
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

  const entries: KnowledgeEntryView[] = result;
  return <KnowledgeScreen initialEntries={entries} />;
}

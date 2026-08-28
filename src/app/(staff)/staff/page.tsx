import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

import {
  CalendarDaysIcon,
  MessagesSquareIcon,
  UserRoundCogIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "لوحة الفريق",
};

/**
 * Placeholder — the dedicated staff experience (own agenda, assigned
 * conversations, tasks) arrives with its own Spec A prompt. Meanwhile,
 * staff users can work the shared inbox and agenda directly.
 */
export default function StaffPage() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="لوحة الفريق"
        description="مواعيدك ومهامك لهذا اليوم."
      />
      <EmptyState
        className="bg-card min-h-64"
        icon={UserRoundCogIcon}
        title="لوحة الفريق قيد الإعداد"
        description="ستعرض هنا مواعيدك ومحادثاتك المعينة ومهامك اليومية. حتى ذلك الحين، يمكنك العمل مباشرة من المحادثات وجدول المواعيد."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="sm">
              <Link href="/conversations">
                <MessagesSquareIcon aria-hidden className="size-4" />
                فتح المحادثات
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/appointments">
                <CalendarDaysIcon aria-hidden className="size-4" />
                جدول المواعيد
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}

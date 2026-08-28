import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

import { MessagesSquareIcon, UsersRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "العملاء",
};

/**
 * Placeholder — the full customer directory (search, notes, last/next
 * appointment) is a Spec A screen that arrives in an upcoming prompt.
 */
export default function CustomersPage() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="العملاء" description="دفتر عملائك وسجل حجوزاتهم." />
      <EmptyState
        className="bg-card min-h-72"
        icon={UsersRoundIcon}
        title="دليل العملاء قيد الإعداد"
        description="تُجمع بيانات العملاء تلقائياً من محادثات واتساب وحجوزاتهم، وسيعرض الدليل الكامل هنا قريباً — الأسماء، الأرقام، الموعد الأخير والقادم، والملاحظات."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/conversations">
              <MessagesSquareIcon aria-hidden className="size-4" />
              تابع عملاءك من المحادثات
            </Link>
          </Button>
        }
      />
    </div>
  );
}

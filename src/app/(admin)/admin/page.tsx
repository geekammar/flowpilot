import { PageHeader } from "@/components/shared/page-header";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
};

export default function AdminPage() {
  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="لوحة الإدارة"
        description="إدارة الفريق والإعدادات العامة."
      />
      <p className="text-muted-foreground text-sm">
        منطقة الإدارة تُبنى في مرحلة لاحقة.
      </p>
    </div>
  );
}

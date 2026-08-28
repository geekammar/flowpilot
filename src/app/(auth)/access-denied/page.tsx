import { Button } from "@/components/ui/button";

import { ShieldXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "لا تملك صلاحية الوصول",
};

/** Shown when an authenticated user lacks the required role (ADMIN/STAFF). */
export default function AccessDeniedPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <ShieldXIcon aria-hidden className="text-destructive size-5" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">
          لا تملك صلاحية الوصول
        </h1>
        <p className="text-muted-foreground text-sm">
          حسابك لا يملك الصلاحية المطلوبة لفتح هذه الصفحة. تواصل مع مدير المنشأة
          إذا كنت تعتقد أن هذا خطأ.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/">العودة إلى الرئيسية</Link>
      </Button>
    </div>
  );
}

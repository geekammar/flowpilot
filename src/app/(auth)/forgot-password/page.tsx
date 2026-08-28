import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
};

/** Placeholder — password reset is out of Spec A scope. */
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">
          استعادة كلمة المرور
        </h1>
        <p className="text-muted-foreground text-sm">
          هذه الميزة غير متاحة بعد. تواصل مع مدير المنشأة لإعادة تعيين كلمة
          المرور مؤقتاً.
        </p>
      </div>
      <Link
        href="/sign-in"
        className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        <ArrowRightIcon aria-hidden className="size-4" />
        العودة إلى تسجيل الدخول
      </Link>
    </div>
  );
}

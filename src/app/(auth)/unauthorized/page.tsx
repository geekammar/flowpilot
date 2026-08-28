import { Button } from "@/components/ui/button";

import { LockKeyholeIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "مطلوب تسجيل الدخول",
};

/** Shown when an unauthenticated visitor reaches a protected area. */
export default function UnauthorizedPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-full">
        <LockKeyholeIcon aria-hidden className="text-muted-foreground size-5" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">
          يجب تسجيل الدخول أولاً
        </h1>
        <p className="text-muted-foreground text-sm">
          الصفحة التي تحاول الوصول إليها محمية. سجّل الدخول للمتابعة.
        </p>
      </div>
      <Button asChild className="w-full">
        <Link href="/sign-in">تسجيل الدخول</Link>
      </Button>
    </div>
  );
}

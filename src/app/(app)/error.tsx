"use client";

import { Button } from "@/components/ui/button";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary for the authenticated app area. Renders inside the
 * AppShell so navigation stays available while recovering.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center"
    >
      <div className="bg-error/10 flex size-12 items-center justify-center rounded-full">
        <TriangleAlertIcon aria-hidden className="text-error size-5" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold">تعذر تحميل هذا القسم</h1>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          حدث خطأ غير متوقع أثناء عرض البيانات. جرّب إعادة المحاولة، وإن استمرت
          المشكلة يمكنك العودة إلى الرئيسية والمتابعة من هناك.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={retry}>
          <RotateCcwIcon aria-hidden className="size-4" />
          إعادة المحاولة
        </Button>
        <Button asChild variant="outline">
          <Link href="/">العودة إلى الرئيسية</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-muted-foreground text-xs" dir="ltr">
          #{error.digest}
        </p>
      ) : null}
    </div>
  );
}

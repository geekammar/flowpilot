"use client";

import { RotateCcwIcon } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 bg-white px-4 text-center text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <h2 className="text-lg font-semibold">خطأ في التطبيق</h2>
        <p className="max-w-md text-sm opacity-70">
          حدث خطأ حرج. يرجى المحاولة مرة أخرى.
        </p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium dark:border-neutral-800"
        >
          <RotateCcwIcon className="size-4" />
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}

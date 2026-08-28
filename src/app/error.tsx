"use client";

import { Button } from "@/components/ui/button";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

export default function Error({
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
      className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-4 text-center"
    >
      <div className="bg-error/10 flex size-12 items-center justify-center rounded-full">
        <TriangleAlertIcon aria-hidden className="text-error size-5" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">حدث خطأ غير متوقع</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          نعتذر عن الإزعاج. حاول مرة أخرى بعد لحظات.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={retry}>
        <RotateCcwIcon aria-hidden className="size-4" />
        إعادة المحاولة
      </Button>
      {error.digest ? (
        <p className="text-muted-foreground text-xs" dir="ltr">
          #{error.digest}
        </p>
      ) : null}
    </div>
  );
}

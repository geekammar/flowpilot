"use client";

import { completeOnboarding } from "@/features/onboarding/actions/onboarding-actions";
import { Button } from "@/components/ui/button";

import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CompletionCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setError(null);
    const result = await completeOnboarding();
    if (!result.success) {
      setError(result.message);
      return;
    }
    startTransition(() => router.replace("/"));
  }

  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="w-full max-w-lg space-y-6 text-center">
        <CheckCircle2Icon className="mx-auto size-14 text-success" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">منشأتك جاهزة للانطلاق</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            حفظنا بياناتك وخدماتك ومواعيدك. يمكنك الآن متابعة كل شيء من لوحة
            التحكم.
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button size="lg" onClick={() => void finish()} disabled={isPending}>
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          الذهاب إلى لوحة التحكم
        </Button>
      </div>
    </div>
  );
}

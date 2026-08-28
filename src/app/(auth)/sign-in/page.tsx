import { LoginForm } from "@/features/auth/components/login-form";
import { Skeleton } from "@/components/ui/skeleton";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">تسجيل الدخول</h1>
        <p className="text-muted-foreground text-sm">
          أهلاً بعودتك. أدخل بياناتك للمتابعة.
        </p>
      </div>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

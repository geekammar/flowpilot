"use client";

import { cn } from "@/lib/utils";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/onboarding", label: "مرحباً" },
  { href: "/onboarding/business", label: "المنشأة" },
  { href: "/onboarding/services", label: "الخدمات" },
  { href: "/onboarding/availability", label: "المواعيد" },
  { href: "/onboarding/knowledge", label: "المعلومات" },
  { href: "/onboarding/complete", label: "اكتمل" },
] as const;

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.href === pathname),
  );
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6">
          <Link href="/onboarding" className="text-sm font-semibold">
            FlowPilot
          </Link>
          <span className="ms-auto text-xs text-muted-foreground">
            الخطوة {currentIndex + 1} من {STEPS.length}
          </span>
        </div>
        <div
          className="h-1 bg-muted"
          role="progressbar"
          aria-label="تقدم إعداد الحساب"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={currentIndex + 1}
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <nav aria-label="خطوات الإعداد" className="border-b bg-card">
        <ol className="mx-auto grid max-w-4xl grid-cols-6 px-2 sm:px-6">
          {STEPS.map((step, index) => {
            const complete = index < currentIndex;
            const current = index === currentIndex;
            return (
              <li key={step.href} className="min-w-0">
                <div
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex h-12 items-center justify-center gap-1.5 border-b-2 border-transparent px-1 text-xs text-muted-foreground",
                    current && "border-primary font-medium text-foreground",
                    complete && "text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums",
                      current &&
                        "border-primary bg-primary text-primary-foreground",
                      complete &&
                        "border-success bg-success text-success-foreground",
                    )}
                  >
                    {complete ? <CheckIcon className="size-3" /> : index + 1}
                  </span>
                  <span className="hidden truncate sm:inline">
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12"
      >
        {children}
      </main>
    </div>
  );
}

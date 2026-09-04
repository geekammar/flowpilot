"use client";

import {
  BOOKING_FLOW_ACTIVE_STEPS,
  BOOKING_FLOW_STEPS,
} from "@/features/appointments/types";
import { cn } from "@/lib/utils";

import { CheckIcon, LockIcon } from "lucide-react";

/**
 * Progress indicator for the Smart Create Appointment flow. Shows the
 * intended 6-step flow (العميل → الخدمة → التاريخ → الوقت → المراجعة
 * → التأكيد) with steps 1–5 active in this release; step 6 stays
 * locked. Completed steps are clickable for safe back-navigation
 * (the onboarding-wizard convention) — selections are preserved.
 */
export function BookingFlowProgress({
  currentStep,
  completedSteps,
  onSelectStep,
}: {
  /** 1-based index of the active step (only 1–5 are ever active). */
  currentStep: 1 | 2 | 3 | 4 | 5;
  /** Which of the first four steps already hold a valid selection. */
  completedSteps: {
    customer: boolean;
    service: boolean;
    date: boolean;
    slot: boolean;
  };
  /** Navigate back to a completed step (never forward past an
   * incomplete one). */
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
}) {
  const stepCompleted = (index: number) =>
    index === 0
      ? completedSteps.customer
      : index === 1
        ? completedSteps.service
        : index === 2
          ? completedSteps.date
          : index === 3
            ? completedSteps.slot
            : false;

  return (
    <nav aria-label="خطوات إنشاء الموعد">
      <ol className="grid grid-cols-6">
        {BOOKING_FLOW_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const locked = stepNumber > BOOKING_FLOW_ACTIVE_STEPS;
          const current = stepNumber === currentStep;
          const complete =
            stepNumber <= BOOKING_FLOW_ACTIVE_STEPS && stepCompleted(index);
          const clickable = complete && !current;

          const circle = (
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums",
                current && "border-primary bg-primary text-primary-foreground",
                complete &&
                  !current &&
                  "border-success bg-success text-success-foreground",
                locked && "border-muted-foreground/30 text-muted-foreground/60",
              )}
            >
              {locked ? (
                <LockIcon aria-hidden className="size-2.5" />
              ) : complete && !current ? (
                <CheckIcon aria-hidden className="size-3" />
              ) : (
                stepNumber
              )}
            </span>
          );

          return (
            <li key={step.label} className="min-w-0">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSelectStep(stepNumber as 1 | 2 | 3 | 4)}
                  aria-label={`العودة إلى خطوة: ${step.label}`}
                  className="flex h-12 w-full flex-col items-center justify-center gap-1 border-b-2 border-transparent text-muted-foreground transition-colors hover:text-primary"
                >
                  {circle}
                  <span className="max-w-full truncate text-[10px] leading-tight sm:text-xs">
                    {step.label}
                  </span>
                </button>
              ) : (
                <div
                  aria-current={current ? "step" : undefined}
                  aria-disabled={locked || undefined}
                  className={cn(
                    "flex h-12 w-full flex-col items-center justify-center gap-1 border-b-2 border-transparent",
                    current && "border-primary",
                    locked && "opacity-55",
                  )}
                >
                  {circle}
                  <span
                    className={cn(
                      "max-w-full truncate text-[10px] leading-tight sm:text-xs",
                      current
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

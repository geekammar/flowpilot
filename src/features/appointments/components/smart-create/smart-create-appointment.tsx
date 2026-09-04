"use client";

import { getAvailabilityAction } from "@/features/appointments/actions/availability-actions";
import { BookingFlowProgress } from "@/features/appointments/components/smart-create/booking-flow-progress";
import { CustomerStep } from "@/features/appointments/components/smart-create/customer-step";
import { DateStep } from "@/features/appointments/components/smart-create/date-step";
import {
  ReviewStep,
  getMissingReviewFields,
} from "@/features/appointments/components/smart-create/review-step";
import { ServiceStep } from "@/features/appointments/components/smart-create/service-step";
import { slotExistsIn } from "@/features/appointments/components/smart-create/slot-helpers";
import { SlotStep } from "@/features/appointments/components/smart-create/slot-step";
import type {
  BookingCustomerOption,
  BookingFlowScreen,
  BookingServiceOption,
  ReviewCheckState,
  SelectedSlot,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { appointmentDateSchema } from "@/lib/validation";

import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STEP_HEADINGS: Record<
  BookingFlowScreen,
  { title: string; description: string }
> = {
  customer: {
    title: "من هو العميل؟",
    description: "ابحث بالاسم أو رقم الهاتف واختر العميل.",
  },
  service: {
    title: "أي خدمة يحتاجها؟",
    description: "تظهر الخدمات النشطة فقط، وتُحسب مدة الموعد من الخدمة.",
  },
  date: {
    title: "متى الموعد؟",
    description: "اختر يوماً قريباً أو حدّد تاريخاً آخر.",
  },
  slot: {
    title: "أي وقت يناسب الموعد؟",
    description: "اختر وقتاً من الأوقات المتاحة فعلياً في اليوم المحدد.",
  },
  review: {
    title: "راجع تفاصيل الموعد",
    description: "تأكد من كل التفاصيل قبل خطوة التأكيد النهائي.",
  },
};

const STALE_SLOT_MESSAGE =
  "لم يعد الوقت الذي اخترته متاحاً — ربما حُجز في هذه الأثناء. اختر وقتاً آخر للموعد.";

/**
 * Smart Create Appointment flow (PROMPT-11 Steps 1–3 + PROMPT-12 Step 4 +
 * PROMPT-13 Step 5).
 *
 * العميل → الخدمة → التاريخ → الوقت → المراجعة, with a 6-step progress
 * indicator where steps 1–5 are active (التأكيد stays locked until a later
 * prompt). Selections live in this container only — moving back and
 * forth never resets them. Step 4 consumes the existing availability
 * layer through `getAvailabilityAction` and is SELECTION ONLY. Step 5
 * reviews the preserved selections; its primary action REVALIDATES the
 * chosen slot through the SAME availability action (no second engine,
 * no reservation, no appointment creation) and only a complete review
 * with a still-valid slot may ever leave the step — step 6 remains
 * locked, so "verified" communicates that honestly instead of
 * navigating. Changing the service or the date clears the slot
 * selection — a stale slot can never survive an input change it was
 * not computed for.
 */
export function SmartCreateAppointment({
  initialCustomers,
  services,
  defaultDate,
  today,
  canManageServices,
}: {
  initialCustomers: BookingCustomerOption[];
  services: BookingServiceOption[];
  defaultDate: string;
  /** Business-local "YYYY-MM-DD" today (server-derived). */
  today: string;
  canManageServices: boolean;
}) {
  const [screen, setScreen] = useState<BookingFlowScreen>("customer");
  const [customer, setCustomer] = useState<BookingCustomerOption | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reviewCheck, setReviewCheck] = useState<ReviewCheckState>({
    status: "idle",
  });

  const service = services.find((item) => item.id === serviceId) ?? null;
  const dateIsValid = appointmentDateSchema.safeParse(date).success;

  /** Any change to the revalidated inputs resets the review check. */
  function resetReviewCheck() {
    setReviewCheck({ status: "idle" });
  }

  /** Changing the service invalidates any slot chosen for another one. */
  function handleSelectService(nextServiceId: string) {
    if (nextServiceId !== serviceId) {
      setSelectedSlot(null);
      resetReviewCheck();
    }
    setServiceId(nextServiceId);
  }

  /** Changing the date invalidates any slot chosen for another day. */
  function handleSelectDate(nextDate: string) {
    if (nextDate !== date) {
      setSelectedSlot(null);
      resetReviewCheck();
    }
    setDate(nextDate);
  }

  /** Selecting a fresh slot gives the review a new state to verify. */
  function handleSelectSlot(slot: SelectedSlot) {
    setSelectedSlot(slot);
    resetReviewCheck();
  }

  /**
   * Step 4's fresh availability result no longer contains the preserved
   * slot (booked by someone else meanwhile) — clear it through the
   * same wizard-state mechanism so no stale slot can reach the review.
   */
  function handleSlotUnavailable() {
    setSelectedSlot(null);
    resetReviewCheck();
  }

  const missingReviewFields = getMissingReviewFields({
    customer,
    service,
    date,
    selectedSlot,
  });
  const reviewIsValid = missingReviewFields.length === 0;

  const currentStep =
    screen === "customer"
      ? 1
      : screen === "service"
        ? 2
        : screen === "date"
          ? 3
          : screen === "slot"
            ? 4
            : 5;

  const canContinue =
    screen === "customer"
      ? customer !== null
      : screen === "service"
        ? serviceId !== null
        : screen === "date"
          ? dateIsValid
          : screen === "slot"
            ? selectedSlot !== null
            : reviewIsValid;

  function goNext() {
    if (screen === "customer") setScreen("service");
    else if (screen === "service") setScreen("date");
    else if (screen === "date") setScreen("slot");
    else if (screen === "slot") setScreen("review");
  }

  function goBack() {
    if (screen === "service") setScreen("customer");
    else if (screen === "date") setScreen("service");
    else if (screen === "slot") setScreen("date");
    else if (screen === "review") setScreen("slot");
  }

  /**
   * Step 5's primary action: revalidate the selected slot against the
   * CURRENT availability through the existing `getAvailabilityAction`
   * (the same PROMPT-10 layer Step 4 uses — one engine, no duplicate
   * mount-time query; exactly one request per click). NEVER creates an
   * appointment. A stale slot clears through the wizard-state
   * mechanism and the user stays on the review with an obvious way
   * back to Step 4. Step 6 is locked, so a verified review state is
   * communicated honestly instead of navigating.
   */
  async function handleReviewContinue() {
    if (!reviewIsValid || !service || !selectedSlot) return;
    setReviewCheck({ status: "checking" });
    let result;
    try {
      result = await getAvailabilityAction({ date, serviceId: service.id });
    } catch {
      setReviewCheck({ status: "failed" });
      return;
    }
    const stillBookable =
      result.success && slotExistsIn(selectedSlot, result.data.slots);
    if (!stillBookable) {
      setSelectedSlot(null);
      setReviewCheck({
        status: "stale",
        message: result.success ? STALE_SLOT_MESSAGE : result.error.message,
      });
      return;
    }
    setReviewCheck({ status: "verified" });
  }

  const heading = STEP_HEADINGS[screen];

  return (
    <div className="space-y-6">
      <BookingFlowProgress
        currentStep={currentStep}
        completedSteps={{
          customer: customer !== null,
          service: serviceId !== null,
          date: dateIsValid,
          slot: selectedSlot !== null,
        }}
        onSelectStep={(step) =>
          setScreen(
            step === 1
              ? "customer"
              : step === 2
                ? "service"
                : step === 3
                  ? "date"
                  : "slot",
          )
        }
      />

      <span role="status" aria-live="polite" className="sr-only">
        الخطوة الحالية: {heading.title}
      </span>

      {customer && screen !== "customer" && screen !== "review" ? (
        <dl className="space-y-1.5 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">العميل</dt>
            <dd className="truncate font-medium">{customer.name}</dd>
          </div>
          {service && (screen === "date" || screen === "slot") ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-muted-foreground">الخدمة</dt>
              <dd className="truncate font-medium">
                {service.name} · {service.durationMinutes} دقيقة
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <section aria-labelledby="booking-step-title" className="space-y-4">
        <header className="space-y-1">
          <h2 id="booking-step-title" className="text-base font-semibold">
            {heading.title}
          </h2>
          <p className="text-sm text-muted-foreground">{heading.description}</p>
        </header>

        {screen === "customer" ? (
          <CustomerStep
            initialCustomers={initialCustomers}
            selected={customer}
            onSelect={setCustomer}
          />
        ) : screen === "service" ? (
          <ServiceStep
            services={services}
            selectedId={serviceId}
            onSelect={handleSelectService}
            canManageServices={canManageServices}
          />
        ) : screen === "date" ? (
          <DateStep
            selectedDate={date}
            today={today}
            onSelect={handleSelectDate}
          />
        ) : screen === "slot" && service ? (
          <SlotStep
            serviceId={service.id}
            date={date}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            onSlotUnavailable={handleSlotUnavailable}
            onGoToDate={() => setScreen("date")}
            onGoToService={() => setScreen("service")}
          />
        ) : screen === "review" ? (
          <ReviewStep
            customer={customer}
            service={service}
            date={date}
            selectedSlot={selectedSlot}
            checkState={reviewCheck}
            onGoToCustomer={() => setScreen("customer")}
            onGoToService={() => setScreen("service")}
            onGoToDate={() => setScreen("date")}
            onGoToSlot={() => setScreen("slot")}
          />
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        {screen === "customer" ? (
          <Button asChild type="button" variant="outline">
            <Link href={`/appointments?date=${date}`}>
              <ArrowRightIcon />
              إلغاء
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={goBack}>
            <ArrowRightIcon />
            رجوع
          </Button>
        )}
        {screen === "review" ? (
          /* Step 6 stays locked: the review's primary action only
              revalidates the slot and reports the outcome — it never
              creates an appointment and never navigates past the
              locked boundary. */
          <Button
            type="button"
            disabled={!reviewIsValid || reviewCheck.status === "checking"}
            onClick={() => void handleReviewContinue()}
          >
            {reviewCheck.status === "checking" ? (
              <LoaderCircleIcon aria-hidden className="animate-spin" />
            ) : null}
            متابعة إلى التأكيد
          </Button>
        ) : (
          <Button type="button" disabled={!canContinue} onClick={goNext}>
            التالي
          </Button>
        )}
      </div>
    </div>
  );
}

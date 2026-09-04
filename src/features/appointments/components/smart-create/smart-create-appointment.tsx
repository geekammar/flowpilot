"use client";

import { createAppointment } from "@/features/appointments/actions/appointment-actions";
import { getAvailabilityAction } from "@/features/appointments/actions/availability-actions";
import { BookingFlowProgress } from "@/features/appointments/components/smart-create/booking-flow-progress";
import { ConfirmStep } from "@/features/appointments/components/smart-create/confirm-step";
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
  ConfirmSubmitState,
  CreateAppointmentActionResult,
  ReviewCheckState,
  SelectedSlot,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { appointmentDateSchema } from "@/lib/validation";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

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
  confirm: {
    title: "تأكيد الحجز",
    description: "أكّد التفاصيل المعروضة ليُنشأ الموعد.",
  },
};

const STALE_SLOT_MESSAGE =
  "لم يعد الوقت الذي اخترته متاحاً — ربما حُجز في هذه الأثناء. اختر وقتاً آخر للموعد.";

/**
 * Smart Create Appointment flow (PROMPT-11 Steps 1–3 + PROMPT-12 Step 4 +
 * PROMPT-13 Step 5 + PROMPT-14 Step 6).
 *
 * العميل → الخدمة → التاريخ → الوقت → المراجعة → التأكيد, with all
 * six steps active. Selections live in this container only — moving
 * back and forth never resets them. Step 4 consumes the existing
 * availability layer through `getAvailabilityAction` and is SELECTION
 * ONLY. Step 5 reviews the preserved selections; its primary action
 * REVALIDATES the chosen slot through the SAME availability action
 * (no second engine, no reservation) — a verified review hands off to
 * Step 6. Step 6 (التأكيد) shows the final read-only summary and
 * creates the appointment through the EXISTING `createAppointment`
 * action (the canonical, conflict-checked write path); success is
 * recorded only from the server's own result, and the wizard is
 * cleared only after success is known. Changing the service or the
 * date clears the slot selection — a stale slot can never survive an
 * input change it was not computed for.
 */
export function SmartCreateAppointment({
  initialCustomers,
  services,
  defaultDate,
  today,
  canManageServices,
  businessTimezone,
  confirmationMode,
}: {
  initialCustomers: BookingCustomerOption[];
  services: BookingServiceOption[];
  defaultDate: string;
  /** Business-local "YYYY-MM-DD" today (server-derived). */
  today: string;
  canManageServices: boolean;
  /** Business timezone (server-derived) — display only. */
  businessTimezone: string;
  /** Business booking setting (server-derived) — drives the
   * post-confirmation behavior copy. */
  confirmationMode: "automatic" | "manual";
}) {
  const [screen, setScreen] = useState<BookingFlowScreen>("customer");
  const [customer, setCustomer] = useState<BookingCustomerOption | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reviewCheck, setReviewCheck] = useState<ReviewCheckState>({
    status: "idle",
  });
  const [submitState, setSubmitState] = useState<ConfirmSubmitState>({
    status: "idle",
  });
  const queryClient = useQueryClient();
  /** Re-entrancy guard: a second click during an in-flight create
   * must never issue a second write. */
  const submitInFlight = useRef(false);

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
            : screen === "review"
              ? 5
              : 6;

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

  function goBack() {
    if (screen === "service") setScreen("customer");
    else if (screen === "date") setScreen("service");
    else if (screen === "slot") setScreen("date");
    else if (screen === "review") setScreen("slot");
    else if (screen === "confirm") setScreen("review");
  }

  function goNext() {
    if (screen === "customer") setScreen("service");
    else if (screen === "service") setScreen("date");
    else if (screen === "date") setScreen("slot");
    else if (screen === "slot") setScreen("review");
  }

  /**
   * Step 5's primary action: revalidate the selected slot against the
   * CURRENT availability through the existing `getAvailabilityAction`
   * (the same PROMPT-10 layer Step 4 uses — one engine, no duplicate
   * mount-time query; exactly one request per click). NEVER creates
   * an appointment. A stale slot clears through the wizard-state
   * mechanism and the user stays on the review with an obvious way
   * back to Step 4. A verified slot is a HAND-OFF (not a
   * reservation): the flow moves to Step 6, whose write still relies
   * on `createAppointment`'s transactional conflict check.
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
    setSubmitState({ status: "idle" });
    setScreen("confirm");
  }

  /**
   * Step 6's primary action: create the appointment through the
   * EXISTING `createAppointment` action — the wizard never builds an
   * appointment record itself. The submitted payload carries ONLY the
   * wizard's server-validated selections (the slot's server-computed
   * start time; the end time and every protection live server-side).
   * Duplicate submission is blocked in-flight (ref + disabled button)
   * and by the write path's own conflict check. Success is recorded
   * ONLY from the server's result — including the actual
   * server-derived appointment status.
   */
  async function handleConfirmSubmit() {
    if (submitInFlight.current || submitState.status === "success") return;
    if (!customer || !service || !selectedSlot || !dateIsValid) return;
    submitInFlight.current = true;
    setSubmitState({ status: "submitting" });
    let result: CreateAppointmentActionResult;
    try {
      result = await createAppointment({
        customerId: customer.id,
        serviceId: service.id,
        date,
        startTime: selectedSlot.startTime,
        // The wizard collects no notes (PROMPT-14 scope decision) —
        // the schema requires the key, so an empty note is submitted.
        notes: "",
      });
    } catch {
      submitInFlight.current = false;
      setSubmitState({
        status: "error",
        code: "CREATE_FAILED",
        message: "تعذر إنشاء الموعد الآن. حاول مرة أخرى.",
      });
      return;
    }
    submitInFlight.current = false;
    if (result.success) {
      setSubmitState({
        status: "success",
        appointmentId: result.appointmentId,
        appointmentStatus: result.status,
      });
    } else {
      setSubmitState({
        status: "error",
        code: result.code,
        message: result.message,
      });
    }
  }

  /**
   * SLOT_CONFLICT recovery: the selected time was booked by someone
   * else between the review check and the write. Clear the stale slot
   * through the wizard's established mechanism, return to Step 4, and
   * drop the cached availability for these inputs so the slot step
   * refetches through the EXISTING `getAvailabilityAction` (the same
   * engine — no second availability implementation).
   */
  function handleChooseAnotherSlot() {
    setSelectedSlot(null);
    resetReviewCheck();
    setSubmitState({ status: "idle" });
    if (serviceId) {
      queryClient.removeQueries({
        queryKey: ["booking-availability", serviceId, date],
      });
    }
    setScreen("slot");
  }

  /**
   * Start a fresh booking after a server-confirmed success — the
   * wizard is cleared only now that success is known.
   */
  function handleCreateAnother() {
    setCustomer(null);
    setServiceId(null);
    setDate(defaultDate);
    setSelectedSlot(null);
    resetReviewCheck();
    setSubmitState({ status: "idle" });
    setScreen("customer");
  }

  const heading = STEP_HEADINGS[screen];
  const conflictError =
    submitState.status === "error" && submitState.code === "SLOT_CONFLICT";

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

      {customer &&
      screen !== "customer" &&
      screen !== "review" &&
      screen !== "confirm" ? (
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
        ) : screen === "confirm" ? (
          <ConfirmStep
            customer={customer}
            service={service}
            date={date}
            selectedSlot={selectedSlot}
            timezone={businessTimezone}
            confirmationMode={confirmationMode}
            submitState={submitState}
            onChooseAnotherSlot={handleChooseAnotherSlot}
          />
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        {screen === "confirm" ? (
          submitState.status === "success" ? (
            /* Success is server-confirmed: the wizard finishes here.
             * One obvious primary action — open the created
             * appointment's existing detail page. */
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateAnother}
              >
                إنشاء موعد آخر
              </Button>
              <Button asChild type="button">
                <Link href={`/appointments/${submitState.appointmentId}`}>
                  عرض الموعد
                  <ArrowLeftIcon aria-hidden />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={submitState.status === "submitting"}
              >
                <ArrowRightIcon />
                رجوع
              </Button>
              {/* A conflicted slot must not be re-submitted — recovery
               * is اختيار وقت آخر inside the step's alert panel, so
               * the write button is hidden until the slot changes. */}
              {conflictError ? null : (
                <Button
                  type="button"
                  disabled={
                    submitState.status === "submitting" || !reviewIsValid
                  }
                  onClick={() => void handleConfirmSubmit()}
                >
                  {submitState.status === "submitting" ? (
                    <LoaderCircleIcon aria-hidden className="animate-spin" />
                  ) : null}
                  تأكيد الحجز
                </Button>
              )}
            </>
          )
        ) : (
          <>
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
              /* Step 5's primary action: revalidate the slot and hand
               * off to Step 6 — it never creates an appointment
               * itself. */
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
          </>
        )}
      </div>
    </div>
  );
}

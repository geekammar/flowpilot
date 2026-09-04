"use client";

import { BookingFlowProgress } from "@/features/appointments/components/smart-create/booking-flow-progress";
import { CustomerStep } from "@/features/appointments/components/smart-create/customer-step";
import { DateStep } from "@/features/appointments/components/smart-create/date-step";
import { ServiceStep } from "@/features/appointments/components/smart-create/service-step";
import { SlotStep } from "@/features/appointments/components/smart-create/slot-step";
import type {
  BookingCustomerOption,
  BookingFlowScreen,
  BookingServiceOption,
  SelectedSlot,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { appointmentDateSchema } from "@/lib/validation";

import { ArrowRightIcon } from "lucide-react";
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
};

/**
 * Smart Create Appointment flow (PROMPT-11 Steps 1–3 + PROMPT-12 Step 4).
 *
 * العميل → الخدمة → التاريخ → الوقت, with a 6-step progress indicator
 * where steps 1–4 are active (المراجعة/التأكيد stay locked until later
 * prompts). Selections live in this container only — moving back and
 * forth never resets them. Step 4 consumes the existing availability
 * layer through `getAvailabilityAction` and is SELECTION ONLY: the
 * chosen slot is preserved here for the future review step, and no
 * appointment is created from it. Changing the service or the date
 * clears the slot selection — a stale slot can never survive an
 * input change it was not computed for.
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

  const service = services.find((item) => item.id === serviceId) ?? null;
  const dateIsValid = appointmentDateSchema.safeParse(date).success;

  /** Changing the service invalidates any slot chosen for another one. */
  function handleSelectService(nextServiceId: string) {
    if (nextServiceId !== serviceId) setSelectedSlot(null);
    setServiceId(nextServiceId);
  }

  /** Changing the date invalidates any slot chosen for another day. */
  function handleSelectDate(nextDate: string) {
    if (nextDate !== date) setSelectedSlot(null);
    setDate(nextDate);
  }

  const currentStep =
    screen === "customer"
      ? 1
      : screen === "service"
        ? 2
        : screen === "date"
          ? 3
          : 4;

  const canContinue =
    screen === "customer"
      ? customer !== null
      : screen === "service"
        ? serviceId !== null
        : screen === "date"
          ? dateIsValid
          : false;

  function goNext() {
    if (screen === "customer") setScreen("service");
    else if (screen === "service") setScreen("date");
    else if (screen === "date") setScreen("slot");
  }

  function goBack() {
    if (screen === "service") setScreen("customer");
    else if (screen === "date") setScreen("service");
    else if (screen === "slot") setScreen("date");
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

      {customer && screen !== "customer" ? (
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
        ) : service ? (
          <SlotStep
            serviceId={service.id}
            date={date}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            onGoToDate={() => setScreen("date")}
            onGoToService={() => setScreen("service")}
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
        {/* Steps 5–6 stay locked: Step 4 is selection only (the slot is
            preserved for the future review step), so it has no continue
            action yet. */}
        {screen !== "slot" ? (
          <Button type="button" disabled={!canContinue} onClick={goNext}>
            التالي
          </Button>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { BookingDetailsStep } from "@/features/appointments/components/smart-create/booking-details-step";
import { BookingFlowProgress } from "@/features/appointments/components/smart-create/booking-flow-progress";
import { CustomerStep } from "@/features/appointments/components/smart-create/customer-step";
import { DateStep } from "@/features/appointments/components/smart-create/date-step";
import { ServiceStep } from "@/features/appointments/components/smart-create/service-step";
import type {
  BookingCustomerOption,
  BookingFlowScreen,
  BookingServiceOption,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { appointmentDateSchema } from "@/lib/validation";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SelectionStep = Exclude<BookingFlowScreen, "details">;

const STEP_HEADINGS: Record<
  SelectionStep,
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
};

/**
 * Smart Create Appointment flow (PROMPT-11 — Steps 1–3 foundation).
 *
 * العميل → الخدمة → التاريخ, with a 6-step progress indicator where
 * only steps 1–3 are active (الوقت/المراجعة/التأكيد arrive in later
 * prompts). Selections live in this container only — moving back and
 * forth never resets them, and each step's continue action stays
 * disabled until its selection is valid. The interim details screen
 * (time + note + create) completes today's booking path through the
 * existing `createAppointment` action until available-slot selection
 * lands.
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

  const service = services.find((item) => item.id === serviceId) ?? null;
  const dateIsValid = appointmentDateSchema.safeParse(date).success;
  const detailsReady =
    screen === "details" && customer !== null && service !== null;

  if (detailsReady && customer && service) {
    return (
      <div className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-base font-semibold">أكمل الحجز</h2>
          <p className="text-sm text-muted-foreground">
            حدّد وقت البداية وأضف ملاحظة إن لزم، ثم أنشئ الموعد.
          </p>
        </header>
        <BookingDetailsStep
          customer={customer}
          service={service}
          date={date}
          onBack={() => setScreen("date")}
        />
      </div>
    );
  }

  // Defensive: the details screen is unreachable without selections
  // (continue is gated); fall back to the date step.
  const activeScreen: SelectionStep = detailsReady
    ? "date"
    : screen === "details"
      ? "date"
      : screen;
  const currentStep =
    activeScreen === "customer" ? 1 : activeScreen === "service" ? 2 : 3;

  const canContinue =
    activeScreen === "customer"
      ? customer !== null
      : activeScreen === "service"
        ? serviceId !== null
        : dateIsValid;

  function goNext() {
    if (activeScreen === "customer") setScreen("service");
    else if (activeScreen === "service") setScreen("date");
    else setScreen("details");
  }

  function goBack() {
    if (activeScreen === "service") setScreen("customer");
    else if (activeScreen === "date") setScreen("service");
  }

  const heading = STEP_HEADINGS[activeScreen];

  return (
    <div className="space-y-6">
      <BookingFlowProgress
        currentStep={currentStep}
        completedSteps={{
          customer: customer !== null,
          service: serviceId !== null,
          date: dateIsValid,
        }}
        onSelectStep={(step) =>
          setScreen(step === 1 ? "customer" : step === 2 ? "service" : "date")
        }
      />

      <span role="status" aria-live="polite" className="sr-only">
        الخطوة الحالية: {heading.title}
      </span>

      {customer && activeScreen !== "customer" ? (
        <dl className="space-y-1.5 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">العميل</dt>
            <dd className="truncate font-medium">{customer.name}</dd>
          </div>
          {service && activeScreen === "date" ? (
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

        {activeScreen === "customer" ? (
          <CustomerStep
            initialCustomers={initialCustomers}
            selected={customer}
            onSelect={setCustomer}
          />
        ) : activeScreen === "service" ? (
          <ServiceStep
            services={services}
            selectedId={serviceId}
            onSelect={setServiceId}
            canManageServices={canManageServices}
          />
        ) : (
          <DateStep selectedDate={date} today={today} onSelect={setDate} />
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        {activeScreen === "customer" ? (
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
        <Button type="button" disabled={!canContinue} onClick={goNext}>
          التالي
        </Button>
      </div>
    </div>
  );
}

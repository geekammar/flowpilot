"use client";

import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status";
import { formatArabicDate } from "@/features/appointments/components/smart-create/date-format";
import { getMissingReviewFields } from "@/features/appointments/components/smart-create/review-step";
import {
  formatSlotTime,
  timezoneLabel,
} from "@/features/appointments/components/smart-create/slot-helpers";
import type {
  BookingCustomerOption,
  BookingServiceOption,
  ConfirmSubmitState,
  SelectedSlot,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/types/domain";

import {
  AlertCircleIcon,
  CalendarCheck2Icon,
  CheckCircle2Icon,
} from "lucide-react";

/**
 * Confirmation-behavior copy for the Business's booking setting
 * (`Business.confirmationMode` — server-derived, never client input):
 * what state the appointment will be created in.
 */
const CONFIRMATION_MODE_NOTE = {
  automatic:
    "سيُنشأ الموعد بحالة «مؤكد» مباشرةً عند التأكيد، وفقاً لإعداد المنشأة.",
  manual:
    "سيُنشأ الموعد بحالة «قيد الانتظار»، ويمكن تأكيده لاحقاً من صفحة الموعد.",
} as const;

/** Post-creation hint per server-derived status (create yields PENDING
 * or CONFIRMED only; any other status renders without a hint). */
const SUCCESS_HINT: Partial<Record<AppointmentStatus, string>> = {
  PENDING: "الموعد بانتظار التأكيد — يمكن تأكيده لاحقاً من صفحة الموعد.",
  CONFIRMED: "تم تأكيد الموعد وفقاً لإعداد المنشأة.",
};

/**
 * Step 6 — التأكيد (PROMPT-14). The final confirmation screen: a
 * read-only summary of the verified wizard state (customer, service,
 * date, slot + business timezone) plus the resulting
 * appointment/confirmation behavior from the Business setting. The
 * PRIMARY action (تأكيد الحجز) lives in the wizard footer — it calls
 * the EXISTING `createAppointment` action (the canonical write path);
 * this component NEVER creates anything itself. Submission lifecycle
 * is honest by construction: loading is announced, failures are typed
 * panels (a conflict offers اختيار وقت آخر back toward Step 4), and
 * the success state — including the appointment status badge — is
 * rendered ONLY from the server-confirmed result.
 */
export function ConfirmStep({
  customer,
  service,
  date,
  selectedSlot,
  timezone,
  confirmationMode,
  submitState,
  onChooseAnotherSlot,
}: {
  customer: BookingCustomerOption | null;
  service: BookingServiceOption | null;
  /** Business-local "YYYY-MM-DD" chosen in Step 3. */
  date: string | null;
  selectedSlot: SelectedSlot | null;
  /** Business timezone (server-derived prop — never client input). */
  timezone: string;
  confirmationMode: "automatic" | "manual";
  submitState: ConfirmSubmitState;
  /** SLOT_CONFLICT recovery — back to Step 4 for a fresh slot. */
  onChooseAnotherSlot: () => void;
}) {
  if (submitState.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="space-y-3 rounded-xl border border-success/30 bg-success/10 p-4"
      >
        <p className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2Icon
            aria-hidden
            className="size-5 shrink-0 text-success"
          />
          تم إنشاء الموعد بنجاح
        </p>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span>حالة الموعد:</span>
          <AppointmentStatusBadge status={submitState.appointmentStatus} />
        </p>
        {SUCCESS_HINT[submitState.appointmentStatus] ? (
          <p className="text-sm text-muted-foreground">
            {SUCCESS_HINT[submitState.appointmentStatus]}
          </p>
        ) : null}
      </div>
    );
  }

  // Defensive only: the review gate owns completeness before this
  // screen is reachable — report what is missing, never invent values.
  const missing = getMissingReviewFields({
    customer,
    service,
    date,
    selectedSlot,
  });
  if (missing.length > 0) {
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
      >
        <p className="flex items-center gap-2 text-sm font-semibold">
          <AlertCircleIcon
            aria-hidden
            className="size-5 shrink-0 text-destructive"
          />
          لا يمكن تأكيد الحجز — تفاصيل ناقصة
        </p>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          {missing.map((item) => (
            <li key={item.field}>{item.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  // The missing-fields derivation above is the single authority; this
  // guard only satisfies the type checker (unreachable when the list
  // is empty) and keeps the summary below free of fallback values.
  if (!customer || !service || !selectedSlot || !date) return null;

  const conflict =
    submitState.status === "error" && submitState.code === "SLOT_CONFLICT";

  return (
    <div className="space-y-3">
      {submitState.status === "submitting" ? (
        <p role="status" aria-live="polite" className="sr-only">
          جارٍ إنشاء الموعد…
        </p>
      ) : null}

      <section
        aria-label="ملخص الحجز"
        className="rounded-xl border bg-card p-4"
      >
        <h3 className="text-sm font-semibold">ملخص الحجز</h3>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">العميل</dt>
            <dd className="truncate font-medium">{customer.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">الهاتف</dt>
            <dd className="truncate font-medium tabular-nums" dir="ltr">
              {customer.phone}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">الخدمة</dt>
            <dd className="truncate font-medium">
              {service.name} · {service.durationMinutes} دقيقة
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">التاريخ</dt>
            <dd className="truncate font-medium">{formatArabicDate(date)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">الوقت</dt>
            <dd className="truncate font-medium">
              <span className="tabular-nums">
                من {formatSlotTime(selectedSlot.startTime)} إلى{" "}
                {formatSlotTime(selectedSlot.endTime)}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">التوقيت</dt>
            <dd className="truncate">{timezoneLabel(timezone)}</dd>
          </div>
        </dl>
      </section>

      <div className="space-y-1.5 rounded-xl border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <CalendarCheck2Icon aria-hidden className="size-5 shrink-0" />
          حالة الموعد بعد التأكيد
        </p>
        <p className="text-sm">{CONFIRMATION_MODE_NOTE[confirmationMode]}</p>
      </div>

      {conflict ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircleIcon
              aria-hidden
              className="size-5 shrink-0 text-destructive"
            />
            لم يعد الوقت المحدد متاحاً
          </p>
          <p className="text-sm">
            ربما حُجز هذا الوقت في هذه الأثناء. اختر وقتاً آخر للموعد.
          </p>
          <Button type="button" size="sm" onClick={onChooseAnotherSlot}>
            اختيار وقت آخر
          </Button>
        </div>
      ) : submitState.status === "error" ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <p className="text-sm">{submitState.message}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            يمكنك المحاولة مرة أخرى أو الرجوع إلى المراجعة.
          </p>
        </div>
      ) : null}
    </div>
  );
}

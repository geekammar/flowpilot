"use client";

import { createAppointment } from "@/features/appointments/actions/appointment-actions";
import { formatArabicDate } from "@/features/appointments/components/smart-create/date-format";
import {
  bookingDetailsFormSchema,
  type BookingDetailsFormInput,
} from "@/features/appointments/schemas/booking-flow-schema";
import type {
  BookingCustomerOption,
  BookingServiceOption,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

function addMinutes(time: string, minutes: number) {
  const [hours = 0, currentMinutes = 0] = time.split(":").map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  if (total >= 24 * 60) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Interim booking-details screen (time + note + create). This is NOT
 * one of the 6 flow steps — it is the temporary completion of today's
 * booking path, reusing the existing `createAppointment` action, until
 * available-slot selection (step 4, consuming the PROMPT-10
 * availability layer) lands in the next prompt.
 */
export function BookingDetailsStep({
  customer,
  service,
  date,
  onBack,
}: {
  customer: BookingCustomerOption;
  service: BookingServiceOption;
  date: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const form = useForm<BookingDetailsFormInput>({
    resolver: zodResolver(bookingDetailsFormSchema),
    defaultValues: { startTime: "09:00", notes: "" },
  });
  const startTime = form.watch("startTime");
  const endTime = addMinutes(startTime, service.durationMinutes);

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    const result = await createAppointment({
      customerId: customer.id,
      serviceId: service.id,
      date,
      startTime: data.startTime,
      notes: data.notes,
    });
    if (!result.success) {
      setError(result.message);
      return;
    }
    setIsRedirecting(true);
    router.replace(`/appointments/${result.appointmentId}`);
  });

  const isPending = form.formState.isSubmitting || isRedirecting;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <dl className="space-y-2 rounded-xl border bg-muted/40 p-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">العميل</dt>
          <dd className="truncate font-medium">{customer.name}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">الخدمة</dt>
          <dd className="truncate font-medium">
            {service.name} · {service.durationMinutes} دقيقة
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">التاريخ</dt>
          <dd className="truncate font-medium">{formatArabicDate(date)}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <Label htmlFor="booking-start-time">وقت البداية</Label>
        <Input
          id="booking-start-time"
          type="time"
          dir="ltr"
          aria-invalid={Boolean(form.formState.errors.startTime)}
          {...form.register("startTime")}
        />
        {form.formState.errors.startTime ? (
          <p role="alert" className="text-xs text-destructive">
            {form.formState.errors.startTime.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            ينتهي {endTime ?? "بعد نهاية اليوم"} · مدة الخدمة{" "}
            {service.durationMinutes} دقيقة
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-notes">ملاحظة</Label>
        <Textarea
          id="booking-notes"
          rows={3}
          placeholder="أي تفاصيل يحتاجها الفريق قبل الموعد…"
          aria-invalid={Boolean(form.formState.errors.notes)}
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p role="alert" className="text-xs text-destructive">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
        >
          <ArrowRightIcon />
          رجوع
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          إنشاء الموعد
        </Button>
      </div>
    </form>
  );
}

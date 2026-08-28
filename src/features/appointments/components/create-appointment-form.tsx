"use client";

import { createAppointment } from "@/features/appointments/actions/appointment-actions";
import {
  createAppointmentFormSchema,
  type CreateAppointmentFormInput,
} from "@/features/appointments/schemas/appointment-schema";
import type {
  AppointmentOption,
  ServiceOption,
} from "@/features/appointments/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

function addMinutes(time: string, minutes: number) {
  const [hours = 0, currentMinutes = 0] = time.split(":").map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  if (total >= 24 * 60) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function CreateAppointmentForm({
  customers,
  services,
  defaultDate,
}: {
  customers: AppointmentOption[];
  services: ServiceOption[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateAppointmentFormInput>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: {
      customerId: "",
      serviceId: "",
      date: defaultDate,
      startTime: "09:00",
      notes: "",
    },
  });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const startTime = useWatch({ control: form.control, name: "startTime" });
  const selectedDate = useWatch({ control: form.control, name: "date" });
  const service = services.find((item) => item.id === serviceId);
  const endTime = service
    ? addMinutes(startTime, service.durationMinutes)
    : null;

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    const result = await createAppointment(data);
    if (!result.success) {
      setError(result.message);
      return;
    }
    startTransition(() =>
      router.replace(`/appointments/${result.appointmentId}`),
    );
  });

  const unavailable = customers.length === 0 || services.length === 0;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {unavailable ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6">
          {customers.length === 0
            ? "أضف عميلاً أولاً قبل إنشاء موعد."
            : "أضف خدمة نشطة أولاً قبل إنشاء موعد."}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="customer-select"
          label="العميل"
          error={form.formState.errors.customerId?.message}
        >
          <Controller
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="customer-select"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.customerId)}
                >
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="service-select"
          label="الخدمة"
          error={form.formState.errors.serviceId?.message}
        >
          <Controller
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="service-select"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.serviceId)}
                >
                  <SelectValue placeholder="اختر الخدمة" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} · {item.durationMinutes} دقيقة
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="appointment-date"
          label="التاريخ"
          error={form.formState.errors.date?.message}
        >
          <Input
            id="appointment-date"
            type="date"
            dir="ltr"
            aria-invalid={Boolean(form.formState.errors.date)}
            {...form.register("date")}
          />
        </Field>

        <Field
          id="appointment-time"
          label="وقت البداية"
          error={form.formState.errors.startTime?.message}
        >
          <Input
            id="appointment-time"
            type="time"
            dir="ltr"
            aria-invalid={Boolean(form.formState.errors.startTime)}
            {...form.register("startTime")}
          />
          {service ? (
            <p className="text-xs text-muted-foreground">
              ينتهي {endTime ?? "بعد نهاية اليوم"} · مدة الخدمة{" "}
              {service.durationMinutes} دقيقة
            </p>
          ) : null}
        </Field>
      </div>

      <Field
        id="appointment-notes"
        label="ملاحظة"
        error={form.formState.errors.notes?.message}
      >
        <Textarea
          id="appointment-notes"
          rows={4}
          placeholder="أي تفاصيل يحتاجها الفريق قبل الموعد…"
          aria-invalid={Boolean(form.formState.errors.notes)}
          {...form.register("notes")}
        />
      </Field>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline">
          <Link href={`/appointments?date=${selectedDate}`}>
            <ArrowRightIcon />
            رجوع
          </Link>
        </Button>
        <Button type="submit" disabled={isPending || unavailable || !endTime}>
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          إنشاء الموعد
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

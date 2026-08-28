"use client";

import {
  createService,
  deleteService,
  updateService,
} from "@/features/onboarding/actions/onboarding-actions";
import {
  serviceFormSchema,
  type ServiceFormInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import type { OnboardingService } from "@/features/onboarding/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";

const EMPTY_SERVICE: ServiceFormInput = { name: "", durationMinutes: 30 };

export function ServicesForm({
  initialServices,
}: {
  initialServices: OnboardingService[];
}) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: EMPTY_SERVICE,
  });

  const submitService = form.handleSubmit(async (data) => {
    setError(null);
    setBusyId(editingId ?? "new");

    if (editingId) {
      const result = await updateService(editingId, data);
      if (!result.success) {
        setBusyId(null);
        setError(result.message);
        return;
      }
      setServices((current) =>
        current.map((service) =>
          service.id === editingId ? { id: editingId, ...data } : service,
        ),
      );
    } else {
      const result = await createService(data);
      if (!result.success) {
        setBusyId(null);
        setError(result.message);
        return;
      }
      setServices((current) => [...current, { id: result.data.id, ...data }]);
    }

    setBusyId(null);
    setEditingId(null);
    form.reset(EMPTY_SERVICE);
  });

  function startEdit(service: OnboardingService) {
    setEditingId(service.id);
    form.reset({
      name: service.name,
      durationMinutes: service.durationMinutes,
    });
  }

  async function removeService(service: OnboardingService) {
    setError(null);
    setBusyId(service.id);
    const result = await deleteService(service.id);
    setBusyId(null);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setServices((current) => current.filter((item) => item.id !== service.id));
    if (editingId === service.id) {
      setEditingId(null);
      form.reset(EMPTY_SERVICE);
    }
  }

  function continueToAvailability() {
    if (services.length === 0) {
      setError("أضف خدمة واحدة على الأقل للمتابعة");
      return;
    }
    startTransition(() => router.push("/onboarding/availability"));
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submitService}
        className="rounded-xl border bg-card p-5"
        noValidate
      >
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_160px_auto]">
          <div className="space-y-2">
            <Label htmlFor="service-name">اسم الخدمة</Label>
            <Input
              id="service-name"
              placeholder="مثال: استشارة أولى"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-duration">المدة بالدقائق</Label>
            <Input
              id="service-duration"
              type="number"
              min={5}
              max={480}
              step={5}
              inputMode="numeric"
              aria-invalid={Boolean(form.formState.errors.durationMinutes)}
              {...form.register("durationMinutes")}
            />
          </div>
          <Button type="submit" disabled={busyId !== null}>
            {busyId === (editingId ?? "new") ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : editingId ? (
              <PencilIcon />
            ) : (
              <PlusIcon />
            )}
            {editingId ? "حفظ" : "إضافة"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed px-5 py-8 text-center">
            <p className="font-medium">لم تضف خدمات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أضف أول خدمة ليتمكن المساعد من حجزها.
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {service.durationMinutes} دقيقة
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`تعديل ${service.name}`}
                onClick={() => startEdit(service)}
              >
                <PencilIcon />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label={`حذف ${service.name}`}
                disabled={busyId !== null}
                onClick={() => void removeService(service)}
              >
                {busyId === service.id ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <Trash2Icon />
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end border-t pt-5">
        <Button type="button" size="lg" onClick={continueToAvailability}>
          حفظ ومتابعة
          <ArrowLeftIcon />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { saveAvailability } from "@/features/onboarding/actions/onboarding-actions";
import { SaveIndicator } from "@/features/onboarding/components/save-indicator";
import { useAutosave } from "@/features/onboarding/hooks/use-autosave";
import {
  DAYS,
  availabilitySchema,
  type AvailabilityInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

export function AvailabilityForm({
  defaultValues,
}: {
  defaultValues: AvailabilityInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues,
    mode: "onChange",
  });
  const values = useWatch({ control: form.control }) as AvailabilityInput;
  const autosave = useAutosave({
    value: values,
    enabled: form.formState.isValid,
    save: saveAvailability,
  });

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    autosave.setState("saving");
    const result = await saveAvailability(data);
    if (!result.success) {
      autosave.setState("error");
      setError(result.message);
      return;
    }
    autosave.setState("saved");
    startTransition(() => router.push("/onboarding/knowledge"));
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-medium">أيام وساعات العمل</legend>
        {DAYS.map((day) => {
          const closed = values.workingHours[day.key].closed;
          return (
            <div
              key={day.key}
              className="grid items-center gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[110px_1fr_1fr]"
            >
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name={`workingHours.${day.key}.closed`}
                  render={({ field }) => (
                    <Checkbox
                      id={`day-${day.key}`}
                      checked={!field.value}
                      onCheckedChange={(checked) => field.onChange(!checked)}
                    />
                  )}
                />
                <Label htmlFor={`day-${day.key}`}>{day.label}</Label>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">من</span>
                <Input
                  type="time"
                  dir="ltr"
                  disabled={closed}
                  {...form.register(`workingHours.${day.key}.open`)}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">إلى</span>
                <Input
                  type="time"
                  dir="ltr"
                  disabled={closed}
                  aria-invalid={Boolean(
                    form.formState.errors.workingHours?.[day.key]?.close,
                  )}
                  {...form.register(`workingHours.${day.key}.close`)}
                />
                {form.formState.errors.workingHours?.[day.key]?.close ? (
                  <p className="text-xs text-destructive">
                    {
                      form.formState.errors.workingHours[day.key]?.close
                        ?.message
                    }
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </fieldset>

      <div className="max-w-xs space-y-2">
        <Label>مدة الفترة المتاحة للحجز</Label>
        <Controller
          control={form.control}
          name="slotDurationMinutes"
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOT_OPTIONS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {minutes} دقيقة
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t pt-5">
        <SaveIndicator state={autosave.state} />
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          حفظ ومتابعة
          <ArrowLeftIcon />
        </Button>
      </div>
    </form>
  );
}

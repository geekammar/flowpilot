"use client";

import { saveBusinessSetup } from "@/features/onboarding/actions/onboarding-actions";
import { SaveIndicator } from "@/features/onboarding/components/save-indicator";
import { useAutosave } from "@/features/onboarding/hooks/use-autosave";
import {
  businessSetupSchema,
  type BusinessSetupInput,
} from "@/features/onboarding/schemas/onboarding-schema";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const TIMEZONES = [
  { value: "Africa/Cairo", label: "القاهرة (توقيت مصر)" },
  { value: "Asia/Riyadh", label: "الرياض" },
  { value: "Asia/Dubai", label: "دبي" },
] as const;

export function BusinessSetupForm({
  defaultValues,
}: {
  defaultValues: BusinessSetupInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<BusinessSetupInput>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues,
    mode: "onChange",
  });
  const values = useWatch({ control: form.control }) as BusinessSetupInput;
  const autosave = useAutosave({
    value: values,
    enabled: form.formState.isValid,
    save: saveBusinessSetup,
  });

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    autosave.setState("saving");
    const result = await saveBusinessSetup(data);
    if (!result.success) {
      autosave.setState("error");
      setError(result.message);
      return;
    }
    autosave.setState("saved");
    startTransition(() => router.push("/onboarding/services"));
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="اسم المنشأة" error={form.formState.errors.name?.message}>
          <Input
            autoFocus
            autoComplete="organization"
            placeholder="مثال: مركز الوفاء"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </Field>
        <Field label="المدينة" error={form.formState.errors.city?.message}>
          <Input
            autoComplete="address-level2"
            placeholder="مثال: كفر الشيخ"
            aria-invalid={Boolean(form.formState.errors.city)}
            {...form.register("city")}
          />
        </Field>
        <Field
          label="رقم واتساب"
          error={form.formState.errors.whatsappNumber?.message}
        >
          <Input
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="+20 100 000 0000"
            className="text-start"
            aria-invalid={Boolean(form.formState.errors.whatsappNumber)}
            {...form.register("whatsappNumber")}
          />
        </Field>
        <Field
          label="المنطقة الزمنية"
          error={form.formState.errors.timezone?.message}
        >
          <Controller
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المنطقة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t pt-5">
        <SaveIndicator state={autosave.state} />
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          حفظ ومتابعة
          <ArrowLeftIcon />
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

"use client";

import { saveBusinessSetup } from "@/features/onboarding/actions/onboarding-actions";
import { SaveIndicator } from "@/features/onboarding/components/save-indicator";
import { useAutosave } from "@/features/onboarding/hooks/use-autosave";
import {
  TIMEZONES,
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
import { Textarea } from "@/components/ui/textarea";
import { VERTICALS } from "@/lib/validation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type DefaultValues,
} from "react-hook-form";

export function BusinessSetupForm({
  defaultValues,
}: {
  defaultValues: DefaultValues<BusinessSetupInput>;
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
    startTransition(() => router.push("/onboarding/hours"));
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="business-name">اسم المنشأة</Label>
          <Input
            id="business-name"
            autoFocus
            autoComplete="organization"
            placeholder="مثال: مركز الوفاء"
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
          <Label htmlFor="business-vertical">نوع المنشأة</Label>
          <Controller
            control={form.control}
            name="vertical"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="business-vertical" className="w-full">
                  <SelectValue placeholder="اختر نوع المنشأة" />
                </SelectTrigger>
                <SelectContent>
                  {VERTICALS.map((vertical) => (
                    <SelectItem key={vertical.value} value={vertical.value}>
                      {vertical.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.vertical ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.vertical.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-city">المدينة</Label>
          <Input
            id="business-city"
            autoComplete="address-level2"
            placeholder="مثال: كفر الشيخ"
            aria-invalid={Boolean(form.formState.errors.city)}
            {...form.register("city")}
          />
          {form.formState.errors.city ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.city.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-whatsapp">رقم واتساب</Label>
          <Input
            id="business-whatsapp"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="+20 100 000 0000"
            className="text-start"
            aria-invalid={Boolean(form.formState.errors.whatsappNumber)}
            {...form.register("whatsappNumber")}
          />
          {form.formState.errors.whatsappNumber ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.whatsappNumber.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-timezone">المنطقة الزمنية</Label>
          <Controller
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="business-timezone" className="w-full">
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
          {form.formState.errors.timezone ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.timezone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="business-about">
            نبذة عن المنشأة{" "}
            <span className="font-normal text-muted-foreground">(اختياري)</span>
          </Label>
          <Textarea
            id="business-about"
            rows={3}
            placeholder="وصف قصير يعرّف العملاء بمنشأتك."
            aria-invalid={Boolean(form.formState.errors.about)}
            {...form.register("about")}
          />
          {form.formState.errors.about ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.about.message}
            </p>
          ) : null}
        </div>
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

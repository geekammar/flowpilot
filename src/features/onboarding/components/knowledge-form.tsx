"use client";

import { saveKnowledge } from "@/features/onboarding/actions/onboarding-actions";
import { SaveIndicator } from "@/features/onboarding/components/save-indicator";
import { useAutosave } from "@/features/onboarding/hooks/use-autosave";
import {
  knowledgeSchema,
  type KnowledgeInput,
} from "@/features/onboarding/schemas/onboarding-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  LoaderCircleIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

export function KnowledgeForm({
  defaultValues,
}: {
  defaultValues: KnowledgeInput;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<KnowledgeInput>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues,
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });
  const values = useWatch({ control: form.control }) as KnowledgeInput;
  const autosave = useAutosave({
    value: values,
    enabled: form.formState.isValid,
    save: saveKnowledge,
  });

  const submit = form.handleSubmit(async (data) => {
    setError(null);
    autosave.setState("saving");
    const result = await saveKnowledge(data);
    if (!result.success) {
      autosave.setState("error");
      setError(result.message);
      return;
    }
    autosave.setState("saved");
    startTransition(() => router.push("/onboarding/complete"));
  });

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      <div className="space-y-2">
        <Label htmlFor="about">عن المنشأة</Label>
        <Textarea
          id="about"
          rows={4}
          placeholder="اكتب نبذة بسيطة تساعد المساعد على تعريف العملاء بمنشأتك."
          aria-invalid={Boolean(form.formState.errors.about)}
          {...form.register("about")}
        />
        {form.formState.errors.about ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.about.message}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <legend className="text-sm font-medium">الأسئلة الشائعة</legend>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ question: "", answer: "" })}
          >
            <PlusIcon />
            إضافة سؤال
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            أضف الأسئلة التي يكررها العملاء، أو تابع بدون أسئلة.
          </p>
        ) : null}
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-lg border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Label htmlFor={`faq-${index}-question`} className="flex-1">
                السؤال {index + 1}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`حذف السؤال ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2Icon />
              </Button>
            </div>
            <Input
              id={`faq-${index}-question`}
              placeholder="مثال: هل يلزم الحجز مسبقاً؟"
              aria-invalid={Boolean(
                form.formState.errors.faqs?.[index]?.question,
              )}
              {...form.register(`faqs.${index}.question`)}
            />
            <Textarea
              placeholder="اكتب الإجابة التي تريد أن يذكرها المساعد."
              rows={3}
              aria-invalid={Boolean(
                form.formState.errors.faqs?.[index]?.answer,
              )}
              {...form.register(`faqs.${index}.answer`)}
            />
            {form.formState.errors.faqs?.[index]?.question ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.faqs[index]?.question?.message}
              </p>
            ) : null}
            {form.formState.errors.faqs?.[index]?.answer ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.faqs[index]?.answer?.message}
              </p>
            ) : null}
          </div>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="cancellationPolicy">سياسة الإلغاء</Label>
        <Textarea
          id="cancellationPolicy"
          rows={3}
          placeholder="مثال: يمكن الإلغاء أو التعديل قبل الموعد بـ 24 ساعة."
          aria-invalid={Boolean(form.formState.errors.cancellationPolicy)}
          {...form.register("cancellationPolicy")}
        />
        {form.formState.errors.cancellationPolicy ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.cancellationPolicy.message}
          </p>
        ) : null}
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

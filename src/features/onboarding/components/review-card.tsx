"use client";

import { completeOnboarding } from "@/features/onboarding/actions/onboarding-actions";
import type { ReviewSummary } from "@/features/onboarding/types";
import { Button } from "@/components/ui/button";

import {
  ArrowLeftIcon,
  LoaderCircleIcon,
  PencilLineIcon,
  RocketIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ReviewCard({ summary }: { summary: ReviewSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setError(null);
    const result = await completeOnboarding();
    if (!result.success) {
      setError(result.message);
      return;
    }
    startTransition(() => router.replace("/"));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5">
        <SectionHeader title="بيانات المنشأة" href="/onboarding/business" />
        <dl className="space-y-3 text-sm">
          <Row label="الاسم" value={summary.businessName} />
          <Row label="النوع" value={summary.verticalLabel} />
          <Row label="المدينة" value={summary.city} />
          <Row label="رقم واتساب" value={summary.whatsappNumber} ltr />
          <Row label="المنطقة الزمنية" value={summary.timezoneLabel} />
          {summary.about ? <Row label="نبذة" value={summary.about} /> : null}
        </dl>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <SectionHeader title="ساعات العمل" href="/onboarding/hours" />
        <ul className="divide-y text-sm first:mt-0">
          {summary.workingHours.map((day) => (
            <li
              key={day.key}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <span className="text-muted-foreground">{day.label}</span>
              <span
                className={
                  day.closed
                    ? "text-muted-foreground"
                    : "font-medium tabular-nums"
                }
              >
                {day.closed ? "مغلق" : `${day.open} — ${day.close}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <SectionHeader title="إعدادات الحجز" href="/onboarding/booking" />
        <dl className="space-y-3 text-sm">
          <Row
            label="مدة الحجز الافتراضية"
            value={`${summary.slotDurationMinutes} دقيقة`}
          />
          <Row label="سياسة الإلغاء" value={summary.cancellationPolicy} />
        </dl>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border bg-card p-5 text-center">
        <RocketIcon className="mx-auto size-8 text-primary" />
        <p className="mt-2 font-semibold">كل شيء جاهز</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          بتشغيل المنشأة تنتقل إلى لوحة التحكم، ويمكنك تعديل هذه البيانات في أي
          وقت.
        </p>
        <Button
          size="lg"
          className="mt-4"
          onClick={() => void finish()}
          disabled={isPending}
        >
          {isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
          تشغيل المنشأة
          <ArrowLeftIcon />
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <Button variant="ghost" size="sm" asChild>
        <Link href={href}>
          <PencilLineIcon />
          تعديل
        </Link>
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        dir={ltr ? "ltr" : undefined}
        className={
          ltr ? "text-start font-medium tabular-nums" : "text-start font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

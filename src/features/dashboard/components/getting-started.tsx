import { Button } from "@/components/ui/button";

import {
  CalendarPlusIcon,
  MessageSquareTextIcon,
  PhoneIcon,
} from "lucide-react";
import Link from "next/link";

/**
 * Shown on the dashboard only while the business has zero activity
 * (no conversations, no appointments) — turns a blank screen into
 * actionable onboarding guidance instead of dead stat cards.
 */
export function GettingStarted({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section
      aria-labelledby="getting-started-heading"
      className="rounded-xl border bg-card p-5 shadow-xs"
    >
      <h2 id="getting-started-heading" className="text-base font-semibold">
        أهلاً بك في منشأتك الجديدة 👋
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        لوحة اليوم بتتملى أول ما عملاؤك يبدأوا التواصل. جهّز نفسك في ٣ خطوات:
      </p>

      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        <li className="space-y-2 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
              <PhoneIcon aria-hidden className="size-4" />
            </span>
            <p className="text-sm font-medium">١. شارك رقم الواتساب</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            اربط عملاءك برقم منشأتك{" "}
            <span dir="ltr" className="font-medium tabular-nums">
              {whatsappNumber}
            </span>{" "}
            — كل رسالة تتحول لمحادثة هنا مع رد فوري على عملائك.
          </p>
        </li>

        <li className="space-y-2 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
              <CalendarPlusIcon aria-hidden className="size-4" />
            </span>
            <p className="text-sm font-medium">٢. أنشئ أول موعد</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            أضف موعدًا يدويًا لعميل موجود، أو انتظر أول حجز ييجي من محادثة.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/appointments/new">إنشاء موعد</Link>
          </Button>
        </li>

        <li className="space-y-2 rounded-lg border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
              <MessageSquareTextIcon aria-hidden className="size-4" />
            </span>
            <p className="text-sm font-medium">٣. تابع المحادثات</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            افتح صندوق الوارد وشوف المساعد الذكي بيرد على عملائك وبيحوّل ليك
            اللي محتاج تدخلك.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/conversations">فتح المحادثات</Link>
          </Button>
        </li>
      </ol>
    </section>
  );
}

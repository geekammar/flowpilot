import { Button } from "@/components/ui/button";

import { ArrowLeftIcon, MessageCircleIcon, TimerIcon } from "lucide-react";
import Link from "next/link";

export default function OnboardingWelcomePage() {
  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-medium text-primary">
          مرحباً بك في FlowPilot
        </p>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          خلّ عملاءك يحجزون بسهولة عبر واتساب
        </h1>
        <p className="max-w-xl text-base leading-8 text-muted-foreground">
          FlowPilot يساعدك على الرد السريع على العملاء، عرض خدماتك، وتحويل
          المحادثات إلى مواعيد مؤكدة. نجهز حسابك في أقل من 5 دقائق.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-xl border bg-card p-4">
          <MessageCircleIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">ردود أوضح وأسرع</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              المساعد يجيب عن الأسئلة المتكررة ويترك لك الحالات المهمة.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border bg-card p-4">
          <TimerIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">إعداد بسيط</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              أضف خدماتك وأوقاتك ومعلوماتك، وسنرتب الباقي.
            </p>
          </div>
        </div>
      </div>

      <Button asChild size="lg">
        <Link href="/onboarding/business">
          ابدأ إعداد المنشأة
          <ArrowLeftIcon />
        </Link>
      </Button>
    </div>
  );
}

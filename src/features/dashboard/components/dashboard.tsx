import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentConversations } from "@/features/dashboard/components/recent-conversations";
import { TodayAgenda } from "@/features/dashboard/components/today-agenda";
import type { getDashboardData } from "@/features/dashboard/server/dashboard-query";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

import {
  CalendarCheck2Icon,
  ClockAlertIcon,
  HeadphonesIcon,
  MessagesSquareIcon,
} from "lucide-react";

export function Dashboard({
  businessName,
  timeZone,
  data,
}: {
  businessName: string;
  timeZone: string;
  data: Awaited<ReturnType<typeof getDashboardData>>;
}) {
  return (
    <div className="animate-fade-in-up space-y-8">
      <PageHeader
        title={`اليوم في ${businessName}`}
        description="ابدأ بما يحتاج تدخلك، ثم راجع جدول المواعيد."
      />

      <section aria-labelledby="today-summary-heading" className="space-y-3">
        <h2 id="today-summary-heading" className="sr-only">
          ملخص اليوم
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="محادثات اليوم"
            value={data.conversations.todayCount}
            icon={MessagesSquareIcon}
          />
          <StatCard
            label="تحتاج تدخلاً"
            value={data.conversations.needHumanCount}
            icon={HeadphonesIcon}
            delta={
              data.conversations.needHumanCount > 0
                ? "تحتاج انتباهك"
                : "لا شيء معلق"
            }
            deltaTone={
              data.conversations.needHumanCount > 0 ? "negative" : "positive"
            }
          />
          <StatCard
            label="مواعيد معلقة"
            value={data.appointments.pendingCount}
            icon={ClockAlertIcon}
          />
          <StatCard
            label="مؤكدة اليوم"
            value={data.appointments.confirmedCount}
            icon={CalendarCheck2Icon}
          />
        </div>
      </section>

      <QuickActions />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <TodayAgenda appointments={data.appointments.agenda} />
        <RecentConversations
          conversations={data.conversations.recent}
          timeZone={timeZone}
        />
      </div>
    </div>
  );
}

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { AppointmentWithRelations } from "@/types/domain";

import { ArrowUpLeftIcon, CalendarCheck2Icon, Clock3Icon } from "lucide-react";
import Link from "next/link";

function formatTime(time: Date) {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
}

function appointmentStatus(status: AppointmentWithRelations["status"]) {
  return status === "CONFIRMED" ? "confirmed" : "pending";
}

export function TodayAgenda({
  appointments,
}: {
  appointments: AppointmentWithRelations[];
}) {
  return (
    <section aria-labelledby="today-agenda-heading" className="min-w-0">
      <SectionHeader
        title="جدول اليوم"
        description="المواعيد القادمة مرتبة حسب الوقت."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/appointments">
              كل المواعيد
              <ArrowUpLeftIcon />
            </Link>
          </Button>
        }
      />

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2Icon}
          title="جدول اليوم هادئ"
          description="لا توجد مواعيد معلقة أو مؤكدة اليوم. يمكنك إضافة موعد يدوياً عند الحاجة."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/appointments?create=true">إنشاء موعد</Link>
            </Button>
          }
          className="bg-card py-10"
        />
      ) : (
        <ol className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <Link
                href={`/appointments/${appointment.id}`}
                className="group grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 sm:grid-cols-[90px_minmax(0,1fr)_auto]"
              >
                <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                  <Clock3Icon
                    aria-hidden
                    className="size-3.5 text-muted-foreground"
                  />
                  <time dateTime={appointment.startTime.toISOString()}>
                    {formatTime(appointment.startTime)}
                  </time>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {appointment.customer.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {appointment.service.name} ·{" "}
                    {appointment.service.durationMinutes} دقيقة
                  </p>
                </div>
                <StatusBadge status={appointmentStatus(appointment.status)} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

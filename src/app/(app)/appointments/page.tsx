import { AppointmentAgenda } from "@/features/appointments/components/appointment-agenda";
import {
  getAppointmentAgenda,
  todayInTimezone,
} from "@/features/appointments/server/appointment-queries";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { appointmentDateSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "المواعيد",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; create?: string }>;
}) {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding");
  const business = await businessRepository.findById(session.user.businessId);
  if (!business) redirect("/onboarding");
  const params = await searchParams;
  const today = todayInTimezone(business.timezone);
  const parsedDate = appointmentDateSchema.safeParse(params.date);
  const date = parsedDate.success ? parsedDate.data : today;
  if (params.create === "true") redirect(`/appointments/new?date=${date}`);
  const appointments = await getAppointmentAgenda(business.id, date);

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="جدول المواعيد"
        description="راجع يومك بسرعة وتعامل مع كل موعد من قائمة واضحة."
        actions={
          <Button asChild>
            <Link href={`/appointments/new?date=${date}`}>
              <PlusIcon />
              إنشاء موعد
            </Link>
          </Button>
        }
      />
      <AppointmentAgenda
        initialItems={appointments}
        date={date}
        today={today}
      />
    </div>
  );
}

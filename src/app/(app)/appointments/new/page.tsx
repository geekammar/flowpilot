import { CreateAppointmentForm } from "@/features/appointments/components/create-appointment-form";
import {
  getAppointmentFormOptions,
  todayInTimezone,
} from "@/features/appointments/server/appointment-queries";
import { PageHeader } from "@/components/shared/page-header";
import { appointmentDateSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "إنشاء موعد",
};

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding");
  const business = await businessRepository.findById(session.user.businessId);
  if (!business) redirect("/onboarding");
  const params = await searchParams;
  const parsedDate = appointmentDateSchema.safeParse(params.date);
  const defaultDate = parsedDate.success
    ? parsedDate.data
    : todayInTimezone(business.timezone);
  const options = await getAppointmentFormOptions(business.id);

  return (
    <div className="animate-fade-in-up space-y-8">
      <PageHeader
        title="إنشاء موعد"
        description="اختر العميل والخدمة والوقت، وسنحسب مدة الموعد تلقائياً."
      />
      <div className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
        <CreateAppointmentForm
          customers={options.customers}
          services={options.services}
          defaultDate={defaultDate}
        />
      </div>
    </div>
  );
}

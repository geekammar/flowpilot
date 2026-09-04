import { SmartCreateAppointment } from "@/features/appointments/components/smart-create/smart-create-appointment";
import { todayInTimezone } from "@/features/appointments/server/appointment-queries";
import {
  defaultBookingFlowServiceDeps,
  listBookingServices,
  searchBookingCustomers,
  type BookingFlowActor,
} from "@/features/appointments/server/booking-flow-service";
import { PageHeader } from "@/components/shared/page-header";
import { appointmentDateSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/guards";
import { businessRepository } from "@/server/repositories";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "إنشاء موعد",
};

/**
 * Smart Create Appointment flow (PROMPT-11 Steps 1–3 + PROMPT-12
 * Step 4 + PROMPT-13 Step 5 + PROMPT-14 Step 6). The Business is
 * derived from the authenticated session (never client input), the
 * initial customers + active services are read through the
 * booking-flow service (tenant-scoped), `today` is business-local,
 * and the Business timezone / confirmation mode travel to Step 6 as
 * server-derived display properties.
 */
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

  // Session role normalization: anything non-ADMIN behaves as STAFF
  // (least privilege — same fallback as the availability action).
  const role = session.user.role === "ADMIN" ? "ADMIN" : "STAFF";
  const actor: BookingFlowActor = {
    userId: session.user.id,
    role,
    businessId: business.id,
  };
  const [customerResult, serviceResult] = await Promise.all([
    searchBookingCustomers(defaultBookingFlowServiceDeps, actor, { query: "" }),
    listBookingServices(defaultBookingFlowServiceDeps, actor),
  ]);

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="إنشاء موعد"
        description="أنشئ الموعد في خطوات واضحة: العميل، ثم الخدمة، ثم التاريخ، ثم الوقت المتاح، ثم المراجعة والتأكيد."
      />
      <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-6">
        <SmartCreateAppointment
          initialCustomers={
            customerResult.success ? customerResult.customers : []
          }
          services={Array.isArray(serviceResult) ? serviceResult : []}
          defaultDate={defaultDate}
          today={todayInTimezone(business.timezone)}
          canManageServices={role === "ADMIN"}
          businessTimezone={business.timezone}
          confirmationMode={
            business.confirmationMode === "automatic" ? "automatic" : "manual"
          }
        />
      </div>
    </div>
  );
}

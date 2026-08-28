import { AppointmentDetail } from "@/features/appointments/components/appointment-detail";
import { getAppointmentDetail } from "@/features/appointments/server/appointment-queries";
import { requireUser } from "@/server/auth/guards";

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "تفاصيل الموعد",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  if (!session.user.businessId) redirect("/onboarding");
  const { id } = await params;
  const appointment = await getAppointmentDetail(session.user.businessId, id);
  if (!appointment) notFound();

  return <AppointmentDetail initialData={appointment} />;
}

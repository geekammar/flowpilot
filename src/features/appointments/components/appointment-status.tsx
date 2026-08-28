import { StatusBadge } from "@/components/shared/status-badge";
import type { AppointmentStatus } from "@/types/domain";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغي",
  NO_SHOW: "لم يحضر",
  COMPLETED: "مكتمل",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const values = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    NO_SHOW: "no-show",
    COMPLETED: "completed",
  } as const;
  return <StatusBadge status={values[status]} />;
}

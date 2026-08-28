import type { AppointmentStatus } from "@/types/domain";

export type AppointmentAgendaItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  customer: { id: string; name: string; phone: string };
  service: { id: string; name: string; durationMinutes: number };
};

export type AppointmentDetailData = AppointmentAgendaItem & {
  conversationId: string | null;
};

export type AppointmentOption = { id: string; name: string };
export type ServiceOption = AppointmentOption & { durationMinutes: number };

export type AppointmentActionResult =
  | { success: true; appointmentId?: string }
  | { success: false; message: string };

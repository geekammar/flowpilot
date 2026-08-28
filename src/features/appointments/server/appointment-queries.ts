import type {
  AppointmentAgendaItem,
  AppointmentDetailData,
  AppointmentOption,
  ServiceOption,
} from "@/features/appointments/types";
import {
  appointmentRepository,
  conversationRepository,
  customerRepository,
  serviceRepository,
} from "@/server/repositories";

function serializeAppointment(appointment: {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: AppointmentAgendaItem["status"];
  notes: string | null;
  customer: AppointmentAgendaItem["customer"];
  service: AppointmentAgendaItem["service"];
}): AppointmentAgendaItem {
  return {
    id: appointment.id,
    date: appointment.date.toISOString().slice(0, 10),
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    status: appointment.status,
    notes: appointment.notes,
    customer: appointment.customer,
    service: appointment.service,
  };
}

export async function getAppointmentAgenda(businessId: string, date: string) {
  const appointments = await appointmentRepository.listAgenda(businessId, date);
  return appointments.map(serializeAppointment);
}

export async function getAppointmentDetail(
  businessId: string,
  appointmentId: string,
): Promise<AppointmentDetailData | null> {
  const appointment = await appointmentRepository.findWithRelationsByBusiness(
    appointmentId,
    businessId,
  );
  if (!appointment) return null;
  const conversation = await conversationRepository.findLatestByCustomer(
    businessId,
    appointment.customerId,
  );

  return {
    ...serializeAppointment(appointment),
    conversationId: conversation?.id ?? null,
  };
}

export async function getAppointmentFormOptions(businessId: string) {
  const [customers, services] = await Promise.all([
    customerRepository.listByBusiness(businessId, {
      rawPagination: { pageSize: 100 },
    }),
    serviceRepository.listByBusiness(businessId, {
      rawPagination: { pageSize: 100 },
    }),
  ]);

  const customerOptions: AppointmentOption[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
  }));
  const serviceOptions: ServiceOption[] = services.map((service) => ({
    id: service.id,
    name: service.name,
    durationMinutes: service.durationMinutes,
  }));
  return { customers: customerOptions, services: serviceOptions };
}

export function todayInTimezone(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

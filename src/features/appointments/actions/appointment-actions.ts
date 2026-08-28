"use server";

import {
  appointmentStatusActionSchema,
  createAppointmentFormSchema,
  rescheduleAppointmentSchema,
} from "@/features/appointments/schemas/appointment-schema";
import type { AppointmentActionResult } from "@/features/appointments/types";
import { requireUser } from "@/server/auth/guards";
import {
  appointmentRepository,
  customerRepository,
  serviceRepository,
  userRepository,
} from "@/server/repositories";

import { revalidatePath } from "next/cache";

function addMinutes(time: string, minutes: number) {
  const [hours = 0, currentMinutes = 0] = time.split(":").map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  if (total >= 24 * 60) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function storedDuration(startTime: Date, endTime: Date) {
  return Math.round((endTime.getTime() - startTime.getTime()) / 60_000);
}

async function currentUser() {
  const session = await requireUser();
  return userRepository.findById(session.user.id);
}

function failure(message: string): AppointmentActionResult {
  return { success: false, message };
}

function refreshAppointments(id?: string) {
  revalidatePath("/appointments");
  if (id) revalidatePath(`/appointments/${id}`);
  revalidatePath("/");
}

export async function createAppointment(
  input: unknown,
): Promise<AppointmentActionResult> {
  const parsed = createAppointmentFormSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message ?? "بيانات الموعد غير صالحة",
    );
  }
  const user = await currentUser();
  if (!user?.businessId) return failure("أكمل إعداد المنشأة أولاً");

  const [customer, service] = await Promise.all([
    customerRepository.findById(parsed.data.customerId),
    serviceRepository.findById(parsed.data.serviceId),
  ]);
  if (!customer || customer.businessId !== user.businessId) {
    return failure("العميل غير موجود");
  }
  if (!service || service.businessId !== user.businessId || !service.isActive) {
    return failure("الخدمة غير متاحة");
  }

  const endTime = addMinutes(parsed.data.startTime, service.durationMinutes);
  if (!endTime) return failure("الخدمة تتجاوز نهاية اليوم");
  try {
    const appointment = await appointmentRepository.createWithConflictCheck({
      businessId: user.businessId,
      customerId: customer.id,
      serviceId: service.id,
      assignedUserId: user.id,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime,
      notes: parsed.data.notes || undefined,
    });
    if (!appointment) return failure("يوجد موعد آخر متداخل في هذا الوقت");
    refreshAppointments(appointment.id);
    return { success: true, appointmentId: appointment.id };
  } catch {
    return failure("تعذر إنشاء الموعد الآن");
  }
}

export async function updateAppointmentStatus(
  input: unknown,
): Promise<AppointmentActionResult> {
  const parsed = appointmentStatusActionSchema.safeParse(input);
  if (!parsed.success) return failure("الإجراء غير صالح");
  const user = await currentUser();
  if (!user?.businessId) return failure("لا يمكن الوصول إلى الموعد");
  const appointment = await appointmentRepository.findById(parsed.data.id);
  if (!appointment || appointment.businessId !== user.businessId) {
    return failure("الموعد غير موجود");
  }

  const allowedTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED", "COMPLETED", "NO_SHOW"],
    CANCELLED: [],
    COMPLETED: [],
    NO_SHOW: [],
  } as const;
  if (
    !(allowedTransitions[appointment.status] as readonly string[]).includes(
      parsed.data.status,
    )
  ) {
    return failure("لا يمكن تطبيق هذا الإجراء على حالة الموعد الحالية");
  }

  try {
    await appointmentRepository.setStatus(appointment.id, parsed.data.status);
    refreshAppointments(appointment.id);
    return { success: true };
  } catch {
    return failure("تعذر تحديث حالة الموعد");
  }
}

export async function rescheduleAppointment(
  input: unknown,
): Promise<AppointmentActionResult> {
  const parsed = rescheduleAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.issues[0]?.message ?? "بيانات الموعد غير صالحة",
    );
  }
  const user = await currentUser();
  if (!user?.businessId) return failure("لا يمكن الوصول إلى الموعد");
  const appointment = await appointmentRepository.findById(parsed.data.id);
  if (!appointment || appointment.businessId !== user.businessId) {
    return failure("الموعد غير موجود");
  }
  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    return failure("لا يمكن إعادة جدولة موعد منتهٍ");
  }

  const duration = storedDuration(appointment.startTime, appointment.endTime);
  const endTime = addMinutes(parsed.data.startTime, duration);
  if (!endTime) return failure("الموعد يتجاوز نهاية اليوم");
  try {
    const updated = await appointmentRepository.rescheduleWithConflictCheck(
      appointment.id,
      {
        date: parsed.data.date,
        startTime: parsed.data.startTime,
        endTime,
      },
    );
    if (!updated) return failure("يوجد موعد آخر متداخل في هذا الوقت");
    refreshAppointments(appointment.id);
    return { success: true };
  } catch {
    return failure("تعذر إعادة جدولة الموعد");
  }
}

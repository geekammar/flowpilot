import { timeSchema } from "@/lib/validation";

import { z } from "zod";

/**
 * Smart Create Appointment flow inputs (PROMPT-11).
 *
 * The search input carries ONLY the free-text query — Zod strips every
 * other key, so a hostile `businessId`/`role`/identity override can
 * never reach the workflow (the Business is always the actor's own,
 * derived server-side).
 */
export const bookingCustomerSearchSchema = z.object({
  query: z.string().trim().max(100, "نص البحث طويل جداً"),
});

/**
 * Interim booking-details form (time + note). The selections collected
 * by steps 1–3 (customerId/serviceId/date) are validated by the
 * existing `createAppointment` action on submit — this schema only
 * covers the two fields this screen owns.
 */
export const bookingDetailsFormSchema = z.object({
  startTime: timeSchema,
  notes: z.string().trim().max(2000, "الملاحظة طويلة جداً"),
});

export type BookingCustomerSearchInput = z.infer<
  typeof bookingCustomerSearchSchema
>;
export type BookingDetailsFormInput = z.infer<typeof bookingDetailsFormSchema>;

import { z } from "zod";

/**
 * Smart Create Appointment flow inputs (PROMPT-11 + PROMPT-12).
 *
 * The search input carries ONLY the free-text query — Zod strips every
 * other key, so a hostile `businessId`/`role`/identity override can
 * never reach the workflow (the Business is always the actor's own,
 * derived server-side). Step 4 (slot selection) consumes the existing
 * `getAvailabilityInputSchema` (`{date, serviceId}` only) — it has no
 * separate schema here.
 */
export const bookingCustomerSearchSchema = z.object({
  query: z.string().trim().max(100, "نص البحث طويل جداً"),
});

export type BookingCustomerSearchInput = z.infer<
  typeof bookingCustomerSearchSchema
>;

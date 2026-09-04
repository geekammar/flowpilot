import { appointmentDateSchema, uuidSchema } from "@/lib/validation";

import { z } from "zod";

/**
 * Availability request (PROMPT-10): the Business is NEVER part of the
 * client input — it is always the authenticated actor's own Business,
 * derived server-side (services/settings pattern). Zod strips every
 * other key, so a hostile `businessId` override never reaches the
 * workflow.
 */
export const getAvailabilityInputSchema = z.object({
  date: appointmentDateSchema,
  serviceId: uuidSchema,
});

export type GetAvailabilityInput = z.infer<typeof getAvailabilityInputSchema>;

/** "HH:mm" — shared wall-clock time format (kept for local typing). */
export type WallClock = string;

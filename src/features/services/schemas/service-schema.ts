import { serviceValidation, uuidSchema } from "@/lib/validation";

import { z } from "zod";

/**
 * Form-level input for create/edit — the businessId is NEVER accepted
 * from the client; the server derives it from the authenticated
 * session's business membership. Field constraints (Arabic messages,
 * name 2–120, optional description ≤ 2000, duration 5–480 minutes)
 * come from the shared service validation contract; duration is
 * re-declared only to give empty number inputs an Arabic message.
 */
export const serviceFormSchema = serviceValidation.create
  .omit({ businessId: true })
  .extend({
    durationMinutes: z
      .number({ error: "أدخل مدة الخدمة بالدقائق" })
      .int("المدة يجب أن تكون بالدقائق الكاملة")
      .min(5, "أقل مدة هي 5 دقائق")
      .max(480, "أقصى مدة هي 8 ساعات"),
  });

export const updateServiceSchema = z.object({
  id: uuidSchema,
  service: serviceFormSchema,
});

export const setServiceActiveSchema = z.object({
  id: uuidSchema,
  isActive: z.boolean(),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

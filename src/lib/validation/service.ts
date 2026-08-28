import { uuidSchema } from "./common";
import { z } from "zod";

const createServiceSchema = z.object({
  businessId: uuidSchema,
  name: z.string().trim().min(2, "الاسم قصير جداً").max(120),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "أقل مدة هي 5 دقائق")
    .max(480, "أقصى مدة هي 8 ساعات"),
});

const updateServiceSchema = createServiceSchema
  .omit({ businessId: true })
  .partial();

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;

export const serviceValidation = {
  create: createServiceSchema,
  update: updateServiceSchema,
  listByBusiness: z.object({ businessId: uuidSchema }),
  setActive: z.object({ id: uuidSchema, isActive: z.boolean() }),
} as const;

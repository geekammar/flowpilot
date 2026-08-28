import { emailSchema, phoneSchema, uuidSchema } from "./common";
import { z } from "zod";

const createCustomerSchema = z.object({
  businessId: uuidSchema,
  name: z.string().trim().min(2, "الاسم قصير جداً").max(120),
  phone: phoneSchema,
  email: emailSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
});

const updateCustomerSchema = createCustomerSchema
  .omit({ businessId: true })
  .partial();

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;

export const customerValidation = {
  create: createCustomerSchema,
  update: updateCustomerSchema,
  listByBusiness: z.object({ businessId: uuidSchema }),
  /** Look up a WhatsApp contact within a business. */
  findByPhone: z.object({ businessId: uuidSchema, phone: phoneSchema }),
} as const;

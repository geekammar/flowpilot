import { phoneSchema, uuidSchema, workingHoursSchema } from "./common";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().trim().min(2, "السؤال قصير جداً").max(500),
  answer: z.string().trim().min(2, "الإجابة قصيرة جداً").max(2000),
});

const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(120),
  city: z.string().trim().min(1).max(80).optional(),
  whatsappNumber: phoneSchema,
  timezone: z.string().trim().min(1).max(64).default("Asia/Riyadh"),
  about: z.string().trim().max(2000).optional(),
  workingHours: workingHoursSchema.optional(),
  slotDurationMinutes: z.number().int().min(5).max(480).optional(),
  faqs: z.array(faqSchema).max(50).optional(),
  cancellationPolicy: z.string().trim().max(2000).optional(),
});

const updateBusinessSchema = createBusinessSchema.partial();

export type CreateBusinessDto = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessDto = z.infer<typeof updateBusinessSchema>;
export type FaqDto = z.infer<typeof faqSchema>;

export const businessValidation = {
  create: createBusinessSchema,
  update: updateBusinessSchema,
  findById: z.object({ id: uuidSchema }),
} as const;

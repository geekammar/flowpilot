import { phoneSchema, uuidSchema, workingHoursSchema } from "./common";
import { z } from "zod";

/**
 * Vertical keys are discovery METADATA (operator PROMPT-07 / Local Vertical
 * Discovery strategy) — never permission for vertical-specific UI. Keys are
 * stable machine identifiers; Arabic labels are for display only. Extending
 * the list is a validation-layer change only (no migration, no Prisma enum).
 */
export const VERTICAL_VALUES = [
  "dental",
  "beauty",
  "coaching",
  "gym",
  "education",
  "home_services",
  "other",
] as const;

export type VerticalValue = (typeof VERTICAL_VALUES)[number];

export const VERTICAL_LABELS: Record<VerticalValue, string> = {
  dental: "عيادة أسنان",
  beauty: "صالون / مركز تجميل",
  coaching: "مدرب (رياضة / تعليم / حياة)",
  gym: "نادي رياضي",
  education: "مركز تعليمي",
  home_services: "خدمات منزلية",
  other: "أخرى",
};

export const VERTICALS: ReadonlyArray<{
  value: VerticalValue;
  label: string;
}> = VERTICAL_VALUES.map((value) => ({ value, label: VERTICAL_LABELS[value] }));

export const verticalSchema = z.enum(VERTICAL_VALUES, "اختر نوع المنشأة");

const faqSchema = z.object({
  question: z.string().trim().min(2, "السؤال قصير جداً").max(500),
  answer: z.string().trim().min(2, "الإجابة قصيرة جداً").max(2000),
});

const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(120),
  vertical: verticalSchema.optional(),
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

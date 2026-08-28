import { phoneSchema, timeSchema, workingHoursSchema } from "@/lib/validation";

import { z } from "zod";

export const DAYS = [
  { key: "sat", label: "السبت" },
  { key: "sun", label: "الأحد" },
  { key: "mon", label: "الاثنين" },
  { key: "tue", label: "الثلاثاء" },
  { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
] as const;

export const businessSetupSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم المنشأة").max(120),
  city: z.string().trim().min(2, "اكتب المدينة").max(80),
  whatsappNumber: phoneSchema,
  timezone: z.string().min(1, "اختر المنطقة الزمنية"),
});

export const serviceFormSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم الخدمة").max(120),
  durationMinutes: z.coerce
    .number<number>()
    .int("اختر مدة صحيحة")
    .min(5, "أقل مدة هي 5 دقائق")
    .max(480, "أقصى مدة هي 8 ساعات"),
});

export const availabilitySchema = z
  .object({
    workingHours: workingHoursSchema,
    slotDurationMinutes: z.coerce
      .number<number>()
      .int()
      .min(5, "أقل مدة هي 5 دقائق")
      .max(480, "أقصى مدة هي 8 ساعات"),
  })
  .superRefine((data, context) => {
    const openDays = Object.entries(data.workingHours).filter(
      ([, hours]) => !hours.closed,
    );

    if (openDays.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["workingHours"],
        message: "اختر يوم عمل واحداً على الأقل",
      });
    }

    for (const [day, hours] of openDays) {
      if (!timeSchema.safeParse(hours.open).success) continue;
      if (!timeSchema.safeParse(hours.close).success) continue;
      if (hours.open >= hours.close) {
        context.addIssue({
          code: "custom",
          path: ["workingHours", day, "close"],
          message: "وقت الانتهاء يجب أن يكون بعد وقت البدء",
        });
      }
    }
  });

export const faqSchema = z.object({
  question: z.string().trim().min(2, "اكتب السؤال").max(500),
  answer: z.string().trim().min(2, "اكتب الإجابة").max(2000),
});

export const knowledgeSchema = z.object({
  about: z
    .string()
    .trim()
    .min(10, "اكتب نبذة قصيرة من 10 أحرف على الأقل")
    .max(2000),
  faqs: z.array(faqSchema).max(50),
  cancellationPolicy: z
    .string()
    .trim()
    .min(5, "اكتب سياسة إلغاء مختصرة")
    .max(2000),
});

export type BusinessSetupInput = z.infer<typeof businessSetupSchema>;
export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type KnowledgeInput = z.infer<typeof knowledgeSchema>;

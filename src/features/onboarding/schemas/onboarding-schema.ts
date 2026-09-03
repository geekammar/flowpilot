import {
  phoneSchema,
  timeSchema,
  verticalSchema,
  workingHoursSchema,
} from "@/lib/validation";

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

export const TIMEZONES = [
  { value: "Africa/Cairo", label: "القاهرة (توقيت مصر)" },
  { value: "Asia/Riyadh", label: "الرياض" },
  { value: "Asia/Dubai", label: "دبي" },
] as const;

/** Step 1 — بيانات المنشأة (about is optional; null from the DB is allowed). */
export const businessSetupSchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم المنشأة").max(120),
  vertical: verticalSchema,
  city: z.string().trim().min(2, "اكتب المدينة").max(80),
  whatsappNumber: phoneSchema,
  timezone: z.string().min(1, "اختر المنطقة الزمنية"),
  about: z.string().trim().max(2000).nullish(),
});

/** Step 2 — ساعات العمل (single open/close period per day, per data model). */
export const workingHoursStepSchema = z
  .object({ workingHours: workingHoursSchema })
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

/** Step 3 — إعدادات الحجز الأساسية. */
export const bookingBasicsSchema = z.object({
  slotDurationMinutes: z.coerce
    .number<number>()
    .int()
    .min(5, "أقل مدة هي 5 دقائق")
    .max(480, "أقصى مدة هي 8 ساعات"),
  cancellationPolicy: z
    .string()
    .trim()
    .min(5, "اكتب سياسة إلغاء مختصرة")
    .max(2000),
});

export type BusinessSetupInput = z.infer<typeof businessSetupSchema>;
export type WorkingHoursStepInput = z.infer<typeof workingHoursStepSchema>;
export type BookingBasicsInput = z.infer<typeof bookingBasicsSchema>;

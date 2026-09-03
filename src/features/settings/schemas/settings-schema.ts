import {
  CONFIRMATION_MODE_VALUES,
  TIMEZONES,
  phoneSchema,
  verticalSchema,
} from "@/lib/validation";

import { z } from "zod";

const TIMEZONE_VALUES = TIMEZONES.map((tz) => tz.value) as [
  (typeof TIMEZONES)[number]["value"],
  ...Array<(typeof TIMEZONES)[number]["value"]>,
];

/**
 * Business Settings form input (operator PROMPT-09). The client NEVER
 * sends a `businessId`, role, or account-state field — the Business is
 * always derived server-side from the authenticated actor. Zod strips
 * every unknown key, so hostile extra fields cannot become trusted
 * input.
 */
export const businessSettingsSchema = z.object({
  name: z
    .string({ error: "اكتب اسم المنشأة" })
    .trim()
    .min(2, "اكتب اسم المنشأة")
    .max(120),
  vertical: verticalSchema,
  city: z
    .string({ error: "اكتب المدينة" })
    .trim()
    .min(2, "اكتب المدينة")
    .max(80),
  whatsappNumber: phoneSchema,
  timezone: z.enum(TIMEZONE_VALUES, "اختر المنطقة الزمنية"),
  // Booking behavior — إعدادات الحجز
  confirmationMode: z.enum(CONFIRMATION_MODE_VALUES, "اختر طريقة تأكيد الحجز"),
  cancellationPolicy: z
    .string({ error: "اكتب سياسة إلغاء مختصرة" })
    .trim()
    .min(5, "اكتب سياسة إلغاء مختصرة")
    .max(2000, "سياسة الإلغاء طويلة جداً"),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

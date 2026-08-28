import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور قصيرة جداً"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

import { emailSchema, uuidSchema } from "./common";
import { z } from "zod";

export const userRoleValues = ["ADMIN", "STAFF"] as const;

const createUserSchema = z.object({
  businessId: uuidSchema,
  name: z.string().trim().min(2, "الاسم قصير جداً").max(120),
  email: emailSchema,
  role: z.enum(userRoleValues).default("STAFF"),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    role: z.enum(userRoleValues),
    isActive: z.boolean(),
  })
  .partial();

const listUsersSchema = z.object({
  businessId: uuidSchema,
  role: z.enum(userRoleValues).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type ListUsersDto = z.infer<typeof listUsersSchema>;

/**
 * Note: user creation (credentials) is owned by Better Auth.
 * These schemas govern FlowPilot domain data on the shared `users` table.
 */
export const userValidation = {
  create: createUserSchema,
  update: updateUserSchema,
  listByBusiness: listUsersSchema,
} as const;

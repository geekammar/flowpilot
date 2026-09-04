import { uuidSchema } from "@/lib/validation";

import { z } from "zod";

/**
 * Team management input schemas (PROMPT-16). The client may supply
 * ONLY the target member id and the desired active state — the
 * Business comes from the authenticated actor (server-side), never
 * from client input.
 */

export const setTeamMemberActiveSchema = z.object({
  memberId: uuidSchema,
  isActive: z.boolean(),
});

export type SetTeamMemberActiveInput = z.infer<
  typeof setTeamMemberActiveSchema
>;

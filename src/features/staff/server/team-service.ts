/**
 * Team management workflow (PROMPT-16).
 *
 * The service layer enforces the authorization rules the route layer
 * relies on: only Business ADMIN users manage the team, every read and
 * write is scoped to the actor's own Business, and only STAFF members
 * may be deactivated/reactivated (an ADMIN can never lock themselves
 * or another ADMIN out — DECISIONS #02 two-role model, no membership
 * state machine). The repository collaborators are injectable
 * (established invitations/services/customers pattern) so the
 * workflow logic can be verified without a live database.
 */

import { setTeamMemberActiveSchema } from "@/features/staff/schemas/team-schema";
import type {
  SetTeamMemberActiveResult,
  TeamListResult,
  TeamMemberItem,
} from "@/features/staff/types";
import type { UserRepository } from "@/server/repositories";
import { userRepository } from "@/server/repositories";
import type { UserRole } from "@/types/domain";

/** Authorization context derived from the authenticated session. */
export type TeamActor = {
  userId: string;
  role: UserRole;
  businessId: string | null;
};

export type TeamServiceDeps = {
  users: Pick<UserRepository, "listByBusiness" | "findById" | "setActive">;
};

/** Production dependencies (app singletons). */
export const defaultTeamServiceDeps: TeamServiceDeps = {
  users: userRepository,
};

const FORBIDDEN_MESSAGE = "إدارة الفريق متاحة للمدير فقط";
const NO_BUSINESS_MESSAGE = "أكمل إعداد المنشأة أولاً";
const NOT_FOUND_MESSAGE = "العضو غير موجود";
const ADMIN_TARGET_MESSAGE = "يمكن تعطيل حسابات الموظفين وتنشيطها فقط";
const UPDATE_FAILED_MESSAGE = "تعذر تحديث حالة العضو الآن";
const LIST_FAILED_MESSAGE = "تعذر تحميل الفريق الآن";

/** Team size cap for one directory read (pilot scale — same as services). */
const TEAM_PAGE_SIZE = 100;

function toMemberItem(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}): TeamMemberItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

/** Resolve the actor's management scope or a typed failure. */
function resolveScope(
  actor: TeamActor,
): { ok: true; businessId: string } | { ok: false; message: string } {
  if (actor.role !== "ADMIN") return { ok: false, message: FORBIDDEN_MESSAGE };
  if (!actor.businessId) return { ok: false, message: NO_BUSINESS_MESSAGE };
  return { ok: true, businessId: actor.businessId };
}

/** List the members of the actor's Business — ADMIN-only read. */
export async function listTeam(
  deps: TeamServiceDeps,
  actor: TeamActor,
): Promise<TeamListResult> {
  const scope = resolveScope(actor);
  if (!scope.ok) return { success: false, message: scope.message };

  try {
    const users = await deps.users.listByBusiness(
      { businessId: scope.businessId },
      { pageSize: TEAM_PAGE_SIZE },
    );
    return { success: true, members: users.map(toMemberItem) };
  } catch {
    return { success: false, message: LIST_FAILED_MESSAGE };
  }
}

/**
 * Deactivate/reactivate a STAFF member of the actor's Business.
 * Server-side guarantees:
 * - Only ADMIN may change member states (STAFF actors get a typed
 *   failure — UI hiding is not the authorization mechanism).
 * - The target must belong to the actor's own Business (a cross-tenant
 *   id fails safely as not-found).
 * - The target must be STAFF — ADMIN members (including the actor
 *   themselves) can never be deactivated through this path, so no
 *   ADMIN can accidentally lock the Business out.
 */
export async function setTeamMemberActive(
  deps: TeamServiceDeps,
  actor: TeamActor,
  input: unknown,
): Promise<SetTeamMemberActiveResult> {
  const scope = resolveScope(actor);
  if (!scope.ok) {
    return {
      success: false,
      code: actor.role !== "ADMIN" ? "FORBIDDEN" : "NO_BUSINESS",
      message: scope.message,
    };
  }

  const parsed = setTeamMemberActiveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION",
      message: parsed.error.issues[0]?.message ?? "الإجراء غير صالح",
    };
  }

  const target = await deps.users.findById(parsed.data.memberId);
  // Not found OR another Business's member: one safe not-found answer.
  if (!target || target.businessId !== scope.businessId) {
    return { success: false, code: "NOT_FOUND", message: NOT_FOUND_MESSAGE };
  }
  if (target.role !== "STAFF") {
    return {
      success: false,
      code: "ADMIN_TARGET",
      message: ADMIN_TARGET_MESSAGE,
    };
  }

  try {
    const updated = await deps.users.setActive(
      parsed.data.memberId,
      parsed.data.isActive,
    );
    return { success: true, member: toMemberItem(updated) };
  } catch {
    return {
      success: false,
      code: "UPDATE_FAILED",
      message: UPDATE_FAILED_MESSAGE,
    };
  }
}

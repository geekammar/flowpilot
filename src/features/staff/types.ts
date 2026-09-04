import type { UserRole } from "@/types/domain";

import type { ComponentType } from "react";

/**
 * Team management types (PROMPT-16). Feature-specific by convention —
 * the team directory composes the invitations feature's create dialog
 * at the route layer through the structural `StaffInviteDialogComponent`
 * contract below (no cross-feature imports).
 */

/** Serializable team-member row for the team directory. */
export type TeamMemberItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

/**
 * Invitation lifecycle states the team directory displays: waiting for
 * the invitee (PENDING) or accepted-but-not-yet-activated (ACCEPTED —
 * the resume path of an interrupted activation). Terminal states
 * (revoked/expired/activated) are not shown: activated invitees appear
 * as team members; dead invitations are inert.
 */
export type TeamInvitationStatus = "PENDING" | "ACCEPTED";

/** Serializable open-invitation row for the team directory. */
export type TeamInvitationItem = {
  id: string;
  email: string;
  role: UserRole;
  status: TeamInvitationStatus;
  createdAt: string;
  expiresAt: string;
};

export type TeamListResult =
  | { success: true; members: TeamMemberItem[] }
  | { success: false; message: string };

/** Typed failure codes for team-member activation changes. */
export type SetTeamMemberActiveErrorCode =
  | "FORBIDDEN"
  | "NO_BUSINESS"
  | "VALIDATION"
  | "NOT_FOUND"
  | "ADMIN_TARGET"
  | "UPDATE_FAILED";

export type SetTeamMemberActiveResult =
  | { success: true; member: TeamMemberItem }
  | { success: false; code: SetTeamMemberActiveErrorCode; message: string };

/**
 * Structural contract for the route-composed invite dialog (the
 * invitations feature's `StaffInviteDialog` satisfies it — composition
 * happens at the route layer, preserving feature isolation; same
 * pattern as the Smart Create create-customer dialog).
 */
export type StaffInviteDialogComponent = ComponentType<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (invitation: TeamInvitationItem) => void;
}>;

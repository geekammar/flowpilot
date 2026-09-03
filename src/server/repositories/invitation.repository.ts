import type { Invitation } from "@/generated/prisma/client";

import type { CreateInvitationDto } from "@/lib/validation";
import { paginationSchema, paginationToSkipTake } from "@/lib/validation";
import { db } from "@/server/db";

/**
 * Invitation — FlowPilot domain concept (DECISIONS #22), separate from
 * Better Auth. Data primitives only: token generation/delivery belongs
 * to the workflow layer. Acceptance is the guarded conditional-update
 * primitive `acceptPendingInvitation`; activation (PROMPT-05) is the
 * atomic `activateInvitedAdmin` (invitation mark + Business membership
 * in one transaction).
 *
 * Conventions specific to this entity:
 * - Only the token HASH is stored; the raw token never reaches the DB.
 * - Lifecycle is derived (acceptedAt/revokedAt/expiresAt/activatedAt) —
 *   there is no persisted status enum and no deletedAt, so no
 *   `deletedAt: null` filter applies here.
 * - Tenant-scoped by businessId: no global "list all" method exists.
 *   Platform-level access is handled in a later prompt.
 */

/**
 * Thrown inside the activation transaction when the user row cannot be
 * attached to the Business (already attached elsewhere, or same Business
 * with a non-ADMIN role). Rolling back also reverts the invitation's
 * activatedAt mark — the two writes stay consistent.
 */
export class InvitationActivationConflictError extends Error {
  constructor() {
    super("invitation activation membership conflict");
    this.name = "InvitationActivationConflictError";
  }
}

/**
 * Authoritative outcome of the activation primitive. The workflow layer
 * pre-checks eligibility with precise typed errors; this union covers
 * the in-transaction truth (including races).
 */
export type ActivateInvitedAdminOutcome =
  | { status: "ACTIVATED"; invitation: Invitation; userId: string }
  | { status: "ALREADY_ACTIVATED" }
  | { status: "NOT_ACCEPTED" }
  | { status: "USER_MISSING" }
  | { status: "CONFLICT" }
  | { status: "NOT_FOUND" };
export class InvitationRepository {
  async create(data: CreateInvitationDto): Promise<Invitation> {
    return db.invitation.create({ data });
  }

  /**
   * Creates an invitation unless an OPEN one already exists for the same
   * Business + email (open = not accepted, not revoked, unexpired).
   * Returns null when an open invitation exists — the creation workflow
   * maps that to its conflict error. Transaction-scoped check-then-create
   * (same pattern as AppointmentRepository.createWithConflictCheck).
   * Expired, revoked, and accepted invitations never block creation.
   */
  async createIfNoOpenInvitation(
    data: CreateInvitationDto,
  ): Promise<Invitation | null> {
    return db.$transaction(async (tx) => {
      const open = await tx.invitation.findFirst({
        where: {
          businessId: data.businessId,
          email: data.email,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (open) return null;
      return tx.invitation.create({ data });
    });
  }

  /** Single-record token-hash lookup for the future acceptance flow. */
  async findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    return db.invitation.findUnique({ where: { tokenHash } });
  }

  async findByIdWithinBusiness(
    id: string,
    businessId: string,
  ): Promise<Invitation | null> {
    return db.invitation.findFirst({ where: { id, businessId } });
  }

  async listByBusiness(
    businessId: string,
    rawPagination?: unknown,
  ): Promise<Invitation[]> {
    const pagination = paginationSchema.parse(rawPagination ?? {});
    return db.invitation.findMany({
      where: { businessId },
      orderBy: [{ createdAt: "desc" }],
      ...paginationToSkipTake(pagination),
    });
  }

  /**
   * Revokes a still-pending invitation (acceptedAt/revokedAt null).
   * Returns null when not found, out of the business, or no longer
   * pending. Expiry is irrelevant to revocation.
   */
  async revoke(id: string, businessId: string): Promise<Invitation | null> {
    return db.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id, businessId, acceptedAt: null, revokedAt: null },
      });
      if (!invitation) return null;
      return tx.invitation.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
    });
  }

  /**
   * Marks a still-pending invitation accepted (acceptedAt/revokedAt
   * null). Returns null when not found, out of the business, or no
   * longer pending. Expiry validation belongs to the acceptance
   * workflow (later prompt), which resolves the invitation via
   * findByTokenHash first.
   */
  async markAccepted(
    id: string,
    businessId: string,
  ): Promise<Invitation | null> {
    return db.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: { id, businessId, acceptedAt: null, revokedAt: null },
      });
      if (!invitation) return null;
      return tx.invitation.update({
        where: { id },
        data: { acceptedAt: new Date() },
      });
    });
  }

  /**
   * Atomically transitions a token-hash-located invitation from PENDING
   * to ACCEPTED. The conditional UPDATE itself carries the full guard
   * (pending + unrevoked + unexpired), so a concurrent acceptance,
   * revocation, or expiry between the workflow's pre-check and this
   * call updates zero rows and safely returns null. The transaction
   * then re-reads the row so the caller gets the persisted accepted
   * record. Expiry is enforced here too because the database-level
   * conditional update is the last line of defense.
   */
  async acceptPendingInvitation(tokenHash: string): Promise<Invitation | null> {
    return db.$transaction(async (tx) => {
      const result = await tx.invitation.updateMany({
        where: {
          tokenHash,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { acceptedAt: new Date() },
      });
      if (result.count === 0) return null;
      return tx.invitation.findUnique({ where: { tokenHash } });
    });
  }

  /**
   * Atomically completes ADMIN account activation for an accepted,
   * unactivated invitation (PROMPT-05):
   *
   * 1. Validation reads inside the transaction (invitation still
   *    accepted + unactivated; user row exists and is attachable —
   *    businessId null, or already ADMIN of the SAME Business).
   * 2. One-time guard: a conditional UPDATE sets `activatedAt` only
   *    while it is null (and the invitation is accepted + unrevoked).
   *    Two concurrent activations serialize here; the loser reads
   *    ALREADY_ACTIVATED — activation can never succeed twice.
   * 3. Conditional membership attach: the user row is updated only
   *    when `businessId IS NULL` (never-assigned identity — the
   *    interrupted-activation recovery path) or `businessId` already
   *    equals the invitation's Business with role ADMIN (idempotent
   *    re-affirm). STAFF members of the same Business and users of
   *    other Businesses match neither branch → the throw rolls the
   *    transaction back, including the activatedAt mark.
   *
   * The user's password is never touched here — credentials belong to
   * Better Auth; this primitive only persists FlowPilot domain state.
   */
  async activateInvitedAdmin(input: {
    invitationId: string;
    userId: string;
    businessId: string;
  }): Promise<ActivateInvitedAdminOutcome> {
    return db.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({
        where: { id: input.invitationId },
      });
      if (!invitation) return { status: "NOT_FOUND" } as const;
      if (invitation.activatedAt) {
        return { status: "ALREADY_ACTIVATED" } as const;
      }
      if (!invitation.acceptedAt || invitation.revokedAt) {
        return { status: "NOT_ACCEPTED" } as const;
      }

      const user = await tx.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) return { status: "USER_MISSING" } as const;
      const attachable =
        user.businessId === null ||
        (user.businessId === input.businessId && user.role === "ADMIN");
      if (!attachable) return { status: "CONFLICT" } as const;

      const guard = await tx.invitation.updateMany({
        where: {
          id: input.invitationId,
          acceptedAt: { not: null },
          revokedAt: null,
          activatedAt: null,
        },
        data: { activatedAt: new Date() },
      });
      if (guard.count === 0) {
        return { status: "ALREADY_ACTIVATED" } as const;
      }

      const attached = await tx.user.updateMany({
        where: {
          id: input.userId,
          OR: [
            { businessId: null },
            { businessId: input.businessId, role: "ADMIN" },
          ],
        },
        data: {
          businessId: input.businessId,
          role: "ADMIN",
          isActive: true,
        },
      });
      if (attached.count === 0) {
        // Attach raced with a conflicting membership change — undo the
        // activatedAt mark and report the conflict.
        throw new InvitationActivationConflictError();
      }

      const activated = await tx.invitation.findUnique({
        where: { id: input.invitationId },
      });
      if (!activated) return { status: "NOT_FOUND" } as const;
      return {
        status: "ACTIVATED" as const,
        invitation: activated,
        userId: input.userId,
      };
    });
  }
}

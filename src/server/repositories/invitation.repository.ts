import type { Invitation } from "@/generated/prisma/client";

import type { CreateInvitationDto } from "@/lib/validation";
import { paginationSchema, paginationToSkipTake } from "@/lib/validation";
import { db } from "@/server/db";

/**
 * Invitation — FlowPilot domain concept (DECISIONS #22), separate from
 * Better Auth. Data primitives only: token generation/delivery, account
 * activation, and password setup are later prompts. Acceptance is the
 * guarded conditional-update primitive `acceptPendingInvitation`.
 *
 * Conventions specific to this entity:
 * - Only the token HASH is stored; the raw token never reaches the DB.
 * - Lifecycle is derived (acceptedAt/revokedAt/expiresAt) — there is no
 *   persisted status enum and no deletedAt, so no `deletedAt: null`
 *   filter applies here.
 * - Tenant-scoped by businessId: no global "list all" method exists.
 *   Platform-level access is handled in a later prompt.
 */
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
}

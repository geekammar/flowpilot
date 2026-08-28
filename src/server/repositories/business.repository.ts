import type { Business } from "@/generated/prisma/client";

import type { CreateBusinessDto, UpdateBusinessDto } from "@/lib/validation";
import { db } from "@/server/db";

/** Soft-deleted rows are excluded from all reads by default. */
const notDeleted = { deletedAt: null } as const;

export class BusinessRepository {
  async findById(id: string): Promise<Business | null> {
    return db.business.findFirst({ where: { id, ...notDeleted } });
  }

  async findByWhatsappNumber(number: string): Promise<Business | null> {
    return db.business.findFirst({
      where: { whatsappNumber: number, ...notDeleted },
    });
  }

  async create(data: CreateBusinessDto): Promise<Business> {
    return db.business.create({ data });
  }

  async createForUser(
    userId: string,
    data: CreateBusinessDto,
  ): Promise<Business> {
    return db.$transaction(async (tx) => {
      const business = await tx.business.create({ data });
      const assignment = await tx.user.updateMany({
        where: { id: userId, businessId: null },
        data: { businessId: business.id, role: "ADMIN" },
      });

      if (assignment.count !== 1) {
        throw new Error("USER_ALREADY_ASSIGNED");
      }

      return business;
    });
  }

  async update(id: string, data: UpdateBusinessDto): Promise<Business> {
    return db.business.update({ where: { id }, data });
  }

  /** Deactivates first (fail-safe), then flags as deleted. */
  async softDelete(id: string): Promise<Business> {
    const now = new Date();
    return db.business.update({
      where: { id },
      data: { isActive: false, deletedAt: now },
    });
  }

  async restore(id: string): Promise<Business> {
    return db.business.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  async completeOnboarding(id: string): Promise<Business> {
    return db.business.update({
      where: { id },
      data: { onboardingCompletedAt: new Date() },
    });
  }
}

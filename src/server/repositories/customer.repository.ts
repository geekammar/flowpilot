import type { Customer } from "@/generated/prisma/client";

import type { CreateCustomerDto, UpdateCustomerDto } from "@/lib/validation";
import { paginationSchema, paginationToSkipTake } from "@/lib/validation";
import { db } from "@/server/db";

const notDeleted = { deletedAt: null } as const;

export class CustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    return db.customer.findFirst({ where: { id, ...notDeleted } });
  }

  async findByPhone(
    businessId: string,
    phone: string,
  ): Promise<Customer | null> {
    return db.customer.findFirst({
      where: { businessId, phone, ...notDeleted },
    });
  }

  async listByBusiness(
    businessId: string,
    options?: { search?: string; rawPagination?: unknown },
  ): Promise<Customer[]> {
    const pagination = paginationSchema.parse(options?.rawPagination ?? {});
    return db.customer.findMany({
      where: {
        businessId,
        ...notDeleted,
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search, mode: "insensitive" } },
                { phone: { contains: options.search } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      ...paginationToSkipTake(pagination),
    });
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    return db.customer.create({ data });
  }

  /** Idempotent entry point for inbound WhatsApp contacts. */
  async upsertByPhone(
    businessId: string,
    data: Omit<CreateCustomerDto, "businessId">,
  ): Promise<Customer> {
    return db.customer.upsert({
      where: { businessId_phone: { businessId, phone: data.phone } },
      create: { ...data, businessId },
      update: {},
    });
  }

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    return db.customer.update({ where: { id }, data });
  }

  async touchConversation(id: string): Promise<Customer> {
    return db.customer.update({
      where: { id },
      data: { lastConversationAt: new Date() },
    });
  }

  async touchAppointment(id: string): Promise<Customer> {
    return db.customer.update({
      where: { id },
      data: { lastAppointmentAt: new Date() },
    });
  }

  async softDelete(id: string): Promise<Customer> {
    return db.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Customer> {
    return db.customer.update({ where: { id }, data: { deletedAt: null } });
  }
}

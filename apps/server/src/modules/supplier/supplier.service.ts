import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type { CreateSupplierInput } from "@flowstation/schemas";
import { SupplierMessages } from "./supplier.messages";

export class SupplierService {
  async getSuppliers(organisationId: string) {
    return prisma.supplier.findMany({
      where: { organisationId, isActive: true },
    });
  }

  async createSupplier(organisationId: string, input: CreateSupplierInput) {
    return prisma.supplier.create({
      data: {
        companyName: input.companyName,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        address: input.address,
        organisationId,
      },
    });
  }

  async deleteSupplier(organisationId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findFirst({
        where: { id, organisationId, isActive: true },
        select: { id: true },
      });
      if (!supplier) {
        throw new NotFoundException(SupplierMessages.NOT_FOUND);
      }

      const stockCount = await tx.fuelStock.count({
        where: { organisationId, supplierId: supplier.id },
      });

      if (stockCount > 0) {
        await tx.supplier.update({
          where: { id: supplier.id },
          data: { isActive: false },
        });
        return "archived" as const;
      }

      await tx.supplier.delete({ where: { id: supplier.id } });
      return "deleted" as const;
    });
  }
}

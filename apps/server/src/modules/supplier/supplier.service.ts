import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type { CreateSupplierInput } from "@flowstation/schemas";
import { SupplierMessages } from "./supplier.messages";

export class SupplierService {
  async getSuppliers(organisationId: string) {
    return prisma.supplier.findMany({
      where: { organisationId },
      include: { fuelTypes: true },
    });
  }

  async createSupplier(organisationId: string, input: CreateSupplierInput) {
    return prisma.$transaction(async (tx) => {
      if (input.fuelProductId) {
        const fuelProduct = await tx.fuelProduct.findFirst({
          where: { id: input.fuelProductId, organisationId },
          select: { id: true },
        });
        if (!fuelProduct) {
          throw new NotFoundException(SupplierMessages.FUEL_PRODUCT_NOT_FOUND);
        }
      }

      const supplier = await tx.supplier.create({
        data: {
          companyName: input.companyName,
          contactPerson: input.contactPerson,
          email: input.email,
          phone: input.phone,
          address: input.address,
          organisationId,
        },
      });

      const fuelTypes = input.fuelProductId
        ? [
            await tx.supplierFuelType.create({
              data: {
                supplierId: supplier.id,
                fuelProductId: input.fuelProductId,
              },
            }),
          ]
        : [];

      return { ...supplier, fuelTypes };
    });
  }

  async deleteSupplier(organisationId: string, id: string) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException(SupplierMessages.NOT_FOUND);
    }

    await prisma.$transaction([
      prisma.supplierFuelType.deleteMany({
        where: { supplierId: supplier.id },
      }),
      prisma.supplier.delete({ where: { id: supplier.id } }),
    ]);
  }
}

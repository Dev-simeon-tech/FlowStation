import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type { CreateSupplierInput } from "@flowstation/schemas";
import { SupplierMessages } from "./supplier.messages";

export class SupplierService {
  async getSuppliers(organisationId: string) {
    return prisma.supplier.findMany({
      where: { organisationId },
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
    const supplier = await prisma.supplier.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });
    if (!supplier) {
      throw new NotFoundException(SupplierMessages.NOT_FOUND);
    }

    await prisma.supplier.delete({ where: { id: supplier.id } });
  }
}

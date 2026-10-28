import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type {
  CreateFuelProductInput,
  UpdateFuelProductInput,
} from "@flowstation/schemas";
import { ProductMessages } from "./product.messages";

export class ProductService {
  async getFuelProducts(organisationId: string) {
    return prisma.fuelProduct.findMany({
      where: { organisationId },
    });
  }

  async createFuelProduct(
    organisationId: string,
    input: CreateFuelProductInput,
  ) {
    return prisma.fuelProduct.create({
      data: {
        ...input,
        organisationId,
      },
    });
  }

  async updateFuelProduct(
    organisationId: string,
    id: string,
    input: UpdateFuelProductInput,
  ) {
    const existing = await prisma.fuelProduct.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(ProductMessages.NOT_FOUND);
    }

    return prisma.fuelProduct.update({
      where: { id: existing.id },
      data: input,
    });
  }

  async deleteFuelProduct(organisationId: string, id: string) {
    const existing = await prisma.fuelProduct.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(ProductMessages.NOT_FOUND);
    }

    await prisma.fuelProduct.delete({
      where: { id: existing.id },
    });
  }
}

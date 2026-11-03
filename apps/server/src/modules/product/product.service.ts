import { BadRequestException, NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type {
  CreateFuelProductInput,
  UpdateFuelProductInput,
} from "@flowstation/schemas";
import { ProductMessages } from "./product.messages";

export class ProductService {
  async getFuelProducts(organisationId: string) {
    return prisma.fuelProduct.findMany({
      where: { organisationId, isActive: true },
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
      where: { id, organisationId, isActive: true },
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
    return prisma.$transaction(async (tx) => {
      const existing = await tx.fuelProduct.findFirst({
        where: { id, organisationId, isActive: true },
        select: { id: true, name: true },
      });

      if (!existing) {
        throw new NotFoundException(ProductMessages.NOT_FOUND);
      }

      const [stock, sales, summaryCount] = await Promise.all([
        tx.fuelStock.aggregate({
          where: { organisationId, fuelProductId: existing.id },
          _sum: { quantityLitres: true },
          _count: { id: true },
        }),
        tx.fuelSale.aggregate({
          where: { organisationId, fuelProductId: existing.id },
          _sum: { litresSold: true },
          _count: { id: true },
        }),
        tx.dailySummary.count({
          where: { organisationId, fuelProductId: existing.id },
        }),
      ]);

      const remainingStock =
        (stock._sum.quantityLitres ?? 0) - (sales._sum.litresSold ?? 0);

      if (remainingStock > 0) {
        throw new BadRequestException(
          ProductMessages.STOCK_REMAINING(existing.name, remainingStock),
        );
      }

      if (stock._count.id > 0 || sales._count.id > 0 || summaryCount > 0) {
        await tx.fuelProduct.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
        return "archived" as const;
      }

      await tx.fuelProduct.delete({
        where: { id: existing.id },
      });
      return "deleted" as const;
    });
  }
}

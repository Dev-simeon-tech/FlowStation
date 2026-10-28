import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type { CreateStockEntryInput } from "@flowstation/schemas";
import { StockMessages } from "./stock.messages";

export class StockService {
  async getStockEntries(organisationId: string) {
    return prisma.fuelStock.findMany({
      where: { organisationId },
      include: { fuelProduct: true, supplier: true },
      orderBy: { deliveryDate: "desc" },
    });
  }

  async getStockEntry(organisationId: string, id: string) {
    const stock = await prisma.fuelStock.findFirst({
      where: { id, organisationId },
      include: { fuelProduct: true, supplier: true },
    });
    if (!stock) {
      throw new NotFoundException(StockMessages.NOT_FOUND);
    }
    return stock;
  }

  async createStockEntry(
    organisationId: string,
    input: CreateStockEntryInput,
  ) {
    const [fuelProduct, supplier] = await Promise.all([
      prisma.fuelProduct.findFirst({
        where: { id: input.fuelProductId, organisationId },
        select: { id: true },
      }),
      prisma.supplier.findFirst({
        where: { id: input.supplierId, organisationId },
        select: { id: true },
      }),
    ]);

    if (!fuelProduct) {
      throw new NotFoundException(StockMessages.FUEL_PRODUCT_NOT_FOUND);
    }
    if (!supplier) {
      throw new NotFoundException(StockMessages.SUPPLIER_NOT_FOUND);
    }

    return prisma.fuelStock.create({
      data: {
        ...input,
        organisationId,
        deliveryDate: input.deliveryDate
          ? new Date(input.deliveryDate)
          : new Date(),
      },
      include: { fuelProduct: true, supplier: true },
    });
  }

  async getStockBalance(organisationId: string) {
    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    return Promise.all(
      products.map(async (product) => {
        const [totalIn, totalOut] = await Promise.all([
          prisma.fuelStock.aggregate({
            where: { organisationId, fuelProductId: product.id },
            _sum: { quantityLitres: true },
          }),
          prisma.fuelSale.aggregate({
            where: { organisationId, fuelProductId: product.id },
            _sum: { litresSold: true },
          }),
        ]);
        const totalDelivered = totalIn._sum.quantityLitres ?? 0;
        const totalSold = totalOut._sum.litresSold ?? 0;

        return {
          fuelProductId: product.id,
          fuelProductName: product.name,
          fuelType: product.type,
          totalDelivered,
          totalSold,
          currentBalance: totalDelivered - totalSold,
        };
      }),
    );
  }
}

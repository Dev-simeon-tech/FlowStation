import { BadRequestException, NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type { CreateSaleInput } from "@flowstation/schemas";
import { SalesMessages } from "./sales.messages";

export class SalesService {
  async getSales(organisationId: string) {
    return prisma.fuelSale.findMany({
      where: { organisationId },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
      orderBy: { saleDate: "desc" },
    });
  }

  async getSale(organisationId: string, id: string) {
    const sale = await prisma.fuelSale.findFirst({
      where: { id, organisationId },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
    });
    if (!sale) {
      throw new NotFoundException(SalesMessages.NOT_FOUND);
    }
    return sale;
  }

  async createSale(organisationId: string, input: CreateSaleInput) {
    const saleId = await prisma.$transaction(async (tx) => {
      const fuelProduct = await tx.fuelProduct.findFirst({
        where: { id: input.fuelProductId, organisationId },
      });
      if (!fuelProduct) {
        throw new NotFoundException(SalesMessages.FUEL_PRODUCT_NOT_FOUND);
      }

      const attendant = await tx.attendant.findFirst({
        where: { id: input.attendantId, organisationId },
        select: { id: true, isActive: true },
      });
      if (!attendant) {
        throw new NotFoundException(SalesMessages.ATTENDANT_NOT_FOUND);
      }
      if (!attendant.isActive) {
        throw new BadRequestException(SalesMessages.ATTENDANT_INACTIVE);
      }

      if (input.customerId) {
        const customer = await tx.customer.findFirst({
          where: { id: input.customerId, organisationId },
          select: { id: true },
        });
        if (!customer) {
          throw new NotFoundException(SalesMessages.CUSTOMER_NOT_FOUND);
        }
      }

      const [totalIn, totalOut] = await Promise.all([
        tx.fuelStock.aggregate({
          where: { organisationId, fuelProductId: fuelProduct.id },
          _sum: { quantityLitres: true },
        }),
        tx.fuelSale.aggregate({
          where: { organisationId, fuelProductId: fuelProduct.id },
          _sum: { litresSold: true },
        }),
      ]);
      const currentBalance =
        (totalIn._sum.quantityLitres ?? 0) -
        (totalOut._sum.litresSold ?? 0);

      if (input.litresSold > currentBalance) {
        throw new BadRequestException(
          `${SalesMessages.INSUFFICIENT_STOCK}. Available: ${currentBalance}L, requested: ${input.litresSold}L`,
        );
      }

      const totalAmount = fuelProduct.pricePerLitre * input.litresSold;
      const sale = await tx.fuelSale.create({
        data: {
          organisationId,
          fuelProductId: fuelProduct.id,
          attendantId: attendant.id,
          customerId: input.customerId ?? null,
          litresSold: input.litresSold,
          unitPrice: fuelProduct.pricePerLitre,
          totalAmount,
          paymentMethod: input.paymentMethod,
        },
        select: { id: true },
      });

      if (input.isPaid) {
        await tx.payment.create({
          data: {
            organisationId,
            fuelSaleId: sale.id,
            amountPaid: totalAmount,
            method: input.paymentMethod,
          },
        });
      }

      return sale.id;
    });

    return prisma.fuelSale.findUniqueOrThrow({
      where: { id: saleId },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
    });
  }
}

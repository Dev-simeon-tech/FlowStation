import { NotFoundException } from "@/execptions";
import prisma from "@/lib/prisma";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@flowstation/schemas";
import type { FuelType } from "@flowstation/types";
import { CustomerMessages } from "./customer.messages";

export class CustomerService {
  async getCustomers(organisationId: string) {
    return prisma.customer.findMany({ where: { organisationId } });
  }

  async createCustomer(organisationId: string, input: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        ...input,
        customerType: input.customerType ?? "WALK_IN",
        organisationId,
      },
    });
  }

  async updateCustomer(
    organisationId: string,
    id: string,
    input: UpdateCustomerInput,
  ) {
    const existing = await prisma.customer.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(CustomerMessages.NOT_FOUND);
    }

    return prisma.customer.update({
      where: { id: existing.id },
      data: input,
    });
  }

  async getCustomerPurchases(organisationId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, organisationId },
    });
    if (!customer) {
      throw new NotFoundException(CustomerMessages.NOT_FOUND);
    }

    const purchases = await prisma.fuelSale.findMany({
      where: { customerId: id, organisationId },
      include: {
        fuelProduct: {
          select: { id: true, name: true, type: true, pricePerLitre: true },
        },
        attendant: {
          select: { id: true, fullName: true, employeeId: true },
        },
        payment: {
          select: {
            id: true,
            amountPaid: true,
            method: true,
            paidAt: true,
            reference: true,
          },
        },
      },
      orderBy: { saleDate: "desc" },
    });

    const spendingByFuelType = new Map<
      FuelType,
      {
        fuelProductName: string;
        fuelType: FuelType;
        totalLitres: number;
        totalSpent: number;
        numberOfPurchases: number;
      }
    >();
    for (const purchase of purchases) {
      const fuelType = purchase.fuelProduct.type;
      const summary = spendingByFuelType.get(fuelType) ?? {
        fuelProductName: purchase.fuelProduct.name,
        fuelType,
        totalLitres: 0,
        totalSpent: 0,
        numberOfPurchases: 0,
      };
      summary.totalLitres += purchase.litresSold;
      summary.totalSpent += purchase.totalAmount;
      summary.numberOfPurchases += 1;
      spendingByFuelType.set(fuelType, summary);
    }

    return {
      customer,
      summary: {
        totalPurchases: purchases.length,
        totalLitresBought: purchases.reduce(
          (sum, purchase) => sum + purchase.litresSold,
          0,
        ),
        totalSpent: purchases.reduce(
          (sum, purchase) => sum + purchase.totalAmount,
          0,
        ),
        spendingByFuelType: Array.from(spendingByFuelType.values()),
      },
      purchases,
    };
  }
}

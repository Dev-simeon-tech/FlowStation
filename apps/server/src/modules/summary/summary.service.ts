import prisma from "@/lib/prisma";

export class SummaryService {
  async getDailySummary(organisationId: string, date: string) {
    const { start, end } = this.getDayRange(date);

    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    const summary = await Promise.all(
      products.map(async (product) => {
        return {
          fuelProductId: product.id,
          fuelProductName: product.name,
          fuelType: product.type,
          ...(await this.calculateProductSummary(
            organisationId,
            product.id,
            start,
            end,
          )),
        };
      }),
    );

    // overall totals across all fuel types
    const totals = summary.reduce(
      (acc, item) => ({
        totalLitresSold: acc.totalLitresSold + item.totalLitresSold,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        numberOfSales: acc.numberOfSales + item.numberOfSales,
      }),
      { totalLitresSold: 0, totalRevenue: 0, numberOfSales: 0 },
    );

    return {
      date: start.toISOString().split("T")[0],
      perFuelType: summary,
      totals,
    };
  }

  async saveDailySummary(organisationId: string, date: string) {
    const { start, end } = this.getDayRange(date);
    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    return Promise.all(
      products.map(async (product) => {
        const productSummary = await this.calculateProductSummary(
          organisationId,
          product.id,
          start,
          end,
        );

        return prisma.dailySummary.upsert({
          where: {
            organisationId_summaryDate_fuelProductId: {
              organisationId,
              summaryDate: start,
              fuelProductId: product.id,
            },
          },
          update: {
            totalLitresSold: productSummary.totalLitresSold,
            totalRevenue: productSummary.totalRevenue,
            openingStock: productSummary.openingStock,
            closingStock: productSummary.closingStock,
          },
          create: {
            organisationId,
            fuelProductId: product.id,
            summaryDate: start,
            totalLitresSold: productSummary.totalLitresSold,
            totalRevenue: productSummary.totalRevenue,
            openingStock: productSummary.openingStock,
            closingStock: productSummary.closingStock,
          },
        });
      }),
    );
  }

  async saveDailySummariesForAllOrganisations(date: string) {
    const organisations = await prisma.organisation.findMany({
      select: { id: true },
    });
    let savedCount = 0;

    for (const organisation of organisations) {
      const summaries = await this.saveDailySummary(organisation.id, date);
      savedCount += summaries.length;
    }

    return savedCount;
  }

  private async calculateProductSummary(
    organisationId: string,
    fuelProductId: string,
    start: Date,
    end: Date,
  ) {
    const [salesAgg, stockInBefore, stockOutBefore, stockInToday] =
      await Promise.all([
        prisma.fuelSale.aggregate({
          where: {
            organisationId,
            fuelProductId,
            saleDate: { gte: start, lte: end },
          },
          _sum: { litresSold: true, totalAmount: true },
          _count: { id: true },
        }),
        prisma.fuelStock.aggregate({
          where: {
            organisationId,
            fuelProductId,
            deliveryDate: { lt: start },
          },
          _sum: { quantityLitres: true },
        }),
        prisma.fuelSale.aggregate({
          where: {
            organisationId,
            fuelProductId,
            saleDate: { lt: start },
          },
          _sum: { litresSold: true },
        }),
        prisma.fuelStock.aggregate({
          where: {
            organisationId,
            fuelProductId,
            deliveryDate: { gte: start, lte: end },
          },
          _sum: { quantityLitres: true },
        }),
      ]);

    const openingStock =
      (stockInBefore._sum.quantityLitres ?? 0) -
      (stockOutBefore._sum.litresSold ?? 0);
    const totalLitresSold = salesAgg._sum.litresSold ?? 0;
    const totalRevenue = salesAgg._sum.totalAmount ?? 0;
    const deliveredToday = stockInToday._sum.quantityLitres ?? 0;

    return {
      numberOfSales: salesAgg._count.id,
      totalLitresSold,
      totalRevenue,
      openingStock,
      deliveredToday,
      closingStock: openingStock + deliveredToday - totalLitresSold,
    };
  }

  async getSummaryHistory(organisationId: string) {
    const summaries = await prisma.dailySummary.findMany({
      where: { organisationId },
      include: { fuelProduct: true },
      orderBy: { summaryDate: "desc" },
    });
    return summaries;
  }

  // helper — get start and end of a given day
  private getDayRange(dateString: string) {
    // parse just the date part, ignore any time/timezone info
    const baseDate = dateString ? new Date(dateString) : new Date();

    const year = baseDate.getUTCFullYear();
    const month = baseDate.getUTCMonth();
    const day = baseDate.getUTCDate();

    // construct start and end explicitly in UTC
    const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    return { start, end };
  }
}

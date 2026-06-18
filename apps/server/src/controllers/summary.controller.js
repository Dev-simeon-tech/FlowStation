import prisma from ".././../config/prisma.js";

// helper — get start and end of a given day
const getDayRange = (dateString) => {
  // parse just the date part, ignore any time/timezone info
  const baseDate = dateString ? new Date(dateString) : new Date();

  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();

  // construct start and end explicitly in UTC
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return { start, end };
};

// GET — live summary for a date (calculated on the fly, not saved)
export const getDailySummary = async (req, res) => {
  try {
    const organisationId = req.organisationId;
    const { date } = req.query;
    const { start, end } = getDayRange(date);

    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    const summary = await Promise.all(
      products.map(async (product) => {
        // sales that happened on this day for this fuel type
        const salesAgg = await prisma.fuelSale.aggregate({
          where: {
            organisationId,
            fuelProductId: product.id,
            saleDate: { gte: start, lte: end },
          },
          _sum: { litresSold: true, totalAmount: true },
          _count: { id: true },
        });

        // opening stock = everything delivered/sold BEFORE today started
        const stockInBefore = await prisma.fuelStock.aggregate({
          where: {
            organisationId,
            fuelProductId: product.id,
            deliveryDate: { lt: start },
          },
          _sum: { quantityLitres: true },
        });
        const stockOutBefore = await prisma.fuelSale.aggregate({
          where: {
            organisationId,
            fuelProductId: product.id,
            saleDate: { lt: start },
          },
          _sum: { litresSold: true },
        });
        const openingStock =
          (stockInBefore._sum.quantityLitres || 0) -
          (stockOutBefore._sum.litresSold || 0);

        // stock delivered specifically today
        const stockInToday = await prisma.fuelStock.aggregate({
          where: {
            organisationId,
            fuelProductId: product.id,
            deliveryDate: { gte: start, lte: end },
          },
          _sum: { quantityLitres: true },
        });

        const totalLitresSold = salesAgg._sum.litresSold || 0;
        const totalRevenue = salesAgg._sum.totalAmount || 0;
        const deliveredToday = stockInToday._sum.quantityLitres || 0;
        const closingStock = openingStock + deliveredToday - totalLitresSold;

        return {
          fuelProductId: product.id,
          fuelProductName: product.name,
          fuelType: product.type,
          numberOfSales: salesAgg._count.id,
          totalLitresSold,
          totalRevenue,
          openingStock,
          deliveredToday,
          closingStock,
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

    res.json({
      date: start.toISOString().split("T")[0],
      perFuelType: summary,
      totals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate daily summary" });
  }
};

// POST — calculate AND save the summary permanently (e.g. end-of-day close-out)
export const generateDailySummary = async (req, res) => {
  try {
    const organisationId = req.organisationId;
    const { date } = req.body;
    const { start, end } = getDayRange(date);

    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    const savedSummaries = [];

    for (const product of products) {
      const salesAgg = await prisma.fuelSale.aggregate({
        where: {
          organisationId,
          fuelProductId: product.id,
          saleDate: { gte: start, lte: end },
        },
        _sum: { litresSold: true, totalAmount: true },
      });

      const stockInBefore = await prisma.fuelStock.aggregate({
        where: {
          organisationId,
          fuelProductId: product.id,
          deliveryDate: { lt: start },
        },
        _sum: { quantityLitres: true },
      });
      const stockOutBefore = await prisma.fuelSale.aggregate({
        where: {
          organisationId,
          fuelProductId: product.id,
          saleDate: { lt: start },
        },
        _sum: { litresSold: true },
      });
      const stockInToday = await prisma.fuelStock.aggregate({
        where: {
          organisationId,
          fuelProductId: product.id,
          deliveryDate: { gte: start, lte: end },
        },
        _sum: { quantityLitres: true },
      });

      const openingStock =
        (stockInBefore._sum.quantityLitres || 0) -
        (stockOutBefore._sum.litresSold || 0);
      const totalLitresSold = salesAgg._sum.litresSold || 0;
      const totalRevenue = salesAgg._sum.totalAmount || 0;
      const closingStock =
        openingStock +
        (stockInToday._sum.quantityLitres || 0) -
        totalLitresSold;

      // upsert — overwrite if a summary for this date+product already exists
      const summary = await prisma.dailySummary.upsert({
        where: {
          organisationId_summaryDate_fuelProductId: {
            organisationId,
            summaryDate: start,
            fuelProductId: product.id,
          },
        },
        update: { totalLitresSold, totalRevenue, openingStock, closingStock },
        create: {
          organisationId,
          fuelProductId: product.id,
          summaryDate: start,
          totalLitresSold,
          totalRevenue,
          openingStock,
          closingStock,
        },
      });

      savedSummaries.push(summary);
    }

    res
      .status(201)
      .json({ message: "Daily summary saved", summaries: savedSummaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save daily summary" });
  }
};

// GET — history of all previously saved summaries (for charts/reports)
export const getSummaryHistory = async (req, res) => {
  try {
    const summaries = await prisma.dailySummary.findMany({
      where: { organisationId: req.organisationId },
      include: { fuelProduct: true },
      orderBy: { summaryDate: "desc" },
    });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary history" });
  }
};

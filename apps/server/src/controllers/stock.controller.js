import prisma from "../../config/prisma.js";

// GET all delivery records — for Stock Entry history view
export const getAllStockEntries = async (req, res) => {
  try {
    const stocks = await prisma.fuelStock.findMany({
      where: { organisationId: req.organisationId },
      include: {
        fuelProduct: true,
        supplier: true,
      },
      orderBy: { deliveryDate: "desc" },
    });
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stock entries" });
  }
};

// GET single delivery — for viewing/editing one record
export const getStockById = async (req, res) => {
  try {
    const stock = await prisma.fuelStock.findFirst({
      where: {
        id: parseInt(req.params.id),
        organisationId: req.organisationId, // ensures it belongs to this station
      },
      include: { fuelProduct: true, supplier: true },
    });

    if (!stock)
      return res.status(404).json({ message: "Stock entry not found" });

    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock entry" });
  }
};

// POST — record a new delivery (this is what increases stock)
export const createStockEntry = async (req, res) => {
  try {
    const {
      fuelProductId,
      supplierId,
      quantityLitres,
      costPerLitre,
      invoiceNumber,
      deliveryDate,
    } = req.body;

    // basic validation
    if (!fuelProductId || !supplierId || !quantityLitres || !costPerLitre) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (quantityLitres <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than zero" });
    }

    const stock = await prisma.fuelStock.create({
      data: {
        organisationId: req.organisationId,
        fuelProductId,
        supplierId,
        quantityLitres,
        costPerLitre,
        invoiceNumber,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      },
      include: { fuelProduct: true, supplier: true },
    });

    res.status(201).json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to record stock entry" });
  }
};

// GET stock balance — calculated, not stored: deliveries minus sales
export const getStockBalance = async (req, res) => {
  try {
    const organisationId = req.organisationId;

    // get every fuel product for this station
    const products = await prisma.fuelProduct.findMany({
      where: { organisationId },
    });

    const balances = await Promise.all(
      products.map(async (product) => {
        // sum all deliveries for this fuel type
        const totalIn = await prisma.fuelStock.aggregate({
          where: { organisationId, fuelProductId: product.id },
          _sum: { quantityLitres: true },
        });

        // sum all sales for this fuel type
        const totalOut = await prisma.fuelSale.aggregate({
          where: { organisationId, fuelProductId: product.id },
          _sum: { litresSold: true },
        });

        const stockIn = totalIn._sum.quantityLitres || 0;
        const stockOut = totalOut._sum.litresSold || 0;

        return {
          fuelProductId: product.id,
          fuelProductName: product.name,
          fuelType: product.type,
          totalDelivered: stockIn,
          totalSold: stockOut,
          currentBalance: stockIn - stockOut,
        };
      }),
    );

    res.json(balances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to calculate stock balance" });
  }
};

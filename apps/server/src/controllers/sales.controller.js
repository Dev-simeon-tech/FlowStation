import prisma from "../../config/prisma.js";

// GET all sales — for Sales history / reports
export const getAllSales = async (req, res) => {
  try {
    const sales = await prisma.fuelSale.findMany({
      where: { organisationId: req.organisationId },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
      orderBy: { saleDate: "desc" },
    });
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

// GET single sale
export const getSaleById = async (req, res) => {
  try {
    const sale = await prisma.fuelSale.findFirst({
      where: {
        id: parseInt(req.params.id),
        organisationId: req.organisationId,
      },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
    });

    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sale" });
  }
};

// POST — record a sale (this is what reduces stock)
export const createSale = async (req, res) => {
  try {
    const organisationId = req.organisationId;
    const {
      fuelProductId,
      attendantId,
      customerId, // optional — null for walk-in
      litresSold,
      paymentMethod,
      isPaid, // boolean — whether to also create a Payment record
    } = req.body;

    // 1. basic validation
    if (!fuelProductId || !attendantId || !litresSold || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (litresSold <= 0) {
      return res
        .status(400)
        .json({ message: "Litres sold must be greater than zero" });
    }

    // 2. confirm the fuel product belongs to this organisation, get current price
    const fuelProduct = await prisma.fuelProduct.findFirst({
      where: { id: fuelProductId, organisationId },
    });
    if (!fuelProduct) {
      return res.status(404).json({ message: "Fuel product not found" });
    }

    // 3. confirm attendant belongs to this organisation and is active
    const attendant = await prisma.attendant.findFirst({
      where: { id: attendantId, organisationId },
    });
    if (!attendant) {
      return res.status(404).json({ message: "Attendant not found" });
    }
    if (!attendant.isActive) {
      return res.status(400).json({ message: "Attendant is not active" });
    }

    // 4. check stock availability — sum deliveries minus sum sales
    const totalIn = await prisma.fuelStock.aggregate({
      where: { organisationId, fuelProductId },
      _sum: { quantityLitres: true },
    });
    const totalOut = await prisma.fuelSale.aggregate({
      where: { organisationId, fuelProductId },
      _sum: { litresSold: true },
    });
    const currentBalance =
      (totalIn._sum.quantityLitres || 0) - (totalOut._sum.litresSold || 0);

    if (litresSold > currentBalance) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${currentBalance}L, requested: ${litresSold}L`,
      });
    }

    // 5. calculate total using CURRENT price (frozen onto the sale record)
    const unitPrice = fuelProduct.pricePerLitre;
    const totalAmount = unitPrice * litresSold;

    // 6. create sale + payment together in one transaction
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.fuelSale.create({
        data: {
          organisationId,
          fuelProductId,
          attendantId,
          customerId: customerId || null,
          litresSold,
          unitPrice,
          totalAmount,
          paymentMethod,
        },
      });

      let payment = null;
      if (isPaid) {
        payment = await tx.payment.create({
          data: {
            organisationId,
            fuelSaleId: sale.id,
            amountPaid: totalAmount,
            method: paymentMethod,
          },
        });
      }

      return { sale, payment };
    });

    // 7. return sale with relations populated
    const fullSale = await prisma.fuelSale.findUnique({
      where: { id: result.sale.id },
      include: {
        fuelProduct: true,
        attendant: true,
        customer: true,
        payment: true,
      },
    });

    res.status(201).json(fullSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to record sale" });
  }
};

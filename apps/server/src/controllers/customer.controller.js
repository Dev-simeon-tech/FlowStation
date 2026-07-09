import prisma from "../../config/prisma.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { organisationId: req.organisationId },
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, plateNumber, customerType } = req.body;
    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        plateNumber,
        customerType: customerType ? customerType : "WALK_IN",
        organisationId: req.organisationId,
      },
    });
    res
      .status(201)
      .json({ message: "Customer created Successfully", ...customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editCustomer = async (req, res) => {
  try {
    const { fullName, phone, plateNumber, customerType } = req.body;
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        organisationId: req.organisationId,
        id: parseInt(req.params.id),
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ message: "Customer does not exist" });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { organisationId: req.organisationId, id: existingCustomer.id },
      data: { fullName, plateNumber, phone, customerType },
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getCustomerPurchases = async (req, res) => {
  try {
    const organisationId = req.organisationId;
    const customerId = parseInt(req.params.id);

    // validate customerId is a valid number
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // confirm customer exists and belongs to this organisation
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organisationId },
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // fetch all purchases for this customer
    const purchases = await prisma.fuelSale.findMany({
      where: { customerId, organisationId },
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

    // calculate summary stats for this customer
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalLitresBought = purchases.reduce(
      (sum, p) => sum + p.litresSold,
      0,
    );

    // break down spending per fuel type
    const spendingByFuelType = purchases.reduce((acc, purchase) => {
      const key = purchase.fuelProduct.type;
      if (!acc[key]) {
        acc[key] = {
          fuelProductName: purchase.fuelProduct.name,
          fuelType: purchase.fuelProduct.type,
          totalLitres: 0,
          totalSpent: 0,
          numberOfPurchases: 0,
        };
      }
      acc[key].totalLitres += purchase.litresSold;
      acc[key].totalSpent += purchase.totalAmount;
      acc[key].numberOfPurchases += 1;
      return acc;
    }, {});

    res.json({
      customer,
      summary: {
        totalPurchases: purchases.length,
        totalLitresBought,
        totalSpent,
        spendingByFuelType: Object.values(spendingByFuelType),
      },
      purchases,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch customer purchases" });
  }
};

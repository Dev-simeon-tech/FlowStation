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
    await prisma.customer.create({
      data: {
        fullName,
        phone,
        plateNumber,
        customerType: customerType ? customerType : "WALK_IN",
        organisationId: req.organisationId,
      },
    });
    res.status(201).json({ message: "Customer created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

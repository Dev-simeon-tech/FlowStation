import prisma from "../../config/prisma.js";

export const getFuelProducts = async (req, res) => {
  try {
    const fuelProducts = await prisma.fuelProduct.findMany({
      where: { organisationId: req.organisationId },
    });

    res.status(200).json(fuelProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const setupFuelProduct = async (req, res) => {
  try {
    const { name, type, pricePerLitre } = req.body;
    await prisma.fuelProduct.create({
      data: {
        name,
        type,
        pricePerLitre,
        organisationId: req.organisationId,
      },
    });

    res.status(201).json({ message: "Fuel product created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateFuelProduct = async (req, res) => {
  try {
    const { pricePerLitre } = req.body;
    const existingFuelProduct = await prisma.fuelProduct.findUnique({
      where: {
        id: parseInt(req.params.id),
        organisationId: req.organisationId,
      },
    });
    if (!existingFuelProduct) {
      return res.status(404).json({ message: "fuel product does not exist" });
    }
    const newFuelProduct = await prisma.fuelProduct.update({
      where: { id: existingFuelProduct.id },
      data: { pricePerLitre },
    });
    res.status(200).json(newFuelProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

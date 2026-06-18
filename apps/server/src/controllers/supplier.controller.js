import prisma from "../../config/prisma.js";

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { organisationId: req.organisationId },
    });

    const suppliersWithFuelTypes = await Promise.all(
      suppliers.map(async (supplier) => {
        const fuelTypes = await prisma.supplierFuelType.findMany({
          where: { supplierId: supplier.id },
        });
        return {
          ...supplier,
          fuelTypes,
        };
      }),
    );
    res.status(200).json(suppliersWithFuelTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { companyName, email, phone, contactPerson, fuelProductId, address } =
      req.body;

    const supplier = await prisma.supplier.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        organisationId: req.organisationId,
      },
    });

    await prisma.supplierFuelType.createMany({
      data: { supplierId: supplier.id, fuelProductId },
      skipDuplicates: true,
    });

    res.status(201).json({ message: "Supplier created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplierId = parseInt(id);

    // ensure supplier exists and belongs to the organisation
    const existing = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!existing || existing.organisationId !== req.organisationId) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // delete dependent rows first to avoid foreign-key RESTRICT errors
    await prisma.supplierFuelType.deleteMany({ where: { supplierId } });

    await prisma.supplier.delete({ where: { id: supplierId } });
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

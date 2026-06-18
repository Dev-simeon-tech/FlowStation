import prisma from "../../config/prisma.js";

export const getAttendants = async (req, res) => {
  try {
    const attendants = await prisma.attendant.findMany({
      where: { organisationId: req.organisationId },
    });
    res.status(200).json(attendants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createAttendant = async (req, res) => {
  try {
    const { fullName, employeeId, phone, pumpAssigned } = req.body;
    const attendant = await prisma.attendant.create({
      data: {
        fullName,
        employeeId,
        phone,
        pumpAssigned,
        organisationId: req.organisationId,
      },
    });
    res.status(201).json(attendant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

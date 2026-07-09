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

export const editAttendant = async (req, res) => {
  try {
    const { fullName, employeeId, phone, pumpAssigned } = req.body;
    const existingAttendant = await prisma.attendant.findUnique({
      where: {
        organisationId: req.organisationId,
        id: parseInt(req.params.id),
      },
    });

    if (!existingAttendant) {
      return res.status(404).json({ message: "attendant does not exist" });
    }

    const updatedAttendant = await prisma.attendant.update({
      where: { organisationId: req.organisationId, id: existingAttendant.id },
      data: { fullName, employeeId, phone, pumpAssigned },
    });

    res.status(200).json(updatedAttendant);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editAttendantStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const existingAttendant = await prisma.attendant.findUnique({
      where: {
        organisationId: req.organisationId,
        id: parseInt(req.params.id),
      },
    });

    if (!existingAttendant) {
      return res.status(404).json({ message: "attendant does not exist" });
    }

    const updatedAttendant = await prisma.attendant.update({
      where: { organisationId: req.organisationId, id: existingAttendant.id },
      data: { isActive },
    });
    res.status(200).json(updatedAttendant);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

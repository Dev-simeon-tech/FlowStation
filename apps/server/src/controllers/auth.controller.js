import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";

export const register = async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;

    // check if email already taken
    const existing = await prisma.organisation.findUnique({
      where: { email },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the organisation
    const organisation = await prisma.organisation.create({
      data: {
        name,
        address,
        phone,
        email,
        password: hashedPassword,
      },
    });

    // sign JWT immediately so they are logged in after registering
    const token = jwt.sign(
      { organisationId: organisation.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.status(201).json({
      message: "Organisation registered successfully",
      token,
      organisation: {
        id: organisation.id,
        name: organisation.name,
        email: organisation.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN — verify and return token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // find the organisation by email
    const organisation = await prisma.organisation.findUnique({
      where: { email },
    });

    // check it exists and password matches
    if (
      !organisation ||
      !(await bcrypt.compare(password, organisation.password))
    ) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // sign JWT
    const token = jwt.sign(
      { organisationId: organisation.id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.status(200).json({
      token,
      organisation: {
        id: organisation.id,
        name: organisation.name,
        email: organisation.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login" });
  }
};

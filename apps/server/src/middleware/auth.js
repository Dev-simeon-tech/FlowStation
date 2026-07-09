import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.organisationId = decoded.organisationId; // available in every controller
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;

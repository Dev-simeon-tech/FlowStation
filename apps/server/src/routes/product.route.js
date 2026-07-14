import express from "express";
import {
  getFuelProducts,
  setupFuelProduct,
  updateFuelProduct,
  deleteFuelProduct,
} from "../controllers/product.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("", protect, getFuelProducts);
router.post("/setup", protect, setupFuelProduct);
router.put("/edit/:id", protect, updateFuelProduct);
router.delete("/:id", protect, deleteFuelProduct);

export default router;

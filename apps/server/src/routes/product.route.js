import express from "express";
import {
  getFuelProducts,
  setupFuelProduct,
  updateFuelProduct,
} from "../controllers/product.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("", protect, getFuelProducts);
router.post("/setup", protect, setupFuelProduct);
router.post("/edit/:id", protect, updateFuelProduct);

export default router;
